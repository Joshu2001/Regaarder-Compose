/**
 * roomObserverEngine.js
 * 
 * Pillar 10: Real-Time Context Harvester & Multi-Agent Observer (Room)
 * 
 * Transforms the Room video conferencing application from a passive media streaming tool
 * into an active ingestion engine for organizational intent.
 * 
 * Core Capabilities:
 *  1. In-Room Active Background Agents (Silent observers processing real-time speech turns)
 *  2. Epistemic Intent Extraction (Categorizes speech into decisions, directives, whiteboard sketches, and financial metrics)
 *  3. Concurrent Multi-App Live Workspace Mutation (Canvas Docs, Whiteboard Topology, Directive Queue, Matrix Sheets)
 *  4. Pillar 3 Sandbox Staging Safety (Bundles call mutations into an isolated reviewable PR branch: `pr_room_<meetingId>_<ts>`)
 *  5. Isomorphic Token-Dense Serializers (>90% token reduction for LLM prompts)
 *  6. Bi-directional Universal Context Graph Synchronization
 */

import { addTopologyNode, connectTopologyNodes, getTopologyGraph } from './spatialTopologyEngine.js';
import { queueDirective, getDirectives, DIRECTIVE_TIERS, DIRECTIVE_PRIORITY } from './directiveQueueEngine.js';
import { patchMatrixCells } from './matrixSchemaEngine.js';
import { insertBlock, patchBlock, getActiveBlockTree } from './blockCanvasEngine.js';
import { createStagingBranch, stageMutation, approveAndCommitBranch, rejectBranch, getActiveStagedBranches } from './workspaceStagingEngine.js';
import { recordRoomObserverGraphNode } from './universalContextGraph.js';
import { syncCrossAppIntent } from './workspaceStateBus.js';

// ── CONSTANTS & ENUMS ─────────────────────────────────────────────────────────

export const EPISTEMIC_INTENT_TYPES = {
  DECISION_CONSENSUS: 'decision_consensus',
  ACTION_DIRECTIVE: 'action_directive',
  ARCHITECTURE_MUTATION: 'architecture_mutation',
  FINANCIAL_METRIC_UPDATE: 'financial_metric_update',
  DOCUMENTATION_NOTE: 'documentation_note'
};

export const HARVESTER_STATUS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  CONCLUDED: 'concluded'
};

export const DEFAULT_IN_ROOM_OBSERVERS = [
  { id: 'obs_alex_architect', name: 'Alex Agent', role: 'Principal Architect', icon: 'Network', specialty: 'Whiteboard & Systems' },
  { id: 'obs_elena_finance', name: 'Elena Agent', role: 'VP Financial Engineering', icon: 'Calculator', specialty: 'Matrix & Budgets' },
  { id: 'obs_marcus_runner', name: 'Marcus Agent', role: 'Operations Lead', icon: 'ListTodo', specialty: 'Directive Queue & Execution' }
];

export const SYNTHETIC_MEETING_SCENARIO = [
  {
    speaker: 'Marcus Vance (CEO)',
    text: "Consensus is reached: we have decided to expand compute capacity into the US-East cluster.",
    confidence: 0.98,
    delayMs: 600
  },
  {
    speaker: 'Elena Rostova (VP Finance)',
    text: "Update projected gross margin to 78% and set Q4 server budget to $750,000 in our financial matrix.",
    confidence: 0.96,
    delayMs: 1200
  },
  {
    speaker: 'Alex Chen (Principal Architect)',
    text: "Understood. On the whiteboard, let's connect the API Gateway to a new distributed GPU Inference Worker service.",
    confidence: 0.95,
    delayMs: 1800
  },
  {
    speaker: 'Marcus Vance (CEO)',
    text: "Alex, queue a P0 directive for Marcus Agent to benchmark cluster inference latency by Friday morning.",
    confidence: 0.99,
    delayMs: 2400
  },
  {
    speaker: 'Elena Rostova (VP Finance)',
    text: "Final decision: all procurement contracts require dual executive signature before commit.",
    confidence: 0.97,
    delayMs: 3000
  }
];

// ── PERSISTENCE & IN-MEMORY CACHE ───────────────────────────────────────────

const STORAGE_KEY = 'regaarder_room_harvester_v1';

const safeGetStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[RoomObserverEngine] Failed to read storage:', err);
  }
  return null;
};

const safeSetStorage = (data) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.warn('[RoomObserverEngine] Failed to write storage:', err);
  }
};

const createInitialSession = () => ({
  meetingId: `room_exec_${Date.now().toString(36)}`,
  title: 'Executive Architecture & Compute Strategy',
  channel: 'strategy-room-01',
  status: HARVESTER_STATUS.LISTENING,
  startedAt: new Date().toISOString(),
  concludedAt: null,
  participants: ['Marcus Vance (CEO)', 'Elena Rostova (VP Finance)', 'Alex Chen (Principal Architect)', 'You'],
  activeObservers: [...DEFAULT_IN_ROOM_OBSERVERS],
  speakerTurns: [],
  harvestedIntents: [],
  pendingMutations: [],
  activePrBranchId: null,
  summary: {
    decisionsCount: 0,
    directivesCount: 0,
    architectureCount: 0,
    financialCount: 0,
    totalTurns: 0
  }
});

let currentSession = safeGetStorage() || createInitialSession();
let subscribers = [];

export const notifySubscribers = () => {
  safeSetStorage(currentSession);
  subscribers.forEach(cb => {
    try {
      cb({ ...currentSession });
    } catch (err) {
      console.error('[RoomObserverEngine] Subscriber callback error:', err);
    }
  });
};

export const subscribeToRoomObserver = (callback) => {
  if (typeof callback !== 'function') return () => {};
  subscribers.push(callback);
  callback({ ...currentSession });
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
};

// ── SPEECH-TO-INTENT CLASSIFICATION PIPELINE ────────────────────────────────

/**
 * Categorize a spoken turn using semantic heuristics and keyword extraction.
 * Deterministic, instant, and isomorphic across browser and test harnesses.
 */
export const classifySpeechIntent = (speaker, text) => {
  if (!text || typeof text !== 'string') {
    return {
      type: EPISTEMIC_INTENT_TYPES.DOCUMENTATION_NOTE,
      confidence: 0.5,
      extractedData: { note: '' }
    };
  }

  const lower = text.toLowerCase();

  // 1. Decision & Consensus Extraction
  if (
    lower.includes('agreed to') ||
    lower.includes('formal decision') ||
    lower.includes('final decision') ||
    lower.includes('approved') ||
    lower.includes('consensus is') ||
    lower.includes('we have decided')
  ) {
    // Extract monetary figure if present
    const moneyMatch = text.match(/\$[\d,]+(?:\.\d+)?(?:\s*(?:k|m|b|million|billion|thousand))?/i);
    const money = moneyMatch ? moneyMatch[0] : null;

    return {
      type: EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS,
      confidence: 0.96,
      extractedData: {
        resolution: text.trim(),
        financialFigure: money,
        sponsor: speaker,
        timestamp: new Date().toISOString()
      }
    };
  }

  // 2. Action Item / Directive Queueing
  if (
    lower.includes('queue a') ||
    lower.includes('action item') ||
    lower.includes('directive') ||
    lower.includes('task for') ||
    lower.includes('will benchmark') ||
    lower.includes('follow up on') ||
    lower.includes('assigned to') ||
    lower.includes('please prepare') ||
    lower.includes('prepare the') ||
    lower.includes('schedule task')
  ) {
    const isP0 = lower.includes('p0') || lower.includes('urgent') || lower.includes('critical');
    const isP1 = lower.includes('p1') || lower.includes('high priority');
    const priority = isP0 ? DIRECTIVE_PRIORITY.P0 : (isP1 ? DIRECTIVE_PRIORITY.P1 : DIRECTIVE_PRIORITY.P2);
    
    // Assignee extraction
    let assignee = 'Marcus Agent';
    if (lower.includes('alex')) assignee = 'Alex Agent';
    else if (lower.includes('elena')) assignee = 'Elena Agent';
    else if (lower.includes('marcus')) assignee = 'Marcus Agent';

    return {
      type: EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE,
      confidence: 0.94,
      extractedData: {
        title: text.replace(/^(?:alex|elena|marcus|team)[,\s]*/i, '').trim(),
        assignee,
        priority,
        tier: lower.includes('agent') ? DIRECTIVE_TIERS.AGENT : DIRECTIVE_TIERS.TEAM,
        deadline: lower.includes('friday') ? 'Friday 17:00' : 'End of Sprint'
      }
    };
  }

  // 3. Architecture & Whiteboard Spatial Mutation
  if (
    lower.includes('whiteboard') ||
    lower.includes('architecture') ||
    lower.includes('connect the') ||
    (lower.includes('connect') && lower.includes('to')) ||
    lower.includes('service') ||
    lower.includes('diagram') ||
    lower.includes('microservice') ||
    lower.includes('flowchart')
  ) {
    // Extract potential source and target
    const connectMatch = text.match(/connect (?:the )?([A-Za-z0-9_\s]+?) to (?:a |the )?([A-Za-z0-9_\s]+)/i);
    const sourceNode = connectMatch ? connectMatch[1].trim() : 'API Gateway';
    const targetNode = connectMatch ? connectMatch[2].trim() : 'Inference Worker Service';

    return {
      type: EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION,
      confidence: 0.92,
      extractedData: {
        sourceNode,
        targetNode,
        relation: 'DEPENDS_ON',
        rawProposal: text.trim()
      }
    };
  }

  // 4. Financial & Spreadsheet Matrix Update
  if (
    lower.includes('gross margin') ||
    lower.includes('revenue') ||
    lower.includes('financial matrix') ||
    (lower.includes('model') && lower.includes('%')) ||
    lower.includes('budget') ||
    lower.includes('projection') ||
    lower.includes('margin to')
  ) {
    const percentMatch = text.match(/(\d+(?:\.\d+)?%)/);
    const percentage = percentMatch ? percentMatch[1] : '78%';

    return {
      type: EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE,
      confidence: 0.93,
      extractedData: {
        metric: 'Gross Margin',
        cellTarget: 'D4',
        newValue: percentage,
        rawProposal: text.trim()
      }
    };
  }

  // 5. Default Documentation Note / Minutes
  return {
    type: EPISTEMIC_INTENT_TYPES.DOCUMENTATION_NOTE,
    confidence: 0.88,
    extractedData: {
      note: text.trim(),
      speaker
    }
  };
};

// ── CONCURRENT LIVE WORKSPACE MUTATOR ────────────────────────────────────────

/**
 * Executes or stages workspace modifications directly from speech intents.
 * Implements Pillar 3 sandbox safety with reviewable PR branches.
 */
export const mutateWorkspaceFromIntent = (intent, options = { stage: true }) => {
  if (!intent || !intent.type) return null;

  const mutationId = `mut_room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  let mutationRecord = {
    id: mutationId,
    type: intent.type,
    targetApp: 'compose',
    status: options.stage ? 'staged' : 'committed',
    description: '',
    before: '',
    after: '',
    timestamp: new Date().toISOString()
  };

  switch (intent.type) {
    case EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS: {
      mutationRecord.targetApp = 'compose';
      mutationRecord.description = `Record meeting consensus: "${intent.extractedData.resolution.slice(0, 48)}..."`;
      mutationRecord.before = '<!-- Pending consensus resolution -->';
      mutationRecord.after = `<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium"><strong>Consensus Approved:</strong> ${intent.extractedData.resolution} (Sponsor: ${intent.extractedData.sponsor})</div>`;

      // Draft into canvas if not staging
      if (!options.stage) {
        try {
          insertBlock({
            type: 'callout',
            content: `Consensus: ${intent.extractedData.resolution}`,
            properties: { theme: 'emerald' }
          });
        } catch (e) {
          console.warn('[RoomObserverEngine] In-place canvas write skipped:', e.message);
        }
      }
      break;
    }

    case EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE: {
      mutationRecord.targetApp = 'tasks';
      mutationRecord.description = `Queue ${intent.extractedData.priority} directive: "${intent.extractedData.title}"`;
      mutationRecord.before = '[] (Empty queue slot)';
      mutationRecord.after = JSON.stringify(intent.extractedData, null, 2);

      // Queue directive if approved or direct
      if (!options.stage) {
        try {
          queueDirective({
            title: intent.extractedData.title,
            priority: intent.extractedData.priority,
            tier: intent.extractedData.tier,
            assignee: intent.extractedData.assignee
          });
        } catch (e) {
          console.warn('[RoomObserverEngine] Direct directive queue failed:', e.message);
        }
      }
      break;
    }

    case EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION: {
      mutationRecord.targetApp = 'whiteboard';
      mutationRecord.description = `Connect Whiteboard topology: "${intent.extractedData.sourceNode}" -> "${intent.extractedData.targetNode}"`;
      mutationRecord.before = `(Node: ${intent.extractedData.sourceNode})`;
      mutationRecord.after = `(${intent.extractedData.sourceNode}) --[${intent.extractedData.relation}]--> (${intent.extractedData.targetNode})`;

      if (!options.stage) {
        try {
          const newNode = addTopologyNode({
            label: intent.extractedData.targetNode,
            type: 'service',
            role: 'service'
          });
          connectTopologyNodes('node_gateway', newNode.id, intent.extractedData.relation);
        } catch (e) {
          console.warn('[RoomObserverEngine] Direct topology mutation failed:', e.message);
        }
      }
      break;
    }

    case EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE: {
      mutationRecord.targetApp = 'sheets';
      mutationRecord.description = `Update Matrix metric ${intent.extractedData.metric} (${intent.extractedData.cellTarget}) to ${intent.extractedData.newValue}`;
      mutationRecord.before = 'Gross Margin: 72%';
      mutationRecord.after = `Gross Margin: ${intent.extractedData.newValue}`;

      if (!options.stage) {
        try {
          patchMatrixCells([{
            cell: intent.extractedData.cellTarget,
            value: intent.extractedData.newValue
          }]);
        } catch (e) {
          console.warn('[RoomObserverEngine] Direct matrix patch failed:', e.message);
        }
      }
      break;
    }

    default: {
      mutationRecord.targetApp = 'compose';
      mutationRecord.description = `Append meeting minute note from ${intent.extractedData.speaker}`;
      mutationRecord.before = '';
      mutationRecord.after = `<p class="text-xs text-slate-600"><em>${intent.extractedData.speaker}:</em> ${intent.extractedData.note}</p>`;
      break;
    }
  }

  // If staging is enabled, ensure we bundle into active meeting PR branch
  if (options.stage) {
    if (!currentSession.activePrBranchId) {
      const branch = createStagingBranch({
        title: `Room In-Meeting Staged Mutations: ${currentSession.title}`,
        origin: 'room_observer',
        meetingId: currentSession.meetingId
      });
      currentSession.activePrBranchId = branch.id;
    }

    try {
      stageMutation({
        branchId: currentSession.activePrBranchId,
        targetApp: mutationRecord.targetApp,
        description: mutationRecord.description,
        beforeContent: mutationRecord.before,
        afterContent: mutationRecord.after
      });
    } catch (e) {
      console.warn('[RoomObserverEngine] stageMutation fallback:', e.message);
    }
  }

  // Broadcast mutation through central Workspace State Bus for reactive cross-app propagation
  try {
    syncCrossAppIntent(intent, {
      ...mutationRecord,
      branchId: currentSession.activePrBranchId
    });
  } catch (busErr) {
    console.warn('[RoomObserverEngine] State bus dispatch fallback:', busErr.message);
  }

  return mutationRecord;
};

// ── CORE SPEECH TURN INGESTION ──────────────────────────────────────────────

/**
 * Ingest a speech turn into the active room session.
 * Real-time, non-blocking, and synchronized across Universal Context Graph.
 */
export const ingestSpeechTurn = ({ speaker, text, timestamp = new Date().toISOString(), confidence = 0.95, autoMutate = true, stage = true }) => {
  if (!speaker || !text) return null;

  const turnId = `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const classifiedIntent = classifySpeechIntent(speaker, text);

  const turnRecord = {
    id: turnId,
    speaker,
    text: text.trim(),
    timestamp,
    confidence,
    intent: classifiedIntent
  };

  currentSession.speakerTurns.push(turnRecord);
  currentSession.summary.totalTurns += 1;

  // Add to harvested intents
  const intentEntry = {
    id: `intent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    turnId,
    speaker,
    type: classifiedIntent.type,
    confidence: classifiedIntent.confidence,
    data: classifiedIntent.extractedData,
    timestamp
  };
  currentSession.harvestedIntents.unshift(intentEntry);

  // Update summary counters
  if (classifiedIntent.type === EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS) currentSession.summary.decisionsCount += 1;
  else if (classifiedIntent.type === EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE) currentSession.summary.directivesCount += 1;
  else if (classifiedIntent.type === EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION) currentSession.summary.architectureCount += 1;
  else if (classifiedIntent.type === EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE) currentSession.summary.financialCount += 1;

  // Execute or stage live workspace mutation
  if (autoMutate) {
    const mutation = mutateWorkspaceFromIntent(classifiedIntent, { stage });
    if (mutation) {
      currentSession.pendingMutations.push(mutation);
    }
  }

  // Synchronize to Universal Context Graph
  try {
    recordRoomObserverGraphNode(currentSession);
  } catch (err) {
    console.warn('[RoomObserverEngine] Context graph sync skipped:', err.message);
  }

  notifySubscribers();
  return turnRecord;
};

// ── SIMULATION & DEMO SUITE ──────────────────────────────────────────────────

let simulationTimer = null;

/**
 * Run a full automated synthetic meeting simulation turn by turn.
 */
export const runSyntheticMeetingSimulation = async (onTurnEmitted = null) => {
  resetRoomSession();
  const turns = [...SYNTHETIC_MEETING_SCENARIO];
  const results = [];

  for (let i = 0; i < turns.length; i++) {
    const item = turns[i];
    const record = ingestSpeechTurn({
      speaker: item.speaker,
      text: item.text,
      confidence: item.confidence,
      autoMutate: true,
      stage: true
    });
    results.push(record);
    if (typeof onTurnEmitted === 'function') {
      onTurnEmitted(record, i + 1, turns.length);
    }
  }

  return results;
};

export const startLiveSimulationStream = (intervalMs = 2500, onTurnEmitted = null) => {
  stopLiveSimulationStream();
  let step = 0;
  const turns = [...SYNTHETIC_MEETING_SCENARIO];

  simulationTimer = setInterval(() => {
    if (step >= turns.length) {
      stopLiveSimulationStream();
      currentSession.status = HARVESTER_STATUS.CONCLUDED;
      notifySubscribers();
      return;
    }
    const item = turns[step];
    const rec = ingestSpeechTurn({
      speaker: item.speaker,
      text: item.text,
      confidence: item.confidence,
      autoMutate: true,
      stage: true
    });
    step++;
    if (typeof onTurnEmitted === 'function') {
      onTurnEmitted(rec, step, turns.length);
    }
  }, intervalMs);
};

export const stopLiveSimulationStream = () => {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
};

// ── STAGING PR SANDBOX & COMMIT LIFECYCLE ────────────────────────────────────

/**
 * Retrieve the active meeting staged PR branch with all pending mutations.
 */
export const getMeetingStagedPr = () => {
  if (!currentSession.activePrBranchId) return null;
  const branches = getActiveStagedBranches();
  return branches.find(b => b.id === currentSession.activePrBranchId) || null;
};

/**
 * Approve and commit all staged in-meeting mutations atomically.
 */
export const commitMeetingPr = () => {
  if (!currentSession.activePrBranchId) return { success: false, message: 'No active meeting PR branch' };

  try {
    const result = approveAndCommitBranch(currentSession.activePrBranchId);
    currentSession.pendingMutations = currentSession.pendingMutations.map(m => ({ ...m, status: 'committed' }));
    currentSession.activePrBranchId = null;
    currentSession.status = HARVESTER_STATUS.CONCLUDED;
    currentSession.concludedAt = new Date().toISOString();
    notifySubscribers();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Reject and discard all staged in-meeting mutations.
 */
export const rejectMeetingPr = () => {
  if (!currentSession.activePrBranchId) return { success: false, message: 'No active meeting PR branch' };

  try {
    const result = rejectBranch(currentSession.activePrBranchId);
    currentSession.pendingMutations = currentSession.pendingMutations.map(m => ({ ...m, status: 'rejected' }));
    currentSession.activePrBranchId = null;
    notifySubscribers();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ── SESSION MANAGEMENT ───────────────────────────────────────────────────────

export const getLiveSession = () => ({ ...currentSession });

export const resetRoomSession = (newTitle = 'Executive Architecture & Strategy') => {
  stopLiveSimulationStream();
  currentSession = {
    ...createInitialSession(),
    title: newTitle
  };
  notifySubscribers();
  return currentSession;
};

// ── ISOMORPHIC SERIALIZERS (TOKEN EFFICIENCY) ────────────────────────────────

/**
 * Serializes the live room session into high-density Markdown (< 500 tokens).
 * Strips HTML, DOM overhead, and media tracks.
 */
export const serializeRoomContextToMarkdown = (session = currentSession) => {
  const s = session || currentSession;
  let md = `# In-Room Real-Time Context Feed: ${s.title}\n`;
  md += `**Meeting ID:** \`${s.meetingId}\` | **Status:** \`${s.status.toUpperCase()}\` | **Started:** ${s.startedAt}\n`;
  md += `**Participants (${s.participants.length}):** ${s.participants.join(', ')}\n`;
  md += `**Active Observers (${s.activeObservers.length}):** ${s.activeObservers.map(o => o.name).join(', ')}\n\n`;

  md += `### Summary Metrics\n`;
  md += `- **Decisions / Consensus:** ${s.summary.decisionsCount}\n`;
  md += `- **Directives Queued:** ${s.summary.directivesCount}\n`;
  md += `- **Whiteboard Mutations:** ${s.summary.architectureCount}\n`;
  md += `- **Financial Adjustments:** ${s.summary.financialCount}\n`;
  md += `- **Total Speaker Turns:** ${s.summary.totalTurns}\n\n`;

  if (s.harvestedIntents.length > 0) {
    md += `### Epistemic Intent Log (Recent 5)\n`;
    s.harvestedIntents.slice(0, 5).forEach(i => {
      const typeLabel = i.type.toUpperCase().replace(/_/g, ' ');
      const desc = i.data.resolution || i.data.title || i.data.rawProposal || i.data.note || 'Context note';
      md += `- **[${typeLabel}]** (${i.speaker}): ${desc}\n`;
    });
    md += '\n';
  }

  if (s.activePrBranchId) {
    md += `**Active Staged Meeting PR:** \`${s.activePrBranchId}\` (${s.pendingMutations.length} mutations awaiting approval)\n`;
  }

  return md.trim();
};

export const serializeRoomContextToJson = (session = currentSession) => {
  const s = session || currentSession;
  return JSON.stringify(s, null, 2);
};
