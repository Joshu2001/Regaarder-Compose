/**
 * test-workspace-state-bus.mjs
 * 
 * Phase 1 Verification Suite: End-to-End Reactive Workspace State Bus
 * 
 * Validates zero-latency cross-application state dispatch, multi-app
 * event filtering, audit trail recording, and automatic propagation from Room.
 */

import { 
  dispatchWorkspaceMutation, 
  subscribeToWorkspaceApp, 
  subscribeToAllMutations, 
  syncCrossAppIntent, 
  getWorkspaceLiveState, 
  updateAppState, 
  getMutationAuditLog, 
  resetWorkspaceStateBusForTesting, 
  WORKSPACE_APP_CHANNELS, 
  WORKSPACE_MUTATION_ACTIONS 
} from '../src/services/workspaceStateBus.js';

import { 
  mutateWorkspaceFromIntent, 
  classifySpeechIntent, 
  EPISTEMIC_INTENT_TYPES 
} from '../src/services/roomObserverEngine.js';

let passed = 0;
let failed = 0;

function assert(description, condition, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${extraInfo ? `— ${extraInfo}` : ''}`);
    failed++;
  }
}

function assertEqual(description, actual, expected) {
  assert(description, actual === expected, `Expected: "${expected}", Received: "${actual}"`);
}

console.log('\n================================================================');
console.log(' PHASE 1: REACTIVE WORKSPACE STATE BUS AUTOMATED TEST SUITE');
console.log('================================================================');

// ── Section 1: Bus Primitives & Channel Taxonomy ─────────────────────────────
console.log('\n── Section 1: Bus Primitives & Channel Taxonomy ──────────────');

{
  assertEqual('Channel COMPOSE is "compose"', WORKSPACE_APP_CHANNELS.COMPOSE, 'compose');
  assertEqual('Channel WHITEBOARD is "whiteboard"', WORKSPACE_APP_CHANNELS.WHITEBOARD, 'whiteboard');
  assertEqual('Channel SHEETS is "sheets"', WORKSPACE_APP_CHANNELS.SHEETS, 'sheets');
  assertEqual('Channel TASKS is "tasks"', WORKSPACE_APP_CHANNELS.TASKS, 'tasks');
  assertEqual('Channel ROOM is "room"', WORKSPACE_APP_CHANNELS.ROOM, 'room');
  assertEqual('Channel ALL is "all"', WORKSPACE_APP_CHANNELS.ALL, 'all');

  assertEqual('Action INSERT_BLOCK exists', WORKSPACE_MUTATION_ACTIONS.INSERT_BLOCK, 'insert_block');
  assertEqual('Action PATCH_CELL exists', WORKSPACE_MUTATION_ACTIONS.PATCH_CELL, 'patch_cell');
  assertEqual('Action QUEUE_DIRECTIVE exists', WORKSPACE_MUTATION_ACTIONS.QUEUE_DIRECTIVE, 'queue_directive');
}

// ── Section 2: Channel Subscriptions & Isolation ─────────────────────────────
console.log('\n── Section 2: Channel Subscriptions & Isolation ──────────────');

{
  resetWorkspaceStateBusForTesting();
  const sheetsEvents = [];
  const whiteboardEvents = [];
  const allEvents = [];

  const unsubSheets = subscribeToWorkspaceApp('sheets', (evt) => sheetsEvents.push(evt));
  const unsubWhiteboard = subscribeToWorkspaceApp('whiteboard', (evt) => whiteboardEvents.push(evt));
  const unsubAll = subscribeToAllMutations((evt) => allEvents.push(evt));

  // 1. Dispatch Sheet Mutation
  dispatchWorkspaceMutation('sheets', {
    action: WORKSPACE_MUTATION_ACTIONS.PATCH_CELL,
    description: 'Update Cell D4 to 78%',
    before: '72%',
    after: '78%'
  });

  assertEqual('Sheets listener received 1 event', sheetsEvents.length, 1);
  assertEqual('Whiteboard listener received 0 events', whiteboardEvents.length, 0);
  assertEqual('Global listener received 1 event', allEvents.length, 1);
  assertEqual('Sheets event targetApp is "sheets"', sheetsEvents[0].targetApp, 'sheets');

  // 2. Dispatch Whiteboard Mutation
  dispatchWorkspaceMutation('whiteboard', {
    action: WORKSPACE_MUTATION_ACTIONS.INSERT_NODE,
    description: 'Add GPU Worker Node',
    after: '(Node: GPU_Inference_Worker)'
  });

  assertEqual('Sheets listener remains at 1 event', sheetsEvents.length, 1);
  assertEqual('Whiteboard listener received 1 event', whiteboardEvents.length, 1);
  assertEqual('Global listener received 2 events', allEvents.length, 2);

  // 3. Test Unsubscribe
  unsubSheets();
  dispatchWorkspaceMutation('sheets', {
    action: WORKSPACE_MUTATION_ACTIONS.PATCH_CELL,
    description: 'Another cell update'
  });

  assertEqual('Sheets listener did NOT receive event after unsub', sheetsEvents.length, 1);
  assertEqual('Global listener received 3rd event', allEvents.length, 3);

  unsubWhiteboard();
  unsubAll();
}

// ── Section 3: In-Memory Live State Snapshot & Audit Log ─────────────────────
console.log('\n── Section 3: In-Memory Live State Snapshot & Audit Log ──────');

{
  resetWorkspaceStateBusForTesting();
  const stateBefore = getWorkspaceLiveState();

  assert('Live state contains compose object', Boolean(stateBefore.compose));
  assert('Live state contains whiteboard object', Boolean(stateBefore.whiteboard));
  assert('Live state contains sheets object', Boolean(stateBefore.sheets));
  assert('Live state contains tasks object', Boolean(stateBefore.tasks));
  assert('Live state contains room object', Boolean(stateBefore.room));

  // Update app state
  updateAppState('compose', { title: 'Q4 Engineering Brief', blockCount: 14 });
  const stateAfter = getWorkspaceLiveState();
  assertEqual('Updated compose title reflected in snapshot', stateAfter.compose.title, 'Q4 Engineering Brief');
  assertEqual('Updated blockCount reflected in snapshot', stateAfter.compose.blockCount, 14);

  // Dispatch mutation with data payload
  dispatchWorkspaceMutation('tasks', {
    action: WORKSPACE_MUTATION_ACTIONS.QUEUE_DIRECTIVE,
    description: 'Benchmark latency',
    data: { queuedDirectivesCount: 5 }
  });

  const stateTasks = getWorkspaceLiveState();
  assertEqual('State bus updated tasks data', stateTasks.tasks.queuedDirectivesCount, 5);

  const log = getMutationAuditLog();
  assert('Audit log contains dispatched event', log.length >= 1);
  assertEqual('Latest audit event description matches', log[log.length - 1].description, 'Benchmark latency');
}

// ── Section 4: Cross-App In-Meeting Room Intent Synchronizer ──────────────────
console.log('\n── Section 4: Cross-App In-Meeting Room Intent Synchronizer ──');

{
  resetWorkspaceStateBusForTesting();
  const composeEvents = [];
  const tasksEvents = [];
  const whiteboardEvents = [];
  const sheetsEvents = [];

  subscribeToWorkspaceApp('compose', (e) => composeEvents.push(e));
  subscribeToWorkspaceApp('tasks', (e) => tasksEvents.push(e));
  subscribeToWorkspaceApp('whiteboard', (e) => whiteboardEvents.push(e));
  subscribeToWorkspaceApp('sheets', (e) => sheetsEvents.push(e));

  // 1. Spoken Decision Consensus
  const decisionIntent = classifySpeechIntent('Marcus Vance', 'Consensus is reached: approve $750k for GPUs');
  const decisionMutations = syncCrossAppIntent(decisionIntent, {
    targetApp: 'compose',
    description: 'Consensus Approved: approve $750k for GPUs',
    after: '<callout>Approved</callout>',
    status: 'committed'
  });

  assertEqual('Decision sync produced 1 mutation', decisionMutations.length, 1);
  assertEqual('Compose listener received decision', composeEvents.length, 1);
  assertEqual('Compose event status is committed', composeEvents[0].status, 'committed');

  // 2. Spoken Action Directive (Secondary propagation to Compose)
  const directiveIntent = classifySpeechIntent('Marcus Vance', 'Alex, queue a P0 directive to benchmark latency by Friday');
  const directiveMutations = syncCrossAppIntent(directiveIntent, {
    targetApp: 'tasks',
    description: 'Queue P0 directive',
    after: '{"title":"benchmark latency"}',
    status: 'staged',
    branchId: 'pr_room_test_123'
  });

  assertEqual('Directive sync produced 2 mutations (tasks + compose minute)', directiveMutations.length, 2);
  assertEqual('Tasks listener received directive', tasksEvents.length, 1);
  assertEqual('Tasks event status is staged', tasksEvents[0].status, 'staged');
  assertEqual('Tasks branchId matches', tasksEvents[0].branchId, 'pr_room_test_123');
  assertEqual('Compose listener received secondary action item minute', composeEvents.length, 2);

  // 3. Spoken Architecture Mutation
  const archIntent = classifySpeechIntent('Alex Chen', 'Connect API Gateway to GPU Worker on the whiteboard');
  const archMutations = syncCrossAppIntent(archIntent, {
    targetApp: 'whiteboard',
    description: 'Connect topology nodes',
    status: 'committed'
  });

  assertEqual('Whiteboard listener received architecture update', whiteboardEvents.length, 1);
  assertEqual('Whiteboard event targetApp is whiteboard', whiteboardEvents[0].targetApp, 'whiteboard');

  // 4. Spoken Financial Metric Update
  const finIntent = classifySpeechIntent('Elena Rostova', 'Update projected gross margin to 78% in financial matrix');
  const finMutations = syncCrossAppIntent(finIntent, {
    targetApp: 'sheets',
    description: 'Update Cell D4 to 78%',
    status: 'staged',
    branchId: 'pr_room_fin_456'
  });

  assertEqual('Sheets listener received metric update', sheetsEvents.length, 1);
  assertEqual('Sheets event status is staged', sheetsEvents[0].status, 'staged');
}

// ── Section 5: End-to-End RoomObserverEngine Integration ─────────────────────
console.log('\n── Section 5: End-to-End RoomObserverEngine Integration ──────');

{
  resetWorkspaceStateBusForTesting();
  const allEvents = [];
  subscribeToAllMutations((e) => allEvents.push(e));

  // Call mutateWorkspaceFromIntent directly
  const sampleIntent = {
    type: EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION,
    extractedData: {
      sourceNode: 'API Gateway',
      targetNode: 'Auth Service',
      relation: 'DEPENDS_ON',
      rawProposal: 'Connect API Gateway to Auth Service'
    }
  };

  const record = mutateWorkspaceFromIntent(sampleIntent, { stage: true });

  assert('mutateWorkspaceFromIntent returns valid record', Boolean(record));
  assertEqual('Target app is whiteboard', record.targetApp, 'whiteboard');
  assert('State bus automatically received mutation event', allEvents.length >= 1);
  assertEqual('Dispatched event targetApp is whiteboard', allEvents[0].targetApp, 'whiteboard');
  assertEqual('Dispatched event status is staged', allEvents[0].status, 'staged');
}

// ── SUMMARY REPORT ───────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(` PHASE 1 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
