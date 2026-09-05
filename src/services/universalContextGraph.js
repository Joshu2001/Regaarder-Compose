/**
 * universalContextGraph.js
 * 
 * Pillar 1: Universal Context Graph & Reactive Memory Bank Substrate
 * 
 * Closes the 30% gap in the AI-native workspace foundation:
 * 1. Persistent Agent Memory Bank (rules, preferences, historical decisions, epistemic status)
 * 2. Reactive Cross-Workspace State Engine (event bus, subscription runtime)
 * 3. Automated Dependency Traversal & Mutation Propagation (updates linked Docs, Sheets, Tasks)
 * 4. Token-Optimized Machine Execution Context (JSON-LD and stripped semantic feeds for LLMs)
 */

import {
  INITIAL_ORB_ENTITIES,
  INITIAL_ORB_EDGES,
  ORB_ENTITY_TYPES,
  ORB_RELATION_TYPES,
  ORB_EPISTEMIC_STATUS
} from './orbKnowledgeGraphService.js';

// Storage Keys
const MEMORY_BANK_STORAGE_KEY = 'regaarder_memory_bank_v1';
const GRAPH_ENTITIES_STORAGE_KEY = 'regaarder_context_graph_entities_v1';
const GRAPH_EDGES_STORAGE_KEY = 'regaarder_context_graph_edges_v1';
const PROPAGATION_HISTORY_KEY = 'regaarder_propagation_history_v1';
const DOCUMENTS_STORAGE_KEY = 'regaarder_documents_v1';

// Initial Memory Bank State
const DEFAULT_MEMORY_BANK = {
  instructions: [
    {
      id: 'inst-default-1',
      text: 'Always maintain executive Apple-tier aesthetic: sharp corner radiuses, translucent frosted glass, zero clutter, no pill shapes.',
      category: 'design_guidelines',
      project: 'Global Workspace',
      priority: 'strict',
      createdAt: '2026-08-01T00:00:00Z',
      source: 'Executive Architecture Directives'
    },
    {
      id: 'inst-default-2',
      text: 'For small local models (<=3B parameters), prune conversation history to 2 turns and route directly to translation/extraction system prompts.',
      category: 'ai_orchestration',
      project: 'Relay AI',
      priority: 'strict',
      createdAt: '2026-08-15T00:00:00Z',
      source: 'Hardware Offload Optimizer'
    }
  ],
  preferences: [
    { key: 'default_model', value: 'gemini-2.0-flash', scope: 'global', updatedAt: '2026-08-01T00:00:00Z' },
    { key: 'dark_mode_preference', value: 'system', scope: 'ui', updatedAt: '2026-08-01T00:00:00Z' },
    { key: 'auto_propagate_cross_app', value: true, scope: 'graph', updatedAt: '2026-08-01T00:00:00Z' }
  ],
  rules: [
    {
      id: 'rule-procurement-1',
      rule: 'Dual-Sourcing Requirement: No single fab location or OSAT partner may exceed 60% total compute supply by Q4 2027.',
      project: 'Supply Chain Resilience',
      enforcement: 'strict',
      createdAt: '2026-08-13T10:20:00Z'
    },
    {
      id: 'rule-compliance-1',
      rule: 'SOC 2 Type II certification and 3.5x pipeline coverage must be validated before releasing capital for AE headcount scaling.',
      project: 'Enterprise Expansion',
      enforcement: 'strict',
      createdAt: '2026-08-18T17:30:00Z'
    }
  ],
  decisions: [
    {
      id: 'dec-nv-18b',
      title: 'Authorize $1.8B advanced inventory commitment for Blackwell architecture',
      rationale: 'Validated against Alex Vance $48.2B financial model and Michelle Chen packaging mitigation roadmap.',
      approver: 'Executive Committee (CEO, CFO, VP Strategy)',
      status: 'Executed',
      workspace: 'compose',
      financialImpact: '$1.80 Billion',
      impactedEntities: ['ent_nv_memo', 'ent_nv_sheet', 'ent_nv_deck'],
      createdAt: '2026-08-18T17:30:00Z'
    }
  ]
};

// ── In-Memory Reactive Cache ──
let memoryBankCache = null;
let graphEntitiesCache = null;
let graphEdgesCache = null;
let propagationHistoryCache = null;

// Reactive Subscription Listeners: Map<topicOrId, Set<Callback>>
const subscribers = new Map();

/**
 * Safely parse JSON from localStorage with fallback
 */
const safeGetItem = (key, fallback) => {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[UniversalContextGraph] Failed to parse localStorage key: ${key}`, e);
    return fallback;
  }
};

/**
 * Safely write JSON to localStorage
 */
const safeSetItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[UniversalContextGraph] Failed to persist localStorage key: ${key}`, e);
  }
};

// ── Initialization & Cache Hydration ──
export const initializeContextGraph = () => {
  if (!memoryBankCache) {
    memoryBankCache = safeGetItem(MEMORY_BANK_STORAGE_KEY, DEFAULT_MEMORY_BANK);
  }
  if (!graphEntitiesCache) {
    const persisted = safeGetItem(GRAPH_ENTITIES_STORAGE_KEY, null);
    const defaults = Array.isArray(INITIAL_ORB_ENTITIES) ? INITIAL_ORB_ENTITIES : [];
    graphEntitiesCache = persisted && persisted.length > 0 ? persisted : [...defaults];
  }
  if (!graphEdgesCache) {
    const persisted = safeGetItem(GRAPH_EDGES_STORAGE_KEY, null);
    const defaults = Array.isArray(INITIAL_ORB_EDGES) ? INITIAL_ORB_EDGES : [];
    graphEdgesCache = persisted && persisted.length > 0 ? persisted : [...defaults];
  }
  if (!propagationHistoryCache) {
    propagationHistoryCache = safeGetItem(PROPAGATION_HISTORY_KEY, []);
  }
  return {
    entitiesCount: graphEntitiesCache.length,
    edgesCount: graphEdgesCache.length,
    instructionsCount: memoryBankCache.instructions.length,
    decisionsCount: memoryBankCache.decisions.length
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PERSISTENT AGENT MEMORY BANK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Store a new instruction or project axiom into persistent agent memory
 */
export const rememberInstruction = ({
  text,
  category = 'general',
  project = 'Global Workspace',
  priority = 'standard',
  source = 'User Chat'
}) => {
  if (!text || !text.trim()) return null;
  initializeContextGraph();

  const newInstruction = {
    id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: text.trim(),
    category,
    project,
    priority,
    createdAt: new Date().toISOString(),
    source
  };

  memoryBankCache.instructions = [newInstruction, ...memoryBankCache.instructions];
  safeSetItem(MEMORY_BANK_STORAGE_KEY, memoryBankCache);
  notifySubscribers('memory_instructions', memoryBankCache.instructions);
  return newInstruction;
};

/**
 * Retrieve persistent project rules and constraints
 */
export const getProjectRules = (projectFilter = null) => {
  initializeContextGraph();
  if (!projectFilter) return memoryBankCache.rules;
  const filterLower = projectFilter.toLowerCase();
  return memoryBankCache.rules.filter(r => 
    r.project.toLowerCase().includes(filterLower) || 
    r.project === 'Global Workspace'
  );
};

/**
 * Add a strict or advisory rule to the memory bank
 */
export const addProjectRule = ({ rule, project = 'Global Workspace', enforcement = 'strict' }) => {
  if (!rule || !rule.trim()) return null;
  initializeContextGraph();

  const newRule = {
    id: `rule-${Date.now()}`,
    rule: rule.trim(),
    project,
    enforcement,
    createdAt: new Date().toISOString()
  };

  memoryBankCache.rules = [newRule, ...memoryBankCache.rules];
  safeSetItem(MEMORY_BANK_STORAGE_KEY, memoryBankCache);
  notifySubscribers('memory_rules', memoryBankCache.rules);
  return newRule;
};

/**
 * Record a strategic decision with full epistemic provenance
 */
export const recordDecision = ({
  title,
  rationale,
  approver = 'Executive User',
  workspace = 'compose',
  financialImpact = 'N/A',
  impactedEntities = []
}) => {
  if (!title) return null;
  initializeContextGraph();

  const newDecision = {
    id: `dec-${Date.now()}`,
    title,
    rationale: rationale || 'Direct user approval logged in workspace session.',
    approver,
    status: 'Approved',
    workspace,
    financialImpact,
    impactedEntities: Array.isArray(impactedEntities) ? impactedEntities : [],
    createdAt: new Date().toISOString()
  };

  memoryBankCache.decisions = [newDecision, ...memoryBankCache.decisions];
  safeSetItem(MEMORY_BANK_STORAGE_KEY, memoryBankCache);

  // Also reflect decision as a node in the active Knowledge Graph
  const decisionNode = {
    id: `ent_dec_${Date.now()}`,
    type: ORB_ENTITY_TYPES.DECISION,
    workspace,
    title: `Decision: ${title}`,
    author: approver,
    authorRole: 'Decision Authority',
    updatedAt: newDecision.createdAt,
    project: 'Strategic Decisions',
    tags: ['Decision', 'Persistent Memory', workspace],
    excerpt: rationale || title,
    content: `${title}\nRationale: ${rationale}\nFinancial Impact: ${financialImpact}`,
    metadata: {
      decisionId: newDecision.id,
      financialImpact,
      status: 'Approved'
    }
  };

  graphEntitiesCache = [decisionNode, ...graphEntitiesCache];
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  // Create links from decision to impacted entities
  (impactedEntities || []).forEach(targetId => {
    graphEdgesCache.push({
      id: `edge_${decisionNode.id}_to_${targetId}`,
      sourceId: decisionNode.id,
      targetId: targetId,
      relationType: ORB_RELATION_TYPES.DECIDED_BY,
      label: `Governed by executive decision: ${title}`,
      epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
      isAiInferred: false,
      confidenceScore: 1.0,
      lenses: ['decisions', 'timeline']
    });
  });
  safeSetItem(GRAPH_EDGES_STORAGE_KEY, graphEdgesCache);

  notifySubscribers('memory_decisions', memoryBankCache.decisions);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return newDecision;
};

/**
 * Get all persistent memory bank records
 */
export const getMemoryBank = () => {
  initializeContextGraph();
  return { ...memoryBankCache };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. REACTIVE EVENT BUS & SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to mutations on a specific entity ID, entity type, or memory topic
 * @param {string} topicOrId - Entity ID (e.g. 'ent_nv_sheet'), type ('sheet'), or event ('memory_rules')
 * @param {Function} callback - Triggered with (data, metadata)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToGraph = (topicOrId, callback) => {
  if (!topicOrId || typeof callback !== 'function') return () => {};
  if (!subscribers.has(topicOrId)) {
    subscribers.set(topicOrId, new Set());
  }
  subscribers.get(topicOrId).add(callback);

  return () => {
    const set = subscribers.get(topicOrId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) subscribers.delete(topicOrId);
    }
  };
};

/**
 * Internal helper to dispatch events to topic subscribers and wildcards
 */
const notifySubscribers = (topic, payload, meta = {}) => {
  const targets = [topic, '*'];
  targets.forEach(t => {
    const cbs = subscribers.get(t);
    if (cbs) {
      cbs.forEach(cb => {
        try { cb(payload, meta); } catch (err) {
          console.warn(`[UniversalContextGraph] Error in listener for topic ${t}:`, err);
        }
      });
    }
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CROSS-WORKSPACE AUTOMATED MUTATION PROPAGATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Perform a semantic mutation on any workspace entity and automatically
 * propagate changes through downstream dependency edges to linked Docs, Sheets, and Tasks.
 * 
 * @param {object} mutation
 * @param {string} mutation.entityId - ID of entity changing (e.g. 'ent_nv_sheet')
 * @param {object} mutation.changes - Delta fields { content, metadata, excerpt, value }
 * @param {string} mutation.reason - Explanation of the change
 * @param {string} mutation.actor - 'human' | 'agent'
 */
export const mutateAndPropagate = ({
  entityId,
  changes = {},
  reason = 'Semantic update',
  actor = 'agent'
}) => {
  initializeContextGraph();
  const entityIndex = graphEntitiesCache.findIndex(e => e.id === entityId);
  if (entityIndex === -1) {
    return { success: false, error: `Entity "${entityId}" not found in Context Graph.` };
  }

  const sourceEntity = graphEntitiesCache[entityIndex];
  const previousState = { ...sourceEntity };

  // 1. Apply changes to Source Entity
  const updatedEntity = {
    ...sourceEntity,
    ...changes,
    metadata: {
      ...(sourceEntity.metadata || {}),
      ...(changes.metadata || {}),
      lastMutationReason: reason,
      lastMutatedBy: actor
    },
    updatedAt: new Date().toISOString()
  };
  graphEntitiesCache[entityIndex] = updatedEntity;

  // 2. Dependency Graph Traversal: Find all impacted linked nodes
  // Check outgoing edges and incoming directional dependencies
  const downstreamEdges = graphEdgesCache.filter(edge => 
    edge.sourceId === entityId || edge.targetId === entityId
  );

  const impactedResults = [];
  const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  downstreamEdges.forEach(edge => {
    const isSource = edge.sourceId === entityId;
    const targetNodeId = isSource ? edge.targetId : edge.sourceId;
    const targetIndex = graphEntitiesCache.findIndex(e => e.id === targetNodeId);
    if (targetIndex === -1) return;

    const targetNode = graphEntitiesCache[targetIndex];
    let propagationDelta = null;

    // Relational Propagation Heuristics
    // Case A: Formula/Calculation dependency (e.g. Sheet -> Doc or Sheet -> Deck)
    if (edge.relationType === ORB_RELATION_TYPES.CALCULATES_FROM || edge.relationType === ORB_RELATION_TYPES.REFERENCES) {
      const newFigure = changes.metadata?.keyMetric || changes.metadata?.financialFigure || changes.value;
      if (newFigure) {
        propagationDelta = {
          propagatedFigure: newFigure,
          note: `Synchronized with ${sourceEntity.title}: ${newFigure}`
        };
        targetNode.metadata = {
          ...(targetNode.metadata || {}),
          keyMetric: newFigure,
          autoReconciledFrom: entityId,
          lastReconciledAt: new Date().toISOString()
        };
        targetNode.excerpt = `Auto-propagated from ${sourceEntity.title}: Updated to ${newFigure} (${reason}).`;
      }
    }

    // Case B: Decision or Policy Causal Impact
    else if (edge.relationType === ORB_RELATION_TYPES.CAUSALLY_IMPACTS || edge.relationType === ORB_RELATION_TYPES.DEPENDS_ON) {
      propagationDelta = {
        causalTrigger: sourceEntity.title,
        statusUpdate: changes.metadata?.status || 'Pending Verification'
      };
      targetNode.metadata = {
        ...(targetNode.metadata || {}),
        upstreamDependencyUpdate: sourceEntity.title,
        lastDependencySync: new Date().toISOString()
      };
    }

    // Record Propagation Record if delta occurred
    if (propagationDelta) {
      targetNode.updatedAt = new Date().toISOString();
      graphEntitiesCache[targetIndex] = { ...targetNode };

      impactedResults.push({
        targetId: targetNode.id,
        targetTitle: targetNode.title,
        workspace: targetNode.workspace,
        relationType: edge.relationType,
        delta: propagationDelta
      });

      // Synchronize into localStorage documents if target is a persisted Document
      if (targetNode.workspace === 'compose') {
        syncTargetDocumentInStorage(targetNode, propagationDelta);
      }

      // Notify direct target listeners
      notifySubscribers(targetNode.id, targetNode, { sourceId: entityId, delta: propagationDelta });
      notifySubscribers(targetNode.type, targetNode);
    }
  });

  // 3. Persist Graph State & Propagation Audit Log
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  const propagationLog = {
    mutationId,
    timestamp: new Date().toISOString(),
    sourceEntityId: entityId,
    sourceTitle: sourceEntity.title,
    actor,
    reason,
    impactedCount: impactedResults.length,
    impactedTargets: impactedResults
  };

  propagationHistoryCache = [propagationLog, ...(propagationHistoryCache || [])].slice(0, 100);
  safeSetItem(PROPAGATION_HISTORY_KEY, propagationHistoryCache);

  // 4. Notify Listeners
  notifySubscribers(entityId, updatedEntity, { previousState });
  notifySubscribers(updatedEntity.type, updatedEntity);
  notifySubscribers('propagation_event', propagationLog);

  return {
    success: true,
    mutationId,
    mutatedEntity: updatedEntity,
    impactedCount: impactedResults.length,
    impactedTargets: impactedResults,
    log: propagationLog
  };
};

/**
 * Synchronizes propagated changes into persisted Compose documents
 */
const syncTargetDocumentInStorage = (targetNode, delta) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const docs = safeGetItem(DOCUMENTS_STORAGE_KEY, []);
    if (!Array.isArray(docs) || docs.length === 0) return;

    let modified = false;
    const updatedDocs = docs.map(doc => {
      // Match by title or docId
      if (doc.title === targetNode.title || (targetNode.metadata?.docId && doc.id === targetNode.metadata.docId)) {
        modified = true;
        const syncBadge = delta.propagatedFigure 
          ? `\n<div data-agent-sync="true" class="my-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-mono">⚡ Auto-Propagated Metric: ${delta.propagatedFigure} (Synced from Sheets)</div>`
          : '';
        return {
          ...doc,
          updatedAt: new Date().toISOString(),
          bodyHtml: (doc.bodyHtml || '') + syncBadge
        };
      }
      return doc;
    });

    if (modified) {
      safeSetItem(DOCUMENTS_STORAGE_KEY, updatedDocs);
    }
  } catch (err) {
    console.warn('[UniversalContextGraph] Failed to sync document in storage:', err);
  }
};

/**
 * Notify the graph that a document has been edited by a human or agent command API
 */
export const notifyDocumentMutated = ({ docId, title, text, characterCount, wordCount }) => {
  initializeContextGraph();
  const existingNode = graphEntitiesCache.find(e => 
    e.id === docId || e.metadata?.docId === docId || e.title === title
  );

  if (existingNode) {
    mutateAndPropagate({
      entityId: existingNode.id,
      changes: {
        excerpt: text.slice(0, 180) + '...',
        content: text.slice(0, 1000),
        metadata: {
          ...(existingNode.metadata || {}),
          characterCount,
          wordCount
        }
      },
      reason: 'Human Document Edit Sync',
      actor: 'human'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TOKEN-DENSE MACHINE EXECUTION CONTEXT EXPORT (JSON-LD & STRIPPED MARKDOWN)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Export high-density, token-optimized context feed specifically tailored for LLMs.
 * Eliminates DOM bloat, CSS, and UI chrome, leaving only semantic entities, rules, and links.
 * Total output is typically 200–500 tokens.
 */
export const getAgentContext = (options = {}) => {
  initializeContextGraph();
  const { project = null, maxEntities = 8, maxRules = 5, maxDecisions = 3 } = options;

  // 1. Extract applicable project rules
  const applicableRules = getProjectRules(project).slice(0, maxRules);

  // 2. Extract recent decisions
  const recentDecisions = (memoryBankCache.decisions || []).slice(0, maxDecisions);

  // 3. Extract core graph nodes
  const filteredNodes = project 
    ? graphEntitiesCache.filter(e => e.project?.toLowerCase().includes(project.toLowerCase())).slice(0, maxEntities)
    : graphEntitiesCache.slice(0, maxEntities);

  // 4. Extract active propagation events
  const recentPropagations = (propagationHistoryCache || []).slice(0, 2);

  // Build Token-Dense Semantic Feed
  let feed = '### WORKSPACE CONTEXT GRAPH & AGENT MEMORY BANK\n\n';

  if (applicableRules.length > 0) {
    feed += '**Active Project Rules & Constraints:**\n';
    applicableRules.forEach(r => {
      feed += `- [${r.enforcement.toUpperCase()}] ${r.rule} (${r.project})\n`;
    });
    feed += '\n';
  }

  if (recentDecisions.length > 0) {
    feed += '**Binding Historical Decisions:**\n';
    recentDecisions.forEach(d => {
      feed += `- ${d.title} [Status: ${d.status} | Impact: ${d.financialImpact}]\n  Rationale: ${d.rationale}\n`;
    });
    feed += '\n';
  }

  if (filteredNodes.length > 0) {
    feed += '**Connected Semantic Entities (State Engine):**\n';
    filteredNodes.forEach(n => {
      const metric = n.metadata?.keyMetric ? ` | Metric: ${n.metadata.keyMetric}` : '';
      feed += `- [${n.type.toUpperCase()}] ${n.title} (${n.workspace}${metric})\n  Summary: ${n.excerpt}\n`;
    });
    feed += '\n';
  }

  if (recentPropagations.length > 0) {
    feed += '**Recent Cross-Workspace Auto-Propagations:**\n';
    recentPropagations.forEach(p => {
      feed += `- ${p.sourceTitle} -> propagated to ${p.impactedCount} linked entities (${p.reason})\n`;
    });
  }

  return feed.trim();
};

/**
 * Export the graph in formal JSON-LD format for external MCP tools or machine reasoning
 */
export const exportGraphAsJsonLd = () => {
  initializeContextGraph();
  return {
    '@context': {
      '@vocab': 'https://schema.regaarder.io/v1/',
      'entities': 'https://schema.regaarder.io/entities',
      'relations': 'https://schema.regaarder.io/relations',
      'memory': 'https://schema.regaarder.io/memory'
    },
    '@type': 'UniversalContextGraph',
    'timestamp': new Date().toISOString(),
    'memoryBank': {
      'rules': memoryBankCache.rules,
      'instructions': memoryBankCache.instructions,
      'decisions': memoryBankCache.decisions
    },
    'entities': graphEntitiesCache.map(e => ({
      '@id': e.id,
      '@type': e.type,
      'name': e.title,
      'workspace': e.workspace,
      'project': e.project,
      'metadata': e.metadata
    })),
    'relations': graphEdgesCache.map(edge => ({
      'source': edge.sourceId,
      'target': edge.targetId,
      'type': edge.relationType,
      'label': edge.label,
      'confidence': edge.confidenceScore
    }))
  };
};

/**
 * Get propagation audit trail history
 */
export const getPropagationHistory = () => {
  initializeContextGraph();
  return [...(propagationHistoryCache || [])];
};

/**
 * Record a scheduled event into the Universal Context Graph
 */
export const recordScheduledEventGraphNode = (event) => {
  if (!event || !event.title) return null;
  initializeContextGraph();

  const eventNodeId = `ent_sched_${event.id || Date.now()}`;
  const existingIdx = graphEntitiesCache.findIndex(e => e.id === eventNodeId || (e.metadata && e.metadata.scheduleEventId === event.id));

  const node = {
    id: eventNodeId,
    type: 'EVENT',
    workspace: 'schedule',
    title: event.title,
    author: (event.participants && event.participants[0]) || 'Joshua David',
    authorRole: 'Meeting Host',
    updatedAt: new Date().toISOString(),
    project: event.intentCategory || 'Executive Schedule',
    tags: ['Calendar', 'IntentScheduler', event.priority || 'medium'],
    excerpt: `${event.title} (${event.startTime} - ${event.endTime})`,
    content: `Meeting: ${event.title}\nIntent Category: ${event.intentCategory || 'general'}\nPriority: ${event.priority || 'medium'}\nParticipants: ${(event.participants || []).join(', ')}`,
    metadata: {
      scheduleEventId: event.id,
      startTime: event.startTime,
      endTime: event.endTime,
      participants: event.participants || [],
      priority: event.priority || 'medium',
      status: event.status || 'scheduled'
    }
  };

  if (existingIdx !== -1) {
    graphEntitiesCache[existingIdx] = { ...graphEntitiesCache[existingIdx], ...node };
  } else {
    graphEntitiesCache = [node, ...graphEntitiesCache];
  }
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  (event.participants || []).forEach(pId => {
    const targetEntity = graphEntitiesCache.find(e => e.id === `ent_${pId}` || e.id === pId);
    if (targetEntity) {
      const edgeId = `edge_${node.id}_to_${targetEntity.id}`;
      if (!graphEdgesCache.some(ed => ed.id === edgeId)) {
        graphEdgesCache.push({
          id: edgeId,
          sourceId: node.id,
          targetId: targetEntity.id,
          relationType: 'PARTICIPATES_IN',
          label: `Participant: ${targetEntity.title || pId}`,
          epistemicStatus: 'VERIFIED',
          isAiInferred: false,
          confidenceScore: 1.0,
          lenses: ['timeline', 'people']
        });
      }
    }
  });
  safeSetItem(GRAPH_EDGES_STORAGE_KEY, graphEdgesCache);

  notifySubscribers('schedule_events', event);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record a multi-agent negotiation record into Context Graph
 */
export const recordNegotiationGraphNode = (negotiation) => {
  if (!negotiation || !negotiation.id) return null;
  initializeContextGraph();

  const node = {
    id: `ent_neg_${negotiation.id}`,
    type: 'DECISION',
    workspace: 'schedule',
    title: `Negotiation: ${negotiation.title || 'Schedule Protocol'}`,
    author: 'Agent Swarm',
    authorRole: 'Multi-Agent Negotiator',
    updatedAt: new Date().toISOString(),
    project: 'Multi-Agent Scheduling',
    tags: ['Negotiation', 'IntentScheduler', negotiation.status || 'AGREED'],
    excerpt: `Status: ${negotiation.status} | Rounds: ${negotiation.roundsCount} | Agreed: ${negotiation.agreedSlot?.formattedTime || 'N/A'}`,
    content: JSON.stringify(negotiation, null, 2),
    metadata: {
      negotiationId: negotiation.id,
      status: negotiation.status,
      roundsCount: negotiation.roundsCount,
      agreedSlot: negotiation.agreedSlot
    }
  };

  graphEntitiesCache = [node, ...graphEntitiesCache];
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);
  notifySubscribers('schedule_negotiations', negotiation);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record an Omni-Portal Ingestion Package into Context Graph
 */
export const recordIngestionGraphNode = (ingestPackage) => {
  if (!ingestPackage || !ingestPackage.id) return null;
  initializeContextGraph();

  const node = {
    id: `ent_portal_${ingestPackage.id}`,
    type: 'DOCUMENT',
    workspace: 'portal',
    title: `Ingestion: ${ingestPackage.title}`,
    author: 'Omni-Portal',
    authorRole: 'Universal Schema Translator',
    updatedAt: new Date().toISOString(),
    project: 'Enterprise Ingestion',
    tags: ['OmniPortal', ingestPackage.format?.toUpperCase() || 'DOCUMENT', ingestPackage.status || 'DECOMPOSED'],
    excerpt: `${ingestPackage.fileName} | Blocks: ${ingestPackage.workspaceState?.canvas?.blockCount || 0} | Sheets: ${ingestPackage.workspaceState?.matrix?.totalTables || 0} | Tasks: ${ingestPackage.workspaceState?.directives?.totalTasks || 0} | Context Savings: ${ingestPackage.workspaceState?.tokenStats?.savingsPercent || 0}%`,
    content: JSON.stringify(ingestPackage.workspaceState?.tokenStats || {}, null, 2),
    metadata: {
      packageId: ingestPackage.id,
      fileName: ingestPackage.fileName,
      format: ingestPackage.format,
      status: ingestPackage.status,
      blockCount: ingestPackage.workspaceState?.canvas?.blockCount,
      sheetCount: ingestPackage.workspaceState?.matrix?.totalTables,
      taskCount: ingestPackage.workspaceState?.directives?.totalTasks,
      tokenStats: ingestPackage.workspaceState?.tokenStats
    }
  };

  const existingIdx = graphEntitiesCache.findIndex(e => e.id === node.id);
  if (existingIdx !== -1) {
    graphEntitiesCache[existingIdx] = { ...graphEntitiesCache[existingIdx], ...node };
  } else {
    graphEntitiesCache = [node, ...graphEntitiesCache];
  }
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  notifySubscribers('portal_ingestions', ingestPackage);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record a Directive Queue Item into Context Graph
 */
export const recordDirectiveGraphNode = (directive) => {
  if (!directive || !directive.id) return null;
  initializeContextGraph();

  const node = {
    id: `ent_directive_${directive.id}`,
    type: 'TASK',
    workspace: 'tasks',
    title: `Directive: ${directive.title}`,
    author: directive.tier === 'agent' ? 'Autonomous Agent' : (directive.tier === 'team' ? 'Cross-Functional Team' : 'Executive User'),
    authorRole: `${(directive.tier || 'agent').toUpperCase()} Directive`,
    updatedAt: new Date().toISOString(),
    project: 'Autonomous Task Substrate',
    tags: ['DirectiveQueue', (directive.tier || 'agent').toUpperCase(), directive.priority || 'P1', directive.status || 'PENDING'],
    excerpt: `Status: ${directive.status} | Tier: ${directive.tier} | Priority: ${directive.priority}${directive.blockPointer ? ` | Block: ${directive.blockPointer.blockId}` : ''}`,
    content: JSON.stringify(directive, null, 2),
    metadata: {
      directiveId: directive.id,
      tier: directive.tier,
      priority: directive.priority,
      status: directive.status,
      blockPointer: directive.blockPointer,
      stagingPrId: directive.stagingPrId
    }
  };

  const existingIdx = graphEntitiesCache.findIndex(e => e.id === node.id);
  if (existingIdx !== -1) {
    graphEntitiesCache[existingIdx] = { ...graphEntitiesCache[existingIdx], ...node };
  } else {
    graphEntitiesCache = [node, ...graphEntitiesCache];
  }
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  notifySubscribers('directive_queue', directive);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record a Whiteboard Spatial Topology Graph into Context Graph
 */
export const recordTopologyGraphNode = (topology) => {
  if (!topology || !topology.id) return null;
  initializeContextGraph();

  const nodeCount = topology.nodes ? topology.nodes.length : 0;
  const edgeCount = topology.edges ? topology.edges.length : 0;

  const node = {
    id: `ent_topology_${topology.id}`,
    type: 'DOCUMENT',
    workspace: 'whiteboard',
    title: `Topology: ${topology.title || 'System Diagram'}`,
    author: 'Spatial Topology Engine',
    authorRole: 'Visual Graph Compiler',
    updatedAt: new Date().toISOString(),
    project: 'Architecture & System Topology',
    tags: ['SpatialTopology', 'Whiteboard', `${nodeCount}_NODES`, `${edgeCount}_EDGES`],
    excerpt: `${topology.title || 'System Diagram'} | Nodes: ${nodeCount} | Edges: ${edgeCount} | Compiled Schemas: SQL DDL, OpenAPI, State Machine`,
    content: JSON.stringify({
      id: topology.id,
      title: topology.title,
      nodeCount,
      edgeCount,
      nodes: (topology.nodes || []).map(n => ({ id: n.id, type: n.type, label: n.label })),
      edges: (topology.edges || []).map(e => ({ source: e.source, target: e.target, relation: e.relation }))
    }, null, 2),
    metadata: {
      topologyId: topology.id,
      nodeCount,
      edgeCount,
      version: topology.version || 1
    }
  };

  const existingIdx = graphEntitiesCache.findIndex(e => e.id === node.id);
  if (existingIdx !== -1) {
    graphEntitiesCache[existingIdx] = { ...graphEntitiesCache[existingIdx], ...node };
  } else {
    graphEntitiesCache = [node, ...graphEntitiesCache];
  }
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  notifySubscribers('whiteboard_topology', topology);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record a Room Observer & In-Meeting Session into Universal Context Graph
 */
export const recordRoomObserverGraphNode = (session) => {
  if (!session || !session.meetingId) return null;
  initializeContextGraph();

  const participantCount = session.participants ? session.participants.length : 0;
  const intentCount = session.harvestedIntents ? session.harvestedIntents.length : 0;
  const decisionsCount = session.summary?.decisionsCount || 0;
  const directivesCount = session.summary?.directivesCount || 0;

  const node = {
    id: `ent_room_${session.meetingId}`,
    type: 'DOCUMENT',
    workspace: 'room',
    title: `In-Room Observer: ${session.title || 'Live Meeting'}`,
    author: 'Room Context Harvester',
    authorRole: 'In-Meeting Multi-Agent Observer',
    updatedAt: new Date().toISOString(),
    project: 'Organizational Intent & Meeting Harvesting',
    tags: ['Room', 'MeetingObserver', `${participantCount}_PARTICIPANTS`, `${decisionsCount}_DECISIONS`, `${directivesCount}_DIRECTIVES`],
    excerpt: `${session.title || 'Meeting'} | Status: ${session.status} | Decisions: ${decisionsCount} | Directives: ${directivesCount} | Total Turns: ${session.summary?.totalTurns || 0}`,
    content: JSON.stringify({
      meetingId: session.meetingId,
      title: session.title,
      status: session.status,
      participants: session.participants,
      observers: (session.activeObservers || []).map(o => o.name),
      summary: session.summary,
      activePrBranchId: session.activePrBranchId
    }, null, 2),
    metadata: {
      meetingId: session.meetingId,
      status: session.status,
      activePrBranchId: session.activePrBranchId,
      summary: session.summary,
      version: 1
    }
  };

  const existingIdx = graphEntitiesCache.findIndex(e => e.id === node.id);
  if (existingIdx !== -1) {
    graphEntitiesCache[existingIdx] = { ...graphEntitiesCache[existingIdx], ...node };
  } else {
    graphEntitiesCache = [node, ...graphEntitiesCache];
  }
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);

  notifySubscribers('room_observer', session);
  notifySubscribers('graph_entities', graphEntitiesCache);
  return node;
};

/**
 * Record a cross-app workspace state mutation into the Universal Context Graph.
 */
export const recordWorkspaceMutationNode = (mutationEvent) => {
  if (!mutationEvent || !mutationEvent.id) return null;
  initializeContextGraph();

  const node = {
    id: `ent_mut_${mutationEvent.id}`,
    type: 'TASK',
    workspace: mutationEvent.targetApp || 'workspace',
    title: `Workspace Mutation: ${mutationEvent.description || mutationEvent.action}`,
    author: mutationEvent.origin || 'State Bus',
    authorRole: 'Cross-App Mutator',
    updatedAt: mutationEvent.timestamp || new Date().toISOString(),
    project: 'Cross-App Workspace Synchronization',
    tags: ['Mutation', mutationEvent.targetApp || 'workspace', mutationEvent.status || 'committed'],
    excerpt: mutationEvent.description || 'Reactive cross-app mutation',
    content: JSON.stringify(mutationEvent, null, 2),
    metadata: {
      action: mutationEvent.action,
      targetApp: mutationEvent.targetApp,
      status: mutationEvent.status,
      branchId: mutationEvent.branchId
    }
  };

  graphEntitiesCache = [node, ...graphEntitiesCache];
  safeSetItem(GRAPH_ENTITIES_STORAGE_KEY, graphEntitiesCache);
  notifySubscribers('workspace_mutation', mutationEvent);
  return node;
};

