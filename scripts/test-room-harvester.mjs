import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyRelayIntent, processRelayAgentMessage } from '../src/services/relayAgentService.js';
import * as roomObserver from '../src/services/roomObserverEngine.js';
import { getToolByName, CANONICAL_DOCS_TOOLS } from '../src/services/docsToolRegistry.js';
import { executeTool } from '../src/services/docsToolExecutor.js';
import { readResource, MCP_RESOURCES } from '../src/services/universalMcpBridge.js';

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
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', label, detail });
    console.error(`  ✗ [FAIL] ${label}${detail ? ` - ${detail}` : ''}`);
  }
}

function assertEqual(label, actual, expected) {
  const ok = actual === expected;
  assert(label, ok, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log('\n================================================================');
console.log(' PILLAR 10: ROOM CONTEXT HARVESTER & IN-MEETING OBSERVER SUITE');
console.log('================================================================\n');

// ── Section 1: Intent Regression & Room In-Meeting Intent ─────────────────────
console.log('── Section 1: Intent Regression & Room In-Meeting Intent ─────');

{
  const r = classifyRelayIntent('create a document called Architecture Spec');
  assert('isDocCreation fires for create-document prompt', r.isDocCreation === true);
  assert('isRoomHarvester does NOT fire for doc creation', r.isRoomHarvester === false);
}

{
  const r = classifyRelayIntent('schedule a task to benchmark latency by Friday');
  assert('isTaskSchedule fires for task prompt', r.isTaskSchedule === true);
  assert('isRoomHarvester does NOT fire for task prompt', r.isRoomHarvester === false);
}

{
  const r = classifyRelayIntent('schedule a meeting with Elena tomorrow at 3pm');
  assert('isScheduleMeeting fires for schedule prompt', r.isScheduleMeeting === true);
  assert('isRoomHarvester does NOT fire for schedule prompt', r.isRoomHarvester === false);
}

{
  const r = classifyRelayIntent('queue an agent directive for Marcus');
  assert('isDirectiveQueue fires for directive prompt', r.isDirectiveQueue === true);
  assert('isRoomHarvester does NOT fire for directive prompt', r.isRoomHarvester === false);
}

{
  const r = classifyRelayIntent('compile whiteboard diagram into sql');
  assert('isWhiteboardTopology fires for whiteboard prompt', r.isWhiteboardTopology === true);
  assert('isRoomHarvester does NOT fire for whiteboard prompt', r.isRoomHarvester === false);
}

{
  const r = classifyRelayIntent('harvest room meeting audio and track consensus');
  assert('isRoomHarvester fires for "harvest room meeting audio"', r.isRoomHarvester === true);
  assert('isAction is true for room harvester', r.isAction === true);
  assert('isDocCreation does NOT fire for room harvester', r.isDocCreation === false);
}

{
  const r = classifyRelayIntent('start meeting observer for executive sync');
  assert('isRoomHarvester fires for "start meeting observer"', r.isRoomHarvester === true);
}

{
  const r = classifyRelayIntent('monitor in-meeting audio stream and capture decisions');
  assert('isRoomHarvester fires for "monitor in-meeting audio stream"', r.isRoomHarvester === true);
}

// ── Section 2: Speech-to-Intent Classification Pipeline ──────────────────────
console.log('\n── Section 2: Speech-to-Intent Classification Pipeline ────────');

{
  const res = roomObserver.classifySpeechIntent(
    'Elena Rostova (VP Finance)',
    'We formally agreed to allocate $750,000 for H100 GPU compute clusters.'
  );
  assertEqual('Decision intent classified correctly', res.type, roomObserver.EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS);
  assert('Financial figure extracted accurately', res.extractedData.financialFigure === '$750,000');
  assert('Confidence score >= 0.90', res.confidence >= 0.90);
  assertEqual('Sponsor identity captured', res.extractedData.sponsor, 'Elena Rostova (VP Finance)');
}

{
  const res = roomObserver.classifySpeechIntent(
    'Marcus Vance (CEO)',
    'Alex, queue a P0 directive for Marcus Agent to benchmark cluster inference latency by Friday.'
  );
  assertEqual('Directive intent classified correctly', res.type, roomObserver.EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE);
  assertEqual('Priority P0 extracted', res.extractedData.priority, 'P0');
  assert('Assignee extracted', res.extractedData.assignee.includes('Marcus') || res.extractedData.assignee.includes('Alex'));
}

{
  const res = roomObserver.classifySpeechIntent(
    'Alex Chen (Principal Architect)',
    'On the whiteboard, let us connect the API Gateway to the Inference Worker Service.'
  );
  assertEqual('Architecture intent classified correctly', res.type, roomObserver.EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION);
  assert('Target node captured', res.extractedData.targetNode.length > 0);
  assert('Relation captured', res.extractedData.relation === 'DEPENDS_ON');
}

{
  const res = roomObserver.classifySpeechIntent(
    'Elena Rostova (VP Finance)',
    'Let us update projected gross margin to 78% in our financial matrix.'
  );
  assertEqual('Financial metric intent classified correctly', res.type, roomObserver.EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE);
  assertEqual('Percentage value extracted', res.extractedData.newValue, '78%');
}

{
  const res = roomObserver.classifySpeechIntent(
    'Participant',
    'General discussion about team roadmap and timezone coordination.'
  );
  assertEqual('General note classified as DOCUMENTATION_NOTE', res.type, roomObserver.EPISTEMIC_INTENT_TYPES.DOCUMENTATION_NOTE);
}

// ── Section 3: Session State, Turn Counter & Observers ───────────────────────
console.log('\n── Section 3: Session State, Turn Counter & Observers ─────────');

{
  roomObserver.resetRoomSession('Test Executive Session');
  const session = roomObserver.getLiveSession();

  assert('Session has meetingId', Boolean(session.meetingId));
  assertEqual('Status is listening', session.status, roomObserver.HARVESTER_STATUS.LISTENING);
  assert('Active observers initialized with 3 agents', session.activeObservers.length >= 3);
  assertEqual('Speaker turns initially empty', session.speakerTurns.length, 0);

  // Ingest single turn
  const turn = roomObserver.ingestSpeechTurn({
    speaker: 'Elena Rostova',
    text: 'We agreed to approve the cloud contract.',
    confidence: 0.97,
    autoMutate: false
  });

  assert('Ingested turn returned with ID', Boolean(turn.id));
  const updated = roomObserver.getLiveSession();
  assertEqual('Total turns incremented to 1', updated.summary.totalTurns, 1);
  assertEqual('Decisions counter incremented to 1', updated.summary.decisionsCount, 1);
  assertEqual('Harvested intents array populated', updated.harvestedIntents.length, 1);
}

// ── Section 4: Concurrent Cross-App Workspace State Mutation ─────────────────
console.log('\n── Section 4: Concurrent Cross-App Workspace State Mutation ──');

{
  // Test mutation from intent across apps
  const docMutation = roomObserver.mutateWorkspaceFromIntent({
    type: roomObserver.EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS,
    extractedData: { resolution: 'Allocate $500k budget', sponsor: 'Elena' }
  }, { stage: true });

  assert('Doc consensus mutation targets compose', docMutation.targetApp === 'compose');
  assert('Mutation has staged status', docMutation.status === 'staged');

  const taskMutation = roomObserver.mutateWorkspaceFromIntent({
    type: roomObserver.EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE,
    extractedData: { title: 'Benchmark GPU Cluster', priority: 'P0', tier: 'agent', assignee: 'Marcus Agent' }
  }, { stage: true });

  assert('Directive mutation targets tasks', taskMutation.targetApp === 'tasks');

  const archMutation = roomObserver.mutateWorkspaceFromIntent({
    type: roomObserver.EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION,
    extractedData: { sourceNode: 'API Gateway', targetNode: 'GPU Worker', relation: 'DEPENDS_ON' }
  }, { stage: true });

  assert('Architecture mutation targets whiteboard', archMutation.targetApp === 'whiteboard');

  const finMutation = roomObserver.mutateWorkspaceFromIntent({
    type: roomObserver.EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE,
    extractedData: { metric: 'Gross Margin', cellTarget: 'D4', newValue: '78%' }
  }, { stage: true });

  assert('Financial mutation targets sheets', finMutation.targetApp === 'sheets');
}

// ── Section 5: Pillar 3 Staging Sandbox Integration ──────────────────────────
console.log('\n── Section 5: Pillar 3 Staging Sandbox Integration ───────────');

{
  roomObserver.resetRoomSession('Staging Sandbox Test');

  // Ingest speech turn with autoMutate = true and stage = true
  roomObserver.ingestSpeechTurn({
    speaker: 'Elena Rostova',
    text: 'We agreed to approve the $1M compute cluster contract.',
    autoMutate: true,
    stage: true
  });

  const session = roomObserver.getLiveSession();
  assert('Meeting PR branch created', Boolean(session.activePrBranchId));
  assert('Pending mutations contains 1 staged item', session.pendingMutations.length === 1);

  // Commit meeting PR
  const commitResult = roomObserver.commitMeetingPr();
  assert('Commit meeting PR succeeds', commitResult.success === true);

  const concluded = roomObserver.getLiveSession();
  assertEqual('Session status transitioned to concluded', concluded.status, roomObserver.HARVESTER_STATUS.CONCLUDED);
  assert('Active PR branch cleared after commit', concluded.activePrBranchId === null);
}

// ── Section 6: Synthetic In-Meeting Simulation Suite ─────────────────────────
console.log('\n── Section 6: Synthetic In-Meeting Simulation Suite ──────────');

{
  const simulationResults = await roomObserver.runSyntheticMeetingSimulation();
  assertEqual('Simulation ran all 5 turns', simulationResults.length, 5);

  const session = roomObserver.getLiveSession();
  assertEqual('Total turns matches 5', session.summary.totalTurns, 5);
  assert('Harvested at least 2 decisions', session.summary.decisionsCount >= 2);
  assert('Harvested at least 1 directive', session.summary.directivesCount >= 1);
  assert('Harvested at least 1 architecture mutation', session.summary.architectureCount >= 1);
  assert('Harvested at least 1 financial update', session.summary.financialCount >= 1);

  // Serializer tests
  const md = roomObserver.serializeRoomContextToMarkdown(session);
  assert('Markdown serializer contains meeting header', md.includes('# In-Room Real-Time Context Feed'));
  assert('Markdown serializer contains summary metrics', md.includes('Decisions / Consensus:'));

  const json = roomObserver.serializeRoomContextToJson(session);
  const parsed = JSON.parse(json);
  assertEqual('JSON serializer parses successfully with meetingId', parsed.meetingId, session.meetingId);
}

// ── Section 7: Canonical Docs Tools Execution & Executor ─────────────────────
console.log('\n── Section 7: Canonical Docs Tools Execution & Executor ──────');

{
  const harvestTool = getToolByName('harvest_meeting_intent');
  assert('harvest_meeting_intent registered in Canonical Tools', Boolean(harvestTool));
  assertEqual('harvest_meeting_intent is non-mutating', harvestTool.mutatesDocument, false);

  const harvestRes = await harvestTool.execute({
    speaker: 'Marcus Vance',
    text: 'We agreed to proceed with dual sourcing for chips.'
  });
  assert('harvest_meeting_intent execution succeeded', harvestRes.success === true);
  assertEqual('Intent type is decision_consensus', harvestRes.data.intent.type, 'decision_consensus');
}

{
  const mutateTool = getToolByName('mutate_workspace_from_audio');
  assert('mutate_workspace_from_audio registered in Canonical Tools', Boolean(mutateTool));
  assertEqual('mutate_workspace_from_audio mutatesDocument', mutateTool.mutatesDocument, true);

  const mutateRes = await mutateTool.execute({
    speaker: 'Alex Chen',
    text: 'Connect API Gateway to the Auth Service on the whiteboard.',
    stage: true
  });
  assert('mutate_workspace_from_audio execution succeeded', mutateRes.success === true);
}

{
  const dispatchTool = getToolByName('dispatch_in_room_directive');
  assert('dispatch_in_room_directive registered in Canonical Tools', Boolean(dispatchTool));
  assertEqual('dispatch_in_room_directive mutatesDocument', dispatchTool.mutatesDocument, true);

  const dispatchRes = await dispatchTool.execute({
    title: 'Audit database replication lag',
    assignee: 'Marcus Agent',
    priority: 'P0',
    tier: 'agent'
  });
  assert('dispatch_in_room_directive execution succeeded', dispatchRes.success === true);
}

{
  const contextTool = getToolByName('get_room_live_context');
  assert('get_room_live_context registered in Canonical Tools', Boolean(contextTool));

  const ctxRes = await contextTool.execute({ format: 'markdown' });
  assert('get_room_live_context returns markdown', ctxRes.success === true && typeof ctxRes.data === 'string');
}

{
  // Test docsToolExecutor in staging mode
  const stagedExec = await executeTool(
    'mutate_workspace_from_audio',
    { speaker: 'Marcus Vance', text: 'Queue a P0 directive to verify deployment' },
    { stage: true }
  );
  assert('executeTool marks isStaged = true for room_tools', stagedExec.isStaged === true);
  assert('executeTool generated prNumber', typeof stagedExec.prNumber === 'number');
}

// ── Section 8: Model Context Protocol (MCP) Resource ────────────────────────
console.log('\n── Section 8: Model Context Protocol (MCP) Resource ──────────');

{
  const roomResDef = MCP_RESOURCES.find(r => r.uri === 'workspace://room/live-context');
  assert('workspace://room/live-context registered in MCP_RESOURCES', Boolean(roomResDef));
  assertEqual('Resource mimeType is text/markdown', roomResDef.mimeType, 'text/markdown');

  const content = await readResource('workspace://room/live-context');
  assert('readResource reads room live-context without error', Boolean(content));
  assertEqual('Returned uri matches', content.uri, 'workspace://room/live-context');
  assert('Resource text contains Markdown stream', content.text.includes('In-Room Real-Time Context Feed'));
}

// ── Section 9: Relay Agent Intent & Action Card ──────────────────────────────
console.log('\n── Section 9: Relay Agent Intent & Action Card ───────────────');

{
  const response = await processRelayAgentMessage('harvest room audio and summarize decisions');
  assert('Relay agent produced replyText', Boolean(response.replyText));
  assert('Relay agent generated actionCard', Boolean(response.actionCard));
  assertEqual('ActionCard type is "room_harvester"', response.actionCard.type, 'room_harvester');
  assertEqual('ActionCard subType is "live_stream"', response.actionCard.subType, 'live_stream');
  assert('ActionCard contains previewSnippet', Boolean(response.actionCard.previewSnippet));
}

// ── Section 10: UI & Global Window Contracts ────────────────────────────────
console.log('\n── Section 10: UI & Global Window Contracts ──────────────────');

{
  // Check RoomContextHarvesterInspector.jsx exists
  const inspectorPath = path.join(__dirname, '../src/components/room/RoomContextHarvesterInspector.jsx');
  assert('RoomContextHarvesterInspector.jsx exists on disk', fs.existsSync(inspectorPath));

  const content = fs.readFileSync(inspectorPath, 'utf8');
  assert('Inspector does not use pill tabs (Rule 3)', !content.includes('rounded-full'));
  assert('Inspector describes active visual state as "outline" (Rule 2)', content.includes('outline'));
  assert('Inspector uses touch-safe onPointerDown (Rule 6)', content.includes('onPointerDown'));
}

{
  // Check ExecutiveDirectMessages.jsx handles room_harvester action card
  const edmPath = path.join(__dirname, '../src/components/chat/ExecutiveDirectMessages.jsx');
  const edmContent = fs.readFileSync(edmPath, 'utf8');
  assert('ExecutiveDirectMessages handles actionCard.type === "room_harvester"', edmContent.includes("msg.actionCard.type === 'room_harvester'"));
  assert('ExecutiveDirectMessages has touch-safe onPointerDown CTA for Room', edmContent.includes('__REGAARDER_OPEN_ROOM_HARVESTER__'));
}

{
  // Check MemoryDashboard.jsx mounts Room Observer tab
  const memPath = path.join(__dirname, '../src/MemoryDashboard.jsx');
  const memContent = fs.readFileSync(memPath, 'utf8');
  assert('MemoryDashboard imports RoomContextHarvesterInspector', memContent.includes('RoomContextHarvesterInspector'));
  assert('MemoryDashboard registers "room" in MEMORY_TABS', memContent.includes("id: 'room'"));
  assert('MemoryDashboard renders <RoomContextHarvesterInspector />', memContent.includes('<RoomContextHarvesterInspector />'));
}

{
  // Check RoomLandingPage.jsx has AI Observer Active pill
  const rlpPath = path.join(__dirname, '../src/RoomLandingPage.jsx');
  const rlpContent = fs.readFileSync(rlpPath, 'utf8');
  assert('RoomLandingPage has AI Observer Active button pill', rlpContent.includes('AI Observer Active'));
}

{
  // Check App.jsx registers window globals and cleanup
  const appPath = path.join(__dirname, '../src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert('App.jsx registers window.__REGAARDER_ROOM_HARVESTER__', appContent.includes('window.__REGAARDER_ROOM_HARVESTER__'));
  assert('App.jsx registers window.__REGAARDER_OPEN_ROOM_HARVESTER__', appContent.includes('window.__REGAARDER_OPEN_ROOM_HARVESTER__'));
  assert('App.jsx cleans up room globals on unmount', appContent.includes('delete window.__REGAARDER_ROOM_HARVESTER__;'));
}

console.log('\n================================================================');
console.log(` PILLAR 10 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
