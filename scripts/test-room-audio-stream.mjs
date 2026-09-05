/**
 * test-room-audio-stream.mjs
 * 
 * Phase 5 Verification Suite: Live Microphone Audio Stream & Speech-to-Intent Pipeline
 * 
 * Tests:
 * 1. Audio stream status states & enums (IDLE, CONNECTING, LISTENING, MUTED, ERROR)
 * 2. Lifecycle transitions: startLiveAudioStream, toggleMuteAudioStream, stopLiveAudioStream
 * 3. Reactive subscriptions & subscriber listener notifications
 * 4. Deterministic turn simulation & automated speech-to-intent classification
 * 5. Cross-app mutation dispatch & state bus synchronization (AUDIO_STREAM_TURN_INGESTED)
 * 6. Automated Staging PR sandbox creation from spoken action directives and meeting turns
 * 7. UI contract compliance:
 *    - RoomContextHarvesterInspector.jsx (touch-safe onPointerDown, non-pill tabs, outline active states)
 *    - App.jsx global registration (window.__REGAARDER_AUDIO_STREAM__) with lifecycle cleanup
 */

import {
  AUDIO_STREAM_STATUS,
  getAudioStreamState,
  subscribeToAudioStream,
  startLiveAudioStream,
  stopLiveAudioStream,
  toggleMuteAudioStream,
  isLiveAudioStreaming,
  simulateLiveAudioTurn,
  resetAudioStreamForTesting
} from '../src/services/roomAudioStreamService.js';

import {
  getLiveSession,
  resetRoomSession,
  commitMeetingPr,
  rejectMeetingPr,
  EPISTEMIC_INTENT_TYPES,
  HARVESTER_STATUS
} from '../src/services/roomObserverEngine.js';

import {
  subscribeToWorkspaceApp,
  subscribeToAllMutations,
  resetWorkspaceStateBusForTesting,
  WORKSPACE_APP_CHANNELS
} from '../src/services/workspaceStateBus.js';

import {
  getActiveBranches,
  resetStagingForTesting
} from '../src/services/workspaceStagingEngine.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(description, condition, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${extraInfo ? `(${extraInfo})` : ''}`);
    failed++;
  }
}

function assertEqual(description, actual, expected) {
  const matches = JSON.stringify(actual) === JSON.stringify(expected);
  assert(description, matches, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log('\n================================================================');
console.log(' PHASE 5: LIVE MICROPHONE AUDIO STREAM & SPEECH-TO-INTENT SUITE');
console.log('================================================================\n');

// ── Section 1: Audio Stream Status States & Enums ────────────────────────────
console.log('── Section 1: Audio Stream Status States & Enums ─────────────');

{
  resetAudioStreamForTesting();

  assert('AUDIO_STREAM_STATUS.IDLE is defined', AUDIO_STREAM_STATUS.IDLE === 'idle');
  assert('AUDIO_STREAM_STATUS.CONNECTING is defined', AUDIO_STREAM_STATUS.CONNECTING === 'connecting');
  assert('AUDIO_STREAM_STATUS.LISTENING is defined', AUDIO_STREAM_STATUS.LISTENING === 'listening');
  assert('AUDIO_STREAM_STATUS.MUTED is defined', AUDIO_STREAM_STATUS.MUTED === 'muted');
  assert('AUDIO_STREAM_STATUS.ERROR is defined', AUDIO_STREAM_STATUS.ERROR === 'error');

  const initialState = getAudioStreamState();
  assertEqual('Initial stream status is IDLE', initialState.status, AUDIO_STREAM_STATUS.IDLE);
  assertEqual('Initial isStreaming is false', initialState.isStreaming, false);
  assertEqual('Initial isMuted is false', initialState.isMuted, false);
  assertEqual('Initial volumeLevel is 0.0', initialState.volumeLevel, 0.0);
  assertEqual('Initial lastTranscript is empty', initialState.lastTranscript, '');
  assertEqual('Initial speaker is You (Live Voice)', initialState.speaker, 'You (Live Voice)');
  assertEqual('Initial autoIngest is true', initialState.autoIngest, true);
  assertEqual('isLiveAudioStreaming returns false initially', isLiveAudioStreaming(), false);
}

// ── Section 2: Audio Stream Lifecycle Controls ───────────────────────────────
console.log('\n── Section 2: Audio Stream Lifecycle Controls ────────────────');

{
  resetAudioStreamForTesting();

  // Test startLiveAudioStream in headless / node environment
  const startResult = await startLiveAudioStream({
    speaker: 'Marcus Vance (CTO)',
    autoIngest: true
  });

  assertEqual('startLiveAudioStream transitions status to LISTENING', startResult.status, AUDIO_STREAM_STATUS.LISTENING);
  assertEqual('isStreaming is true when active', startResult.isStreaming, true);
  assertEqual('speaker is set to Marcus Vance (CTO)', startResult.speaker, 'Marcus Vance (CTO)');
  assertEqual('isLiveAudioStreaming returns true when active', isLiveAudioStreaming(), true);

  // Idempotent start call
  const idempotentResult = await startLiveAudioStream({
    speaker: 'Different Speaker'
  });
  assertEqual('Idempotent start maintains LISTENING status', idempotentResult.status, AUDIO_STREAM_STATUS.LISTENING);

  // Test Mute toggle
  const mute1 = toggleMuteAudioStream();
  assertEqual('toggleMuteAudioStream returns true on mute', mute1, true);
  const mutedState = getAudioStreamState();
  assertEqual('Stream status transitions to MUTED', mutedState.status, AUDIO_STREAM_STATUS.MUTED);
  assertEqual('isMuted is true in state', mutedState.isMuted, true);
  assertEqual('volumeLevel resets to 0.0 on mute', mutedState.volumeLevel, 0.0);
  assertEqual('isStreaming remains true while muted', mutedState.isStreaming, true);
  assertEqual('isLiveAudioStreaming returns true while muted', isLiveAudioStreaming(), true);

  // Test Unmute toggle
  const mute2 = toggleMuteAudioStream();
  assertEqual('toggleMuteAudioStream returns false on unmute', mute2, false);
  const unmutedState = getAudioStreamState();
  assertEqual('Stream status transitions back to LISTENING', unmutedState.status, AUDIO_STREAM_STATUS.LISTENING);
  assertEqual('isMuted is false in state', unmutedState.isMuted, false);

  // Test Stop
  const stopResult = stopLiveAudioStream();
  assertEqual('stopLiveAudioStream transitions status to IDLE', stopResult.status, AUDIO_STREAM_STATUS.IDLE);
  assertEqual('isStreaming becomes false on stop', stopResult.isStreaming, false);
  assertEqual('isMuted becomes false on stop', stopResult.isMuted, false);
  assertEqual('volumeLevel becomes 0.0 on stop', stopResult.volumeLevel, 0.0);
  assertEqual('isLiveAudioStreaming returns false after stop', isLiveAudioStreaming(), false);
}

// ── Section 3: Reactive Subscriptions & Subscriber Notifications ─────────────
console.log('\n── Section 3: Reactive Subscriptions ─────────────────────────');

{
  resetAudioStreamForTesting();

  const notifications = [];
  const unsubscribe = subscribeToAudioStream((state) => {
    notifications.push({ ...state });
  });

  assert('Subscriber is immediately called with initial state', notifications.length === 1);
  assertEqual('First notification is IDLE', notifications[0].status, AUDIO_STREAM_STATUS.IDLE);

  await startLiveAudioStream({ speaker: 'Elena Rostova' });
  assert('Subscriber notified on stream start', notifications.length >= 2);
  assertEqual('Latest state has LISTENING status', notifications[notifications.length - 1].status, AUDIO_STREAM_STATUS.LISTENING);

  toggleMuteAudioStream();
  assertEqual('Subscriber notified on mute with MUTED status', notifications[notifications.length - 1].status, AUDIO_STREAM_STATUS.MUTED);

  stopLiveAudioStream();
  assertEqual('Subscriber notified on stop with IDLE status', notifications[notifications.length - 1].status, AUDIO_STREAM_STATUS.IDLE);

  const notificationCountBeforeUnsub = notifications.length;
  unsubscribe();

  // Starting again should not notify removed subscriber
  await startLiveAudioStream();
  assertEqual('Unsubscribed listener receives no further notifications', notifications.length, notificationCountBeforeUnsub);

  stopLiveAudioStream();
}

// ── Section 4: Deterministic Simulation & State Ingestion ───────────────────
console.log('\n── Section 4: Deterministic Simulation & Speech Turn Ingestion ');

{
  resetAudioStreamForTesting();
  resetRoomSession();
  resetWorkspaceStateBusForTesting();
  resetStagingForTesting();

  await startLiveAudioStream({ speaker: 'Director Sarah Chen' });

  const turnSim = simulateLiveAudioTurn(
    'Elena, please prepare the Q3 financial audit report by Friday 5pm.',
    'Director Sarah Chen',
    0.85
  );

  assert('simulateLiveAudioTurn returns turn object', Boolean(turnSim));
  assertEqual('simulateLiveAudioTurn returns transcript', turnSim.transcript, 'Elena, please prepare the Q3 financial audit report by Friday 5pm.');
  assertEqual('simulateLiveAudioTurn returns volume', turnSim.volume, 0.85);

  const state = getAudioStreamState();
  assertEqual('getAudioStreamState has updated lastTranscript', state.lastTranscript, 'Elena, please prepare the Q3 financial audit report by Friday 5pm.');
  assertEqual('getAudioStreamState has updated volumeLevel', state.volumeLevel, 0.85);

  // Verify roomObserverEngine received and classified the speech turn
  const session = getLiveSession();
  assert('Room session recorded speaker turn', session.speakerTurns.length >= 1);
  const lastTurn = session.speakerTurns[session.speakerTurns.length - 1];
  assertEqual('Turn speaker matches', lastTurn.speaker, 'Director Sarah Chen');
  assertEqual('Turn intent classified as ACTION_DIRECTIVE', lastTurn.intent?.type, EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE);
  assert('Directive was added to session summary', session.summary.directivesCount >= 1);

  stopLiveAudioStream();
}

// ── Section 5: Cross-App Mutation Dispatch & State Bus Synchronization ────────
console.log('\n── Section 5: State Bus Integration ───────────────────────────');

{
  resetAudioStreamForTesting();
  resetRoomSession();
  resetWorkspaceStateBusForTesting();

  const roomMutations = [];
  const unsubBus = subscribeToWorkspaceApp(WORKSPACE_APP_CHANNELS.ROOM, (evt) => {
    roomMutations.push(evt);
  });

  await startLiveAudioStream({ speaker: 'Marcus Vance' });

  simulateLiveAudioTurn(
    'We have unanimous consensus to migrate our storage engine to indexedDB.',
    'Marcus Vance',
    0.78
  );

  assert('State bus received mutation for ROOM channel', roomMutations.length >= 1);
  const audioEvt = roomMutations.find(m => m.action === 'AUDIO_STREAM_TURN_INGESTED');
  assert('AUDIO_STREAM_TURN_INGESTED mutation was dispatched to state bus', Boolean(audioEvt));
  assertEqual('Mutation source is room_audio_stream_service', audioEvt.source, 'room_audio_stream_service');
  assertEqual('Mutation speaker is Marcus Vance', audioEvt.delta?.speaker, 'Marcus Vance');
  assertEqual('Mutation text matches spoken turn', audioEvt.delta?.text, 'We have unanimous consensus to migrate our storage engine to indexedDB.');
  assertEqual('Mutation volume is 0.78', audioEvt.delta?.volume, 0.78);

  unsubBus();
  stopLiveAudioStream();
}

// ── Section 6: Automated Staging Sandbox PR from Spoken Intent ──────────────
console.log('\n── Section 6: Spoken Intent Staging PR Sandbox ───────────────');

{
  resetAudioStreamForTesting();
  resetRoomSession();
  resetStagingForTesting();

  await startLiveAudioStream({ speaker: 'Elena Rostova (VP Finance)' });

  simulateLiveAudioTurn(
    'Updating Q3 revenue forecast to 14.5 million in our sheets budget model.',
    'Elena Rostova (VP Finance)',
    0.91
  );

  const session = getLiveSession();
  assert('Active meeting PR branch was created in Room session', Boolean(session.activePrBranchId));

  const stagingBranches = getActiveBranches();
  const meetingPr = stagingBranches.find(b => b.id === session.activePrBranchId);
  assert('Meeting PR branch exists in WorkspaceStagingEngine', Boolean(meetingPr));
  assertEqual('Branch app channel is ROOM', meetingPr?.appId, WORKSPACE_APP_CHANNELS.ROOM);
  assert('Branch contains staged mutations from spoken intent', (meetingPr?.mutations?.length || 0) >= 1);

  // Commit meeting PR
  const commitResult = commitMeetingPr();
  assert('commitMeetingPr completes cleanly', commitResult.success === true);
  assertEqual('Active PR branch cleared after commit', getLiveSession().activePrBranchId, null);

  stopLiveAudioStream();
}

// ── Section 7: UI Contract & Architectural Directives Compliance ─────────────
console.log('\n── Section 7: UI Contract Compliance ─────────────────────────');

{
  const inspectorPath = path.resolve(__dirname, '../src/components/room/RoomContextHarvesterInspector.jsx');
  assert('RoomContextHarvesterInspector.jsx exists', fs.existsSync(inspectorPath));
  const inspectorSource = fs.readFileSync(inspectorPath, 'utf8');

  // Rule 6: Touch-safe React onPointerDown
  assert(
    'Inspector uses touch-safe onPointerDown for live mic toggle',
    inspectorSource.includes('onPointerDown={handleToggleLiveMic}')
  );
  assert(
    'Inspector uses touch-safe onPointerDown for mute toggle',
    inspectorSource.includes('onPointerDown={handleToggleMute}')
  );
  assert(
    'Inspector uses onPointerDown for simulation streams',
    inspectorSource.includes('onPointerDown={handleToggleAutoStream}')
  );
  assert(
    'Inspector uses onPointerDown for tab navigation',
    inspectorSource.includes('onPointerDown={() => setActiveTab(tab.id)}')
  );

  // Rule 2: Active states use "outline", NOT "highlight"
  assert(
    'Inspector uses "outline" styling keyword for active visual status',
    inspectorSource.includes('outline')
  );
  assert(
    'Inspector does not use "highlight" for active status',
    !inspectorSource.toLowerCase().includes('highlight')
  );

  // Rule 3: Navigation tabs are slightly rounded rectangles, NOT pill-shaped
  assert(
    'Inspector navigation tabs do NOT use rounded-full',
    !inspectorSource.includes("rounded-full bg-") || !inspectorSource.includes("tabs.map")
  );
  assert(
    'Inspector buttons and tabs use executive rounded-lg / rounded-xl rectangles',
    inspectorSource.includes('rounded-lg') && inspectorSource.includes('rounded-xl')
  );

  // Live microphone level visualizer
  assert(
    'Inspector renders real-time audio volume visualizer',
    inspectorSource.includes('audioStreamState.volumeLevel') && inspectorSource.includes('LIVE MICROPHONE ACTIVE')
  );

  // App.jsx global registration
  const appPath = path.resolve(__dirname, '../src/App.jsx');
  assert('App.jsx exists', fs.existsSync(appPath));
  const appSource = fs.readFileSync(appPath, 'utf8');

  assert(
    'App.jsx imports roomAudioStream service',
    appSource.includes("import * as roomAudioStream from './services/roomAudioStreamService';")
  );
  assert(
    'App.jsx attaches window.__REGAARDER_AUDIO_STREAM__',
    appSource.includes('window.__REGAARDER_AUDIO_STREAM__ = roomAudioStream;')
  );
  assert(
    'App.jsx cleans up window.__REGAARDER_AUDIO_STREAM__ on unmount',
    appSource.includes('delete window.__REGAARDER_AUDIO_STREAM__;')
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(` PHASE 5 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
