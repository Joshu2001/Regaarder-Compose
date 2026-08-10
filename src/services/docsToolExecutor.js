/**
 * docsToolExecutor.js
 * 
 * Layer 3: Tool Execution Engine & Transaction Runtime
 * 
 * Manages context injection, parameter validation, safety checks, transaction recording,
 * dry-run simulation, undo/redo state restoration, and standard result formatting.
 */

import { getToolByName, CANONICAL_DOCS_TOOLS } from './docsToolRegistry.js';
import * as docsCommandApi from './docsCommandApi.js';

// In-memory transaction stack for document state undo/redo tracking
const transactionHistory = [];
const executionLogs = [];

/**
 * Get full transaction history log
 */
export const getTransactionHistory = () => [...transactionHistory];

/**
 * Get full execution log trace
 */
export const getExecutionLogs = () => [...executionLogs];

/**
 * Clear execution history logs
 */
export const clearExecutionLogs = () => {
  executionLogs.length = 0;
  transactionHistory.length = 0;
};

/**
 * Undo a specific transaction by transactionId
 */
export const undoTransaction = async (transactionId) => {
  const index = transactionHistory.findIndex(tx => tx.transactionId === transactionId);
  if (index === -1) {
    return {
      success: false,
      error: { code: 'TRANSACTION_NOT_FOUND', details: `Transaction ID ${transactionId} not found in history.` }
    };
  }

  const tx = transactionHistory[index];
  if (!tx.beforeSnapshot) {
    return {
      success: false,
      error: { code: 'NO_SNAPSHOT', details: `No before snapshot recorded for transaction ${transactionId}.` }
    };
  }

  // Restore snapshot via Document Command API
  const restoreResult = docsCommandApi.replaceRange({
    targetText: '',
    replacementText: tx.beforeSnapshot.text,
    replaceAll: true
  });

  // Mark transaction as undone
  tx.undone = true;
  tx.undoneTimestamp = new Date().toISOString();

  return {
    success: restoreResult.success,
    undoneTransactionId: transactionId,
    message: `Successfully rolled back transaction ${transactionId}`,
    restoredSnapshot: tx.beforeSnapshot
  };
};

/**
 * Execute a canonical tool with full runtime validation, transaction tracking, and dryRun support.
 * 
 * @param {string} toolName - Name of the canonical tool to execute.
 * @param {object} params - Input parameters for the tool.
 * @param {object} context - Execution context { documentId, workspaceId, selection, mode, permissions }.
 * @param {object} options - Execution options { dryRun: boolean }.
 */
export const executeTool = async (toolName, params = {}, context = {}, options = {}) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isDryRun = Boolean(options.dryRun);

  // 1. Resolve Tool Definition
  const toolDef = getToolByName(toolName);
  if (!toolDef) {
    const errResult = {
      success: false,
      toolName,
      requestId,
      transactionId: null,
      message: `Tool "${toolName}" is not registered in Canonical Tool Registry.`,
      data: null,
      error: { code: 'UNKNOWN_TOOL', details: `Tool ${toolName} does not exist.` },
      warnings: [],
      timestamp: new Date().toISOString()
    };
    executionLogs.push({ ...errResult, durationMs: Date.now() - startTime });
    return errResult;
  }

  // 2. Validate Context & Required Selection
  const currentSnapshot = docsCommandApi.getDocumentSnapshot();
  const warnings = [];

  if (toolDef.requiresSelection && !currentSnapshot.hasSelection && !params.targetText) {
    warnings.push('Tool requires text selection. Executing without active selection may apply globally.');
  }

  // 3. Handle Dry-Run Simulation Mode
  if (isDryRun) {
    const dryRunResult = {
      success: true,
      toolName,
      requestId,
      transactionId: null,
      message: `[DRY-RUN SIMULATION] Simulated execution of "${toolDef.label}". No document mutations applied.`,
      data: {
        isDryRun: true,
        toolCategory: toolDef.category,
        mutatesDocument: toolDef.mutatesDocument,
        destructive: toolDef.destructive,
        undoable: toolDef.undoable,
        simulatedParams: params,
        currentDocumentStats: docsCommandApi.getDocumentStats()
      },
      error: null,
      warnings,
      timestamp: new Date().toISOString()
    };
    executionLogs.push({ ...dryRunResult, durationMs: Date.now() - startTime });
    return dryRunResult;
  }

  // 4. Capture Before Snapshot for Mutating Operations
  let beforeSnapshot = null;
  let transactionId = null;

  if (toolDef.mutatesDocument) {
    beforeSnapshot = currentSnapshot;
    transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // 5. Execute Tool Handler
  try {
    const executionOutcome = await toolDef.execute(params, context);
    const durationMs = Date.now() - startTime;

    if (!executionOutcome.success) {
      const failResult = {
        success: false,
        toolName,
        requestId,
        transactionId: null,
        message: executionOutcome.reason || `Execution of tool "${toolName}" failed.`,
        data: null,
        error: { code: 'EXECUTION_FAILED', details: executionOutcome.reason || 'Unknown error' },
        warnings,
        timestamp: new Date().toISOString()
      };
      executionLogs.push({ ...failResult, durationMs });
      return failResult;
    }

    // Capture After Snapshot & Record Transaction
    let afterSnapshot = null;
    if (toolDef.mutatesDocument) {
      afterSnapshot = docsCommandApi.getDocumentSnapshot();
      transactionHistory.push({
        transactionId,
        toolName,
        params,
        timestamp: new Date().toISOString(),
        beforeSnapshot,
        afterSnapshot,
        undone: false
      });
    }

    const successResult = {
      success: true,
      toolName,
      requestId,
      transactionId,
      message: `Successfully executed "${toolDef.label}".`,
      data: executionOutcome.data || executionOutcome,
      error: null,
      warnings,
      timestamp: new Date().toISOString()
    };

    executionLogs.push({ ...successResult, durationMs });
    return successResult;
  } catch (error) {
    const exceptionResult = {
      success: false,
      toolName,
      requestId,
      transactionId: null,
      message: `Exception thrown during execution of "${toolName}": ${error.message}`,
      data: null,
      error: { code: 'UNHANDLED_EXCEPTION', details: error.message, stack: error.stack },
      warnings,
      timestamp: new Date().toISOString()
    };
    executionLogs.push({ ...exceptionResult, durationMs: Date.now() - startTime });
    return exceptionResult;
  }
};
