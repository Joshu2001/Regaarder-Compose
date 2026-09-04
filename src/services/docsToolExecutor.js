/**
 * docsToolExecutor.js
 *
 * Layer 3: Tool Execution Engine & Transaction Runtime
 *
 * Manages context injection, parameter validation, safety checks, transaction recording,
 * dry-run simulation, undo/redo state restoration, and standard result formatting.
 */

import { getToolByName } from './docsToolRegistry.js';
import * as docsCommandApi from './docsCommandApi.js';
import { stageMutation } from './workspaceStagingEngine.js';

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
 * @param {string} toolName  - Name of the canonical tool to execute.
 * @param {object} params    - Input parameters for the tool.
 * @param {object} context   - Execution context { documentId, workspaceId, selection, mode, permissions }.
 * @param {object} options   - Execution options { dryRun: boolean }.
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

  // 3b. Handle Isolated Staging Mode (Pillar 3 Sandbox Execution)
  if (options.stage && toolDef.mutatesDocument) {
    let beforeText = currentSnapshot.text || '';
    let proposedText = params.text || params.contentHtml || params.replacementText || (params.title ? `# ${params.title}\n\n${beforeText}` : beforeText);
    
    // Surgical block-level diff extraction for Pillar 4
    if (toolName === 'patch_block' && params.blockId) {
      try {
        const tree = docsCommandApi.getBlockTreeSnapshot();
        const blk = tree?.blocks?.find(b => b.id === params.blockId);
        if (blk) {
          beforeText = blk.content || '';
          proposedText = params.content !== undefined ? params.content : beforeText;
        }
      } catch (_e) {}
    } else if (toolName === 'insert_block') {
      beforeText = '';
      proposedText = params.block?.content || '';
    } else if (toolName === 'delete_block' && params.blockId) {
      try {
        const tree = docsCommandApi.getBlockTreeSnapshot();
        const blk = tree?.blocks?.find(b => b.id === params.blockId);
        if (blk) {
          beforeText = blk.content || '';
          proposedText = '';
        }
      } catch (_e) {}
    }

    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: context.targetApp || 'compose',
      entityId: context.entityId || 'ent_doc_active',
      targetTitle: context.targetTitle || (params.blockId ? `Block [${params.blockId}]` : (currentSnapshot.title || 'Active Document')),
      toolName,
      params,
      beforeText,
      afterText: proposedText,
      metadata: { requestId, toolLabel: toolDef.label, destructive: toolDef.destructive, blockId: params.blockId }
    });

    const stagedOutput = {
      success: true,
      isStaged: true,
      toolName,
      requestId,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      message: `[STAGED FOR APPROVAL] Propose changes for "${toolDef.label}" into PR #${stagedResult.prNumber}.`,
      data: stagedResult,
      error: null,
      warnings,
      timestamp: new Date().toISOString()
    };
    executionLogs.push({ ...stagedOutput, durationMs: Date.now() - startTime });
    return stagedOutput;
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
    if (toolDef.mutatesDocument) {
      const afterSnapshot = docsCommandApi.getDocumentSnapshot();
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

/**
 * callAiWithTools — Multi-Turn Agentic Resolution Loop
 *
 * Sends a prompt to the active LLM provider with the canonical tool schemas injected.
 * When the model responds with a function_call (OpenAI/Gemini) or tool_use (Anthropic) block,
 * this loop executes the tool via executeTool(), appends the structured result to the
 * conversation thread, and re-calls the model. Iterates up to maxTurns until the model
 * produces a final plain-text answer.
 *
 * @param {string}   prompt      - User instruction or question to send to the LLM.
 * @param {object}   aiConfig    - Active AI provider config from getSavedAiConfig().
 * @param {string}   toolFilter  - Context filter ('all'|'editing'|'analysis'|'commands').
 * @param {object}   docContext  - Execution context passed through to executeTool calls.
 * @param {object}   options     - { maxTurns: number (default 5), signal: AbortSignal }
 * @returns {Promise<{ answer: string, toolsExecuted: Array }>}
 */
export const callAiWithTools = async (
  prompt,
  aiConfig = {},
  toolFilter = 'all',
  docContext = {},
  options = {}
) => {
  const { maxTurns = 5, signal } = options;

  // Lazy dynamic imports prevent circular dependency at module load time
  const [
    { getAvailableTools },
    { callAiProvider }
  ] = await Promise.all([
    import('./docsAgentOrchestrator.js'),
    import('./orbAiService.js')
  ]);

  const availableTools = getAvailableTools({ context: toolFilter });

  // System prompt that contextualises the LLM within the Regaarder workspace runtime
  const systemPrompt = `You are the Regaarder Executive Workspace AI. You have access to structured tools that read and mutate the user's live workspace — Documents, Spreadsheets, Presentations, Tasks, Rooms, and Research Notes. Always call the appropriate tool to gather real workspace data before answering. After receiving tool results, synthesise a concise, direct executive answer. Never invent data — if a tool returns empty results, report that clearly.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  const toolsExecuted = [];
  let turnCount = 0;

  while (turnCount < maxTurns) {
    turnCount++;

    const providerResult = await callAiProvider(messages, aiConfig, availableTools, { signal });

    // providerResult shape: { type: 'text'|'tool_call', content: string, toolCalls: Array<{name, arguments}>, rawAssistantMessage }
    if (!providerResult) {
      return {
        answer: 'The AI provider returned an empty response. Please check your API key and model settings.',
        toolsExecuted
      };
    }

    if (providerResult.type === 'text') {
      // Final plain-text answer — agentic resolution complete
      return { answer: providerResult.content || '', toolsExecuted };
    }

    if (providerResult.type === 'tool_call' && Array.isArray(providerResult.toolCalls)) {
      // Execute all tool calls the model requested in this turn
      const toolResultMessages = [];

      for (const call of providerResult.toolCalls) {
        let parsedArgs = {};
        try {
          parsedArgs = typeof call.arguments === 'string'
            ? JSON.parse(call.arguments)
            : (call.arguments || {});
        } catch (_) {
          parsedArgs = {};
        }

        const execResult = await executeTool(call.name, parsedArgs, docContext);
        toolsExecuted.push({ toolName: call.name, params: parsedArgs, result: execResult });

        toolResultMessages.push({
          role: 'tool',
          tool_call_id: call.id || call.name,
          name: call.name,
          content: JSON.stringify(execResult.data ?? { success: execResult.success, message: execResult.message })
        });
      }

      // Append the assistant's tool-call turn, then all results, for the next iteration
      messages.push({
        role: 'assistant',
        content: '',
        tool_calls: providerResult.rawAssistantMessage
      });
      messages.push(...toolResultMessages);
      continue;
    }

    // Unknown response shape — exit loop
    break;
  }

  return {
    answer: 'Could not produce a final answer within the allowed number of tool resolution turns.',
    toolsExecuted
  };
};
