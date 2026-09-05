/**
 * test-llm-provider-loop.mjs
 *
 * Phase 3: Production LLM Provider Abstraction & Dynamic Tool Calling Loop
 * Automated Verification Suite
 *
 * Tests:
 * 1. Provider Tool Schema Adapters (Gemini, Claude, OpenAI, Ollama).
 * 2. Provider API dispatchers and error handling on missing credentials.
 * 3. Deterministic Mock Provider for CI/offline verification.
 * 4. Multi-Turn Autonomous Agent Execution Loop (runAgentExecutionLoop):
 *    - Single-turn text synthesis.
 *    - Dynamic tool calling (Model calls tool -> Tool executes -> State Bus mutates -> Model synthesizes).
 *    - Max turns guardrail.
 * 5. Relay Agent Integration (processRelayAgentMessage).
 * 6. App.jsx global harness contract.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  SUPPORTED_PROVIDERS,
  getActiveAiConfig,
  formatToolsForProvider,
  executeAiTurn,
  runAgentExecutionLoop
} from '../src/services/llmProviderService.js';

import { CANONICAL_DOCS_TOOLS } from '../src/services/docsToolRegistry.js';
import { processRelayAgentMessage } from '../src/services/relayAgentService.js';
import {
  subscribeToAllMutations,
  resetWorkspaceStateBusForTesting
} from '../src/services/workspaceStateBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(message, condition) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

async function runPhase3Tests() {
  console.log('\n================================================================');
  console.log(' PHASE 3: PRODUCTION LLM PROVIDER & TOOL CALLING TEST SUITE');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────
  // Section 1: Provider Tool Schema Formatting
  // ─────────────────────────────────────────────────────────────
  console.log('── Section 1: Provider Tool Schema Adapters ──────────────────');
  
  const sampleTools = CANONICAL_DOCS_TOOLS.slice(0, 5);

  // 1. Google Gemini
  const geminiTools = formatToolsForProvider('gemini', sampleTools);
  assert('Gemini format produces functionDeclarations array', Array.isArray(geminiTools?.functionDeclarations));
  assert('Gemini functionDeclaration has name and description', Boolean(geminiTools.functionDeclarations[0]?.name && geminiTools.functionDeclarations[0]?.description));
  assert('Gemini functionDeclaration has parameters object', typeof geminiTools.functionDeclarations[0]?.parameters === 'object');

  // 2. Anthropic Claude
  const claudeTools = formatToolsForProvider('claude', sampleTools);
  assert('Claude format produces array of tools', Array.isArray(claudeTools));
  assert('Claude tool has input_schema property', Boolean(claudeTools[0]?.input_schema));
  assert('Claude tool name matches', claudeTools[0]?.name === sampleTools[0].name);

  // 3. OpenAI & Ollama
  const openAiTools = formatToolsForProvider('openai', sampleTools);
  assert('OpenAI format produces array of type function', openAiTools[0]?.type === 'function');
  assert('OpenAI function contains name and parameters', Boolean(openAiTools[0]?.function?.name && openAiTools[0]?.function?.parameters));

  const ollamaTools = formatToolsForProvider('ollama', sampleTools);
  assert('Ollama uses OpenAI-compatible tool specifications', ollamaTools[0]?.type === 'function');

  // ─────────────────────────────────────────────────────────────
  // Section 2: Credential Validation & Error Handling
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 2: Provider Credential & Error Handling ───────────');

  // Gemini missing API key
  const geminiNoKey = await executeAiTurn(
    [{ role: 'user', content: 'hello' }],
    sampleTools,
    { provider: 'gemini', geminiApiKey: '' }
  );
  assert('Gemini without key returns error type', geminiNoKey.type === 'error');
  assert('Gemini error reports missing key', geminiNoKey.error.includes('Missing Gemini API Key'));

  // Claude missing API key
  const claudeNoKey = await executeAiTurn(
    [{ role: 'user', content: 'hello' }],
    sampleTools,
    { provider: 'claude', claudeApiKey: '' }
  );
  assert('Claude without key returns error type', claudeNoKey.type === 'error');
  assert('Claude error reports missing key', claudeNoKey.error.includes('Missing Anthropic Claude API Key'));

  // OpenAI missing API key
  const openAiNoKey = await executeAiTurn(
    [{ role: 'user', content: 'hello' }],
    sampleTools,
    { provider: 'openai', openaiApiKey: '' }
  );
  assert('OpenAI without key returns error type', openAiNoKey.type === 'error');
  assert('OpenAI error reports missing key', openAiNoKey.error.includes('Missing API Key'));

  // ─────────────────────────────────────────────────────────────
  // Section 3: Deterministic Mock Provider Turns
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 3: Deterministic Mock Provider Turns ──────────────');

  // Mock text turn
  const mockTextRes = await executeAiTurn(
    [{ role: 'user', content: 'Explain strategic goals' }],
    sampleTools,
    { provider: 'mock' }
  );
  assert('Mock provider returns text response', mockTextRes.type === 'text');
  assert('Mock text contains prompt reference', mockTextRes.content.includes('strategic goals'));

  // Mock explicit tool call behavior
  const mockToolRes = await executeAiTurn(
    [{ role: 'user', content: 'Update block' }],
    sampleTools,
    {
      provider: 'mock',
      mockBehavior: {
        type: 'tool_call',
        toolName: 'patch_block',
        args: { blockId: 'blk_123', content: 'Executive Decision' }
      }
    }
  );
  assert('Mock provider emits tool_call type', mockToolRes.type === 'tool_call');
  assert('Mock tool call has toolCalls array', Array.isArray(mockToolRes.toolCalls));
  assert('Mock tool call name matches patch_block', mockToolRes.toolCalls[0].name === 'patch_block');
  assert('Mock tool call arguments preserved', mockToolRes.toolCalls[0].arguments.blockId === 'blk_123');

  // ─────────────────────────────────────────────────────────────
  // Section 4: Multi-Turn Autonomous Agent Execution Loop
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 4: Multi-Turn Autonomous Agent Execution Loop ────');
  resetWorkspaceStateBusForTesting();

  // Test 1: Single-turn conversational query (no tool calls needed)
  const singleTurnLoop = await runAgentExecutionLoop({
    prompt: 'Provide a brief summary of system architecture',
    aiConfig: {
      provider: 'mock',
      mockBehavior: {
        type: 'text',
        content: 'The Regaarder architecture comprises 10 unified substrate pillars.'
      }
    }
  });

  assert('Single-turn loop succeeds', singleTurnLoop.success === true);
  assert('Single-turn loop completes in 1 turn', singleTurnLoop.turnsCount === 1);
  assert('Single-turn loop executed 0 tools', singleTurnLoop.executedTools.length === 0);
  assert('Single-turn loop contains synthesized reply', singleTurnLoop.replyText.includes('10 unified substrate pillars'));

  // Test 2: Full Multi-Turn Execution Loop (Model calls tool -> Tool executes -> State Bus dispatches -> Model concludes)
  let busEventReceived = null;
  const unsubBus = subscribeToAllMutations((event) => {
    busEventReceived = event;
  });

  const multiTurnLoop = await runAgentExecutionLoop({
    prompt: 'Please draft an executive memo on European Expansion',
    aiConfig: {
      provider: 'mock'
      // Mock provider naturally triggers tool_call on 'draft/memo', then responds with text on tool response
    }
  });

  assert('Multi-turn loop succeeds', multiTurnLoop.success === true);
  assert('Multi-turn loop executed at least 1 tool', multiTurnLoop.executedTools.length >= 1);
  assert('Executed tool is create_document', multiTurnLoop.executedTools[0].toolName === 'create_document');
  assert('Executed tool result is staged', multiTurnLoop.executedTools[0].result.isStaged === true);
  assert('Executed tool has generated prNumber', Boolean(multiTurnLoop.executedTools[0].result.prNumber));
  assert('Multi-turn loop completed in 2 turns', multiTurnLoop.turnsCount === 2);
  assert('Multi-turn replyText contains executive conclusion', multiTurnLoop.replyText.length > 0);

  // Verify that Workspace State Bus was reactively notified by the autonomous execution loop
  assert('State Bus received mutation event from agent loop', busEventReceived !== null);
  assert('State Bus event origin is relay_agent_loop', busEventReceived?.origin === 'relay_agent_loop');
  assert('State Bus event is marked staged', busEventReceived?.isStaged === true);

  unsubBus();

  // Test 3: Guardrail Max Turns Enforcement
  const infiniteToolMock = {
    provider: 'mock',
    mockBehavior: {
      type: 'tool_call',
      toolName: 'get_block_tree',
      args: {}
    }
  };

  const guardedLoop = await runAgentExecutionLoop({
    prompt: 'Keep polling state',
    maxTurns: 3,
    aiConfig: infiniteToolMock
  });

  assert('Guarded loop terminates at maxTurns', guardedLoop.turnsCount === 3);
  assert('Guarded loop executed 3 iterations of tool', guardedLoop.executedTools.length === 3);
  assert('Guarded loop returns fallback summary text', guardedLoop.replyText.includes('Executed 3 action(s)'));

  // ─────────────────────────────────────────────────────────────
  // Section 5: Relay Agent Service Integration
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 5: Relay Agent Service Integration ───────────────');
  resetWorkspaceStateBusForTesting();

  // 1. Relay Agent invoking Mock Provider via options
  const relayResult = await processRelayAgentMessage({
    userPrompt: 'Draft an urgent executive memo on supply chain resilience',
    customProvider: 'mock'
  });

  assert('Relay Agent returns replyText', Boolean(relayResult.replyText));
  assert('Relay Agent generated an actionCard', Boolean(relayResult.actionCard));
  assert('ActionCard title contains tool or document name', Boolean(relayResult.actionCard.title));

  // 2. Offline fallback when no custom provider or onCallAi given for simple query
  const relayOffline = await processRelayAgentMessage({
    userPrompt: 'Remember that gross margins must exceed 45%'
  });
  assert('Relay memory intent remains fully functional', relayOffline.actionCard?.type === 'memory');
  assert('Relay memory preview snippet matches', relayOffline.actionCard?.previewSnippet.includes('gross margins must exceed 45%'));

  // ─────────────────────────────────────────────────────────────
  // Section 6: App.jsx Global Window Harness
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 6: App.jsx Global Window Harness ──────────────────');

  const appPath = path.join(__dirname, '../src/App.jsx');
  const appSource = fs.readFileSync(appPath, 'utf8');

  assert('App.jsx imports llmProviderService', appSource.includes("from './services/llmProviderService'"));
  assert('App.jsx registers window.__REGAARDER_LLM_PROVIDER__', appSource.includes('window.__REGAARDER_LLM_PROVIDER__ = llmProvider;'));
  assert('App.jsx unregisters window.__REGAARDER_LLM_PROVIDER__ on unmount', appSource.includes('delete window.__REGAARDER_LLM_PROVIDER__;'));

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(` PHASE 3 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3Tests().catch(err => {
  console.error('Fatal error in Phase 3 test suite:', err);
  process.exit(1);
});
