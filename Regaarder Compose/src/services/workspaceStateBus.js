/**
 * workspaceStateBus.js
 * 
 * Central Reactive Workspace State Bus & Multi-App Dispatcher
 * 
 * Bridges disparate workspace applications (Room, Compose Docs, Whiteboard, 
 * Sheets Matrix, Tasks Directives) into a real-time reactive pub/sub event bus.
 * 
 * Solves the "protocol scaffold" gap: when an in-meeting decision, directive, 
 * architectural proposal, or financial metric update is harvested, this bus
 * ensures immediate reactive synchronization across open viewports, DOM elements,
 * and background staging PRs without requiring page reloads.
 */

import { recordWorkspaceMutationNode } from './universalContextGraph.js';

// ── CONSTANTS & EVENT CHANNELS ────────────────────────────────────────────────

export const WORKSPACE_APP_CHANNELS = {
  COMPOSE: 'compose',
  WHITEBOARD: 'whiteboard',
  SHEETS: 'sheets',
  TASKS: 'tasks',
  ROOM: 'room',
  ALL: 'all'
};

export const WORKSPACE_MUTATION_ACTIONS = {
  INSERT_BLOCK: 'insert_block',
  PATCH_BLOCK: 'patch_block',
  INSERT_NODE: 'insert_node',
  CONNECT_NODES: 'connect_nodes',
  PATCH_CELL: 'patch_cell',
  QUEUE_DIRECTIVE: 'queue_directive',
  STAGE_PR: 'stage_pr',
  COMMIT_PR: 'commit_pr',
  STATE_SYNC: 'state_sync'
};

// ── IN-MEMORY PERSISTENT STATE SNAPSHOT ───────────────────────────────────────

const activeWorkspaceSnapshot = {
  compose: {
    activeDocId: 'doc_default',
    title: 'Executive Architecture & Strategy Brief',
    contentHtml: '',
    blockCount: 0,
    lastUpdated: new Date().toISOString()
  },
  whiteboard: {
    nodeCount: 0,
    edgeCount: 0,
    nodes: [],
    edges: [],
    lastUpdated: new Date().toISOString()
  },
  sheets: {
    activeSheetId: 'sheet_financial_matrix',
    title: 'Q4 Financial Engineering Matrix',
    cellCoordinates: {},
    lastUpdated: new Date().toISOString()
  },
  tasks: {
    queuedDirectivesCount: 0,
    activeDirectives: [],
    lastUpdated: new Date().toISOString()
  },
  room: {
    activeMeetingId: null,
    title: 'Active Room Session',
    status: 'idle',
    lastSpokenIntent: null,
    stagedPrId: null,
    lastUpdated: new Date().toISOString()
  }
};

// ── PUB / SUB REGISTRY ───────────────────────────────────────────────────────

/**
 * Map of channel name -> Set of callback functions
 */
const channelListeners = {
  [WORKSPACE_APP_CHANNELS.COMPOSE]: new Set(),
  [WORKSPACE_APP_CHANNELS.WHITEBOARD]: new Set(),
  [WORKSPACE_APP_CHANNELS.SHEETS]: new Set(),
  [WORKSPACE_APP_CHANNELS.TASKS]: new Set(),
  [WORKSPACE_APP_CHANNELS.ROOM]: new Set(),
  [WORKSPACE_APP_CHANNELS.ALL]: new Set()
};

const mutationAuditLog = [];
const MAX_LOG_SIZE = 250;

// ── DISPATCH & BROADCAST ENGINE ──────────────────────────────────────────────

/**
 * Dispatch a workspace mutation across the reactive event bus.
 *
 * @param {string} targetApp  - Target app channel ('compose' | 'whiteboard' | 'sheets' | 'tasks' | 'room')
 * @param {object} payload    - Mutation details { action, description, before, after, data, isStaged, prNumber, branchId }
 * @param {object} options    - Additional dispatch flags { syncDomEvent: boolean, recordInGraph: boolean }
 * @returns {object} Dispatched event record
 */
export const dispatchWorkspaceMutation = (targetAppOrPayload, payload = {}, options = {}) => {
  let targetApp = targetAppOrPayload;
  let actualPayload = payload;
  let actualOptions = options;

  if (targetAppOrPayload && typeof targetAppOrPayload === 'object' && !Array.isArray(targetAppOrPayload)) {
    targetApp = targetAppOrPayload.targetApp || targetAppOrPayload.appId || WORKSPACE_APP_CHANNELS.COMPOSE;
    actualPayload = targetAppOrPayload;
    actualOptions = payload || {};
  }

  const channel = (typeof targetApp === 'string' ? targetApp : WORKSPACE_APP_CHANNELS.COMPOSE).toLowerCase();
  const eventId = `ws_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const deltaData = actualPayload.delta || actualPayload.data || {};

  const eventRecord = {
    id: eventId,
    targetApp: channel,
    appId: channel,
    action: actualPayload.action || WORKSPACE_MUTATION_ACTIONS.STATE_SYNC,
    description: actualPayload.description || `State mutation in ${channel}`,
    before: actualPayload.before !== undefined ? actualPayload.before : null,
    after: actualPayload.after !== undefined ? actualPayload.after : null,
    data: deltaData,
    delta: deltaData,
    status: actualPayload.isStaged ? 'staged' : 'committed',
    isStaged: Boolean(actualPayload.isStaged),
    branchId: actualPayload.branchId || actualPayload.entityId || null,
    prNumber: actualPayload.prNumber || deltaData.prNumber || null,
    timestamp,
    origin: actualPayload.origin || actualPayload.source || 'system',
    source: actualPayload.source || actualPayload.origin || 'system'
  };

  // 1. Update internal state snapshot
  if (activeWorkspaceSnapshot[channel]) {
    activeWorkspaceSnapshot[channel].lastUpdated = timestamp;
    if (payload.data) {
      Object.assign(activeWorkspaceSnapshot[channel], payload.data);
    }
  }

  // 2. Append to circular audit log
  mutationAuditLog.push(eventRecord);
  if (mutationAuditLog.length > MAX_LOG_SIZE) {
    mutationAuditLog.shift();
  }

  // 3. Notify channel-specific subscribers
  const specificListeners = channelListeners[channel] || new Set();
  specificListeners.forEach((listener) => {
    try {
      listener({ ...eventRecord }, { ...activeWorkspaceSnapshot });
    } catch (err) {
      console.error(`[WorkspaceStateBus] Listener error on channel "${channel}":`, err);
    }
  });

  // 4. Notify global 'all' subscribers
  channelListeners[WORKSPACE_APP_CHANNELS.ALL].forEach((listener) => {
    try {
      listener({ ...eventRecord }, { ...activeWorkspaceSnapshot });
    } catch (err) {
      console.error('[WorkspaceStateBus] Global listener error:', err);
    }
  });

  // 5. Fire native browser CustomEvent for external DOM integration if available
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      const customEvt = new CustomEvent('regaarder:workspace-mutation', {
        detail: eventRecord
      });
      window.dispatchEvent(customEvt);
    } catch (domErr) {
      console.warn('[WorkspaceStateBus] Failed to dispatch CustomEvent:', domErr);
    }
  }

  // 6. Record into Universal Context Graph if requested (default true)
  if (options.recordInGraph !== false) {
    try {
      recordWorkspaceMutationNode(eventRecord);
    } catch (_gErr) {
      // Non-blocking graph sync
    }
  }

  return eventRecord;
};

// ── SUBSCRIPTION INTERFACES ──────────────────────────────────────────────────

/**
 * Subscribe to mutations for a specific workspace application.
 *
 * @param {string} appChannel - 'compose' | 'whiteboard' | 'sheets' | 'tasks' | 'room' | 'all'
 * @param {Function} callback - Callback function(mutation, snapshot)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToWorkspaceApp = (appChannel, callback) => {
  if (typeof callback !== 'function') return () => {};
  const channel = (appChannel || WORKSPACE_APP_CHANNELS.ALL).toLowerCase();

  if (!channelListeners[channel]) {
    channelListeners[channel] = new Set();
  }

  channelListeners[channel].add(callback);

  // Return unsubscribe closure
  return () => {
    if (channelListeners[channel]) {
      channelListeners[channel].delete(callback);
    }
  };
};

/**
 * Subscribe to all mutations across all workspace applications.
 *
 * @param {Function} callback - Callback function(mutation, snapshot)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAllMutations = (callback) => {
  return subscribeToWorkspaceApp(WORKSPACE_APP_CHANNELS.ALL, callback);
};

// ── CROSS-APP ROOM SYNCHRONIZER ──────────────────────────────────────────────

/**
 * Synchronize an epistemic in-meeting intent across all relevant applications.
 * Called directly by RoomObserverEngine to achieve zero-latency live state updates.
 *
 * @param {object} intent         - Epistemic intent { type, extractedData, confidence }
 * @param {object} mutationRecord - Generated mutation record { targetApp, description, before, after, status, branchId }
 * @returns {Array<object>} Array of dispatched event records across all impacted apps
 */
export const syncCrossAppIntent = (intent, mutationRecord = {}) => {
  if (!intent || !intent.type) return [];
  const eventsDispatched = [];

  // Primary dispatch to the direct target application
  const primaryEvent = dispatchWorkspaceMutation(mutationRecord.targetApp || 'compose', {
    action: intent.type,
    description: mutationRecord.description || `Spoken intent: ${intent.type}`,
    before: mutationRecord.before,
    after: mutationRecord.after,
    isStaged: mutationRecord.status === 'staged',
    branchId: mutationRecord.branchId || null,
    prNumber: mutationRecord.prNumber || null,
    origin: 'room_observer',
    data: {
      intentType: intent.type,
      extractedData: intent.extractedData
    }
  });
  eventsDispatched.push(primaryEvent);

  // Secondary propagation: if decision or directive, ensure Compose documentation is notified
  if (mutationRecord.targetApp !== 'compose' && intent.type === 'action_directive') {
    const docEvent = dispatchWorkspaceMutation(WORKSPACE_APP_CHANNELS.COMPOSE, {
      action: WORKSPACE_MUTATION_ACTIONS.INSERT_BLOCK,
      description: `Meeting minute action item: ${intent.extractedData?.title || 'Action'}`,
      before: '',
      after: `<p class="text-xs text-amber-700 dark:text-amber-300"><strong>[Action Item - ${intent.extractedData?.assignee || 'Agent'}]:</strong> ${intent.extractedData?.title || ''}</p>`,
      isStaged: mutationRecord.status === 'staged',
      branchId: mutationRecord.branchId,
      origin: 'room_observer_propagation',
      data: {
        linkedDirectiveId: primaryEvent.id
      }
    });
    eventsDispatched.push(docEvent);
  }

  // Update room snapshot
  if (activeWorkspaceSnapshot.room) {
    activeWorkspaceSnapshot.room.lastSpokenIntent = intent;
    activeWorkspaceSnapshot.room.stagedPrId = mutationRecord.branchId || null;
    activeWorkspaceSnapshot.room.lastUpdated = new Date().toISOString();
  }

  return eventsDispatched;
};

// ── STATE QUERY & MUTATION LOG AUDIT ─────────────────────────────────────────

/**
 * Retrieve the current live workspace snapshot across all applications.
 */
export const getWorkspaceLiveState = () => {
  return JSON.parse(JSON.stringify(activeWorkspaceSnapshot));
};

/**
 * Update the state snapshot for a specific application.
 * Called by UI components on mount or local state change to keep bus updated.
 */
export const updateAppState = (app, partialState = {}) => {
  const channel = (app || '').toLowerCase();
  if (activeWorkspaceSnapshot[channel]) {
    Object.assign(activeWorkspaceSnapshot[channel], partialState);
    activeWorkspaceSnapshot[channel].lastUpdated = new Date().toISOString();
  }
};

/**
 * Retrieve circular mutation audit log.
 */
export const getMutationAuditLog = () => {
  return [...mutationAuditLog];
};

/**
 * Reset all subscribers and state for testing isolation.
 */
export const resetWorkspaceStateBusForTesting = () => {
  Object.keys(channelListeners).forEach((k) => channelListeners[k].clear());
  mutationAuditLog.length = 0;
};
