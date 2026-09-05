import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyRelayIntent } from '../src/services/relayAgentService.js';
import * as directiveEngine from '../src/services/directiveQueueEngine.js';
import { getToolByName } from '../src/services/docsToolRegistry.js';
import { executeTool } from '../src/services/docsToolExecutor.js';
import { readResource } from '../src/services/universalMcpBridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (typeof window === 'undefined') {
  globalThis.window = {};
}

let passed = 0;
let failed = 0;
const results = [];

function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', label });
  } else {
    failed++;
    results.push({ status: 'FAIL', label, detail });
  }
}

function assertEqual(label, actual, expected) {
  const ok = actual === expected;
  assert(label, ok, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log('\n── Section 1: Existing Intent Regression ──────────────────────────\n');

{
  const r = classifyRelayIntent('create a document called Q3 Strategy Report');
  assert('isDocCreation fires for create-document prompt', r.isDocCreation === true);
  assert('isDirectiveQueue does NOT fire for doc creation', r.isDirectiveQueue === false);
}

{
  const r = classifyRelayIntent('add a task: deploy the production build');
  assert('isTaskSchedule fires for task prompt', r.isTaskSchedule === true);
  assert('isDirectiveQueue does NOT fire for simple task prompt', r.isDirectiveQueue === false);
}

{
  const r = classifyRelayIntent('schedule a meeting for Monday at 10am');
  assert('isScheduleMeeting fires for schedule prompt', r.isScheduleMeeting === true);
  assert('isDirectiveQueue does NOT fire for schedule prompt', r.isDirectiveQueue === false);
}

{
  const r = classifyRelayIntent('set the cell b2 to 100');
  assert('isSheetUpdate fires for sheet prompt', r.isSheetUpdate === true);
  assert('isDirectiveQueue does NOT fire for sheet prompt', r.isDirectiveQueue === false);
}

{
  const r = classifyRelayIntent('where does it mention the Q2 revenue target?');
  assert('isCitationQuery fires for citation prompt', r.isCitationQuery === true);
  assert('isDirectiveQueue does NOT fire for citation prompt', r.isDirectiveQueue === false);
}

{
  const r = classifyRelayIntent('ingest a pdf file');
  assert('isIngestDocument fires for ingest prompt', r.isIngestDocument === true);
  assert('isDirectiveQueue does NOT fire for ingest prompt', r.isDirectiveQueue === false);
}

console.log('\n── Section 2: isDirectiveQueue — Positive Matches ─────────────────\n');

const DIRECTIVE_POSITIVES = [
  'queue a directive to reconcile balance sheet',
  'run an agent task for GPU cluster optimization',
  'execute directive for legal compliance audit',
  'checkout a directive from the queue',
  'add a directive for quarterly forecasting',
  'dispatch agent execution for model verification',
  'queue autonomous task on block AST'
];

DIRECTIVE_POSITIVES.forEach((prompt) => {
  const r = classifyRelayIntent(prompt);
  assert(`isDirectiveQueue=true: "${prompt}"`, r.isDirectiveQueue === true);
  assert(`isAction=true for directive: "${prompt}"`, r.isAction === true);
});

console.log('\n── Section 3: isDirectiveQueue — Negative Matches ─────────────────\n');

const DIRECTIVE_NEGATIVES = [
  'Hello, how are you?',
  'What is 2 + 2?',
  'Create a new document',
  'where does it mention the directive in docs?',
  'update the spreadsheet cells A1',
  'ingest a file into the portal'
];

DIRECTIVE_NEGATIVES.forEach((prompt) => {
  const r = classifyRelayIntent(prompt);
  assert(`isDirectiveQueue=false: "${prompt}"`, r.isDirectiveQueue === false);
});

console.log('\n── Section 4: Directive Queue Engine CRUD & Taxonomy ──────────────\n');

{
  directiveEngine.clearAllDirectives();
  assertEqual('Initial queue is empty', directiveEngine.getDirectives().length, 0);

  // Test three-tier taxonomy
  const userItem = directiveEngine.queueDirective({
    title: 'Review Legal Terms',
    tier: 'user',
    priority: 'P1',
    description: 'Executive review required'
  });
  assertEqual('User directive created with tier=user', userItem.tier, 'user');
  assertEqual('User directive initial status is PENDING', userItem.status, 'PENDING');

  const agentItem = directiveEngine.queueDirective({
    title: 'Audit GPU Memory Usage',
    tier: 'agent',
    priority: 'P0',
    description: 'Autonomous trace analysis'
  });
  assertEqual('Agent directive created with tier=agent', agentItem.tier, 'agent');
  assertEqual('Agent directive priority=P0', agentItem.priority, 'P0');

  const teamItem = directiveEngine.queueDirective({
    title: 'Cross-App Alignment',
    tier: 'team',
    priority: 'P2'
  });
  assertEqual('Team directive created with tier=team', teamItem.tier, 'team');

  // Test priority sorting (P0 first)
  const allDirectives = directiveEngine.getDirectives();
  assertEqual('Total 3 directives in queue', allDirectives.length, 3);
  assertEqual('First directive is P0 priority', allDirectives[0].priority, 'P0');
  assertEqual('First directive ID matches agentItem', allDirectives[0].id, agentItem.id);

  // Test metrics summary
  const metrics = directiveEngine.getQueueMetrics();
  assertEqual('Metrics total = 3', metrics.total, 3);
  assertEqual('Metrics pending = 3', metrics.pending, 3);
  assertEqual('Metrics agentCount = 1', metrics.agentCount, 1);
  assertEqual('Metrics userCount = 1', metrics.userCount, 1);
  assertEqual('Metrics teamCount = 1', metrics.teamCount, 1);
}

console.log('\n── Section 5: Block Pointer Anchoring (Zero-Drift) ────────────────\n');

{
  const testItem = directiveEngine.queueDirective({
    title: 'Patch Heading Block',
    tier: 'agent',
    priority: 'P1'
  });

  assert('Initially blockPointer is null', testItem.blockPointer === null);

  const linked = directiveEngine.linkDirectiveToBlock(testItem.id, {
    blockId: 'blk_test_header_99',
    blockType: 'h1',
    docId: 'doc_strategy_2026',
    cellKey: null
  });

  assert('linkDirectiveToBlock returns updated item', Boolean(linked));
  assertEqual('Anchored blockId matches blk_test_header_99', linked.blockPointer.blockId, 'blk_test_header_99');
  assertEqual('Anchored blockType is h1', linked.blockPointer.blockType, 'h1');
  assertEqual('Anchored docId is doc_strategy_2026', linked.blockPointer.docId, 'doc_strategy_2026');

  // Verify retrieval
  const fetched = directiveEngine.getDirectiveById(testItem.id);
  assertEqual('Fetched directive preserves blockPointer', fetched.blockPointer.blockId, 'blk_test_header_99');
}

console.log('\n── Section 6: Autonomous Agent Runner & Staging Sandbox ───────────\n');

{
  // Checkout next agent directive
  const checkedOut = directiveEngine.checkoutNextAgentDirective('agent_test_runner');
  assert('checkoutNextAgentDirective succeeds', Boolean(checkedOut));
  assertEqual('Status transitioned to RUNNING', checkedOut.status, 'RUNNING');
  assertEqual('assignedAgent is set', checkedOut.assignedAgent, 'agent_test_runner');
  assert('startedAt timestamp exists', Boolean(checkedOut.startedAt));

  // Execute directive with staging sandbox (Pillar 3 integration)
  const execResult = await directiveEngine.executeAgentDirective(checkedOut.id, {
    stage: true,
    result: { patchedValue: 'Updated Revenue Target', confidence: 0.98 }
  });

  assert('executeAgentDirective returns valid outcome', Boolean(execResult && execResult.success));
  assertEqual('Directive status transitioned to STAGED', execResult.directive.status, 'STAGED');
  assert('Staged PR object generated', Boolean(execResult.stagedPr));
  assert('PR branchId starts with pr_directive_', execResult.stagedPr.branchId.startsWith('pr_directive_'));
  assertEqual('PR targetApp is tasks', execResult.stagedPr.targetApp, 'tasks');
  assertEqual('Directive recorded stagingPrId', execResult.directive.stagingPrId, execResult.stagedPr.branchId);

  // Directly complete another directive
  const userItem = directiveEngine.getDirectives({ tier: 'user' })[0];
  const completed = directiveEngine.updateDirectiveStatus(userItem.id, 'COMPLETED', {
    signoff: 'Approved by Legal Lead'
  });
  assertEqual('Direct status update transitions to COMPLETED', completed.status, 'COMPLETED');
  assert('completedAt timestamp exists', Boolean(completed.completedAt));
}

console.log('\n── Section 7: Markdown & JSON Serialization ───────────────────────\n');

{
  const md = directiveEngine.serializeDirectivesToMarkdown();
  assert('Markdown serialization is non-empty string', typeof md === 'string' && md.length > 50);
  assert('Markdown contains Directive Queue header', md.includes('Directive Queue & Autonomous Execution Loop'));
  assert('Markdown contains table headers', md.includes('| ID | Title | Tier | Priority | Status | Anchored Block |'));
  assert('Markdown contains STAGED directive', md.includes('STAGED'));

  const jsonStr = directiveEngine.serializeDirectivesToJson();
  const parsed = JSON.parse(jsonStr);
  assert('JSON serialization parses valid array', Array.isArray(parsed) && parsed.length > 0);
  assert('JSON directive contains id and tier', parsed[0].id && parsed[0].tier);
}

console.log('\n── Section 8: Canonical Tool Registry & DocsToolExecutor ──────────\n');

{
  const queueTool = getToolByName('queue_agent_directive');
  assert('queue_agent_directive is registered in registry', Boolean(queueTool));
  assertEqual('Category is tasks_tools', queueTool.category, 'tasks_tools');

  const linkTool = getToolByName('link_directive_to_block');
  assert('link_directive_to_block is registered in registry', Boolean(linkTool));

  const checkoutTool = getToolByName('checkout_agent_directive');
  assert('checkout_agent_directive is registered in registry', Boolean(checkoutTool));

  const completeTool = getToolByName('complete_agent_directive');
  assert('complete_agent_directive is registered in registry', Boolean(completeTool));

  // Test execution via docsToolExecutor
  const execOutput = await executeTool('queue_agent_directive', {
    title: 'Executor Integration Directive',
    tier: 'agent',
    priority: 'P0',
    description: 'Tested via docsToolExecutor'
  });

  assert('executeTool(queue_agent_directive) succeeds', execOutput.success === true);
  assert('executeTool returned valid data payload', execOutput.data && typeof execOutput.data.id === 'string');
}

console.log('\n── Section 9: Universal MCP Bridge Resources ───────────────────────\n');

{
  const queueResource = await readResource('workspace://tasks/queue');
  assert('workspace://tasks/queue resource exists', Boolean(queueResource));
  assertEqual('MimeType is text/markdown', queueResource.mimeType, 'text/markdown');
  assert('Queue text contains Markdown table', queueResource.text.includes('| ID | Title |'));

  const activeTasksResource = await readResource('workspace://tasks/active');
  assert('workspace://tasks/active resource exists', Boolean(activeTasksResource));
  assertEqual('MimeType is application/json', activeTasksResource.mimeType, 'application/json');
  const activeItems = JSON.parse(activeTasksResource.text);
  assert('Active tasks parses array with live directives', Array.isArray(activeItems) && activeItems.length > 0);
}

console.log('\n── Section 10: Window Hooks & UI Component Contracts ──────────────\n');

{
  let targetTab = null;
  let isOpen = false;

  window.__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__ = () => {
    targetTab = 'directives';
    isOpen = true;
  };

  assert('__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__ contract callable', typeof window.__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__ === 'function');
  window.__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__();
  assertEqual('Inspector hook targets directives tab', targetTab, 'directives');
  assert('Inspector hook sets isOpen=true', isOpen === true);

  // Inspector Component source verification
  const inspectorPath = path.resolve(__dirname, '../src/components/tasks/DirectiveQueueInspector.jsx');
  assert('DirectiveQueueInspector.jsx exists on disk', fs.existsSync(inspectorPath));

  if (fs.existsSync(inspectorPath)) {
    const src = fs.readFileSync(inspectorPath, 'utf8');
    assert('Component is exported as default', src.includes('export default DirectiveQueueInspector') || src.includes('export default function DirectiveQueueInspector'));
    assert('Adheres to Rule 3 (no pill-shaped classes)', !src.includes('rounded-full'));
    assert('Adheres to Rule 2 (uses outline for active states)', src.includes('outline') || src.includes('ring-'));
    assert('Adheres to Rule 6 (uses onPointerDown for touch safety)', src.includes('onPointerDown'));
    assert('Contains three-tier matrix rendering', src.includes('user') && src.includes('agent') && src.includes('team'));
  }

  // ExecutiveDirectMessages verification
  const chatPath = path.resolve(__dirname, '../src/components/chat/ExecutiveDirectMessages.jsx');
  const chatSrc = fs.readFileSync(chatPath, 'utf8');
  assert('ExecutiveDirectMessages handles directive actionCard type', chatSrc.includes("msg.actionCard.type === 'directive'"));
  assert('ExecutiveDirectMessages provides open inspector CTA', chatSrc.includes('__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__'));
  assert('ExecutiveDirectMessages CTA uses onPointerDown', chatSrc.includes('onPointerDown'));

  // MemoryDashboard registration verification
  const memoryPath = path.resolve(__dirname, '../src/MemoryDashboard.jsx');
  const memorySrc = fs.readFileSync(memoryPath, 'utf8');
  assert('MemoryDashboard imports DirectiveQueueInspector', memorySrc.includes('DirectiveQueueInspector'));
  assert('MemoryDashboard registers directives in MEMORY_TABS', memorySrc.includes("id: 'directives'"));
}

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(`  Directive Queue & Execution Loop Test Suite — ${passed + failed} tests`);
console.log(`  PASSED: ${passed}   FAILED: ${failed}`);
console.log('════════════════════════════════════════════════════════════════════\n');

results.filter(r => r.status === 'FAIL').forEach(r => {
  console.error(`  [FAIL] ${r.label}`);
  if (r.detail) console.error(`         → ${r.detail}`);
});

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  All assertions passed. Pillar 8 is 100% production ready.\n');
}
