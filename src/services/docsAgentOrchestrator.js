/**
 * docsAgentOrchestrator.js
 * 
 * Layer 5: Capability Discovery & Orchestration
 * 
 * Filters tools dynamically based on context to minimize prompt token footprint.
 * Orchestrates multi-step tool execution sequences with automatic rollback on failure.
 */

import { CANONICAL_DOCS_TOOLS, DOCS_TOOL_CATEGORIES } from './docsToolRegistry.js';
import { executeTool, undoTransaction } from './docsToolExecutor.js';

/**
 * Filter tools by task context to optimize prompt size and prevent tool confusion.
 * 
 * @param {object} filterOptions - { context: 'all'|'editing'|'analysis'|'formatting'|'commands' }
 */
export const getAvailableTools = (filterOptions = {}) => {
  const { context = 'all' } = filterOptions;

  if (context === 'all') return CANONICAL_DOCS_TOOLS;

  switch (context) {
    case 'editing':
    case 'formatting':
      return CANONICAL_DOCS_TOOLS.filter(t => t.category === DOCS_TOOL_CATEGORIES.DOCUMENT_TOOLS);
    case 'analysis':
      return CANONICAL_DOCS_TOOLS.filter(t => t.category === DOCS_TOOL_CATEGORIES.ANALYSIS_TOOLS);
    case 'commands':
      return CANONICAL_DOCS_TOOLS.filter(t => t.category === DOCS_TOOL_CATEGORIES.APPLICATION_COMMANDS);
    default:
      return CANONICAL_DOCS_TOOLS;
  }
};

/**
 * Execute a sequential array of tool invocations.
 * Automatically rolls back prior mutations if a step fails when rollbackOnFailure is true.
 * 
 * @param {Array<{toolName: string, params: object}>} toolCalls - Array of tool call definitions.
 * @param {object} documentContext - Document context payload.
 * @param {object} options - Options { rollbackOnFailure: boolean, dryRun: boolean }.
 */
export const executeSequence = async (toolCalls = [], documentContext = {}, options = {}) => {
  const { rollbackOnFailure = true, dryRun = false } = options;
  const results = [];
  const completedTransactions = [];

  for (let i = 0; i < toolCalls.length; i++) {
    const call = toolCalls[i];
    const res = await executeTool(call.toolName, call.params, documentContext, { dryRun });
    results.push(res);

    if (res.success && res.transactionId) {
      completedTransactions.push(res.transactionId);
    }

    if (!res.success) {
      // Step failed
      if (rollbackOnFailure && completedTransactions.length > 0 && !dryRun) {
        console.warn(`[DocsOrchestrator] Step ${i + 1} (${call.toolName}) failed. Rolling back ${completedTransactions.length} transaction(s)...`);
        for (const txId of [...completedTransactions].reverse()) {
          await undoTransaction(txId);
        }
      }

      return {
        success: false,
        failedStepIndex: i,
        failedToolName: call.toolName,
        stepsCompleted: i,
        totalSteps: toolCalls.length,
        rolledBack: rollbackOnFailure && completedTransactions.length > 0,
        results
      };
    }
  }

  return {
    success: true,
    stepsCompleted: toolCalls.length,
    totalSteps: toolCalls.length,
    completedTransactions,
    results
  };
};
