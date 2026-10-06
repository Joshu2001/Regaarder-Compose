/**
 * spatialTopologyEngine.js
 *
 * Pillar 9: Spatial Topology & Visual Context Graph (Whiteboard)
 *
 * Transforms 2D canvas pixel coordinates into a discrete relational graph AST
 * (Node A) --[RELATION]--> (Node B).
 *
 * Provides:
 * 1. Visual Graph Protocol Substrate (relational node and edge semantics).
 * 2. Topological Analysis (degrees, roots, sinks, cycle detection).
 * 3. Bi-Directional Compilation (Whiteboard Diagram <-> SQL Schema, OpenAPI 3.0, State Machine).
 * 4. Machine -> Human Agent Plan Visual Synthesizer (auto-layout coordinates and connectors).
 * 5. Universal Context Graph Synchronization (semantic entity and edge propagation).
 * 6. Native Token-Dense Isomorphic Serializers for MCP feeds.
 */

import { recordTopologyGraphNode } from './universalContextGraph.js';
import { createStagingBranch, stageMutation } from './workspaceStagingEngine.js';

export const TOPOLOGY_NODE_TYPES = {
  SERVICE: 'service',
  DATABASE: 'database',
  DECISION: 'decision',
  FLOW_STEP: 'flow_step',
  ARCHITECTURE_COMPONENT: 'architecture_component',
  NOTE: 'note'
};

export const TOPOLOGY_RELATION_TYPES = {
  DEPENDS_ON: 'DEPENDS_ON',
  READS_WRITES_TO: 'READS_WRITES_TO',
  WRITES_TO: 'WRITES_TO',
  READS_FROM: 'READS_FROM',
  FLOWS_TO: 'FLOWS_TO',
  CALLS: 'CALLS',
  SUPPORTS: 'SUPPORTS',
  CONTAINS: 'CONTAINS',
  EMITS_EVENT: 'EMITS_EVENT',
  TRANSITIONS_TO: 'TRANSITIONS_TO'
};

const STORAGE_KEY_TOPOLOGY = 'regaarder_whiteboard_topology_v1';

let activeTopology = null;
const subscribers = new Set();
let isStorageInitialized = false;

function generateId(prefix = 'node') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Default architectural seed topology representing an enterprise
 * high-performance AI inference and telemetry infrastructure.
 */
function createDefaultSeedTopology() {
  const now = new Date().toISOString();
  return {
    id: 'top_seed_enterprise_platform',
    title: 'Enterprise AI Inference & Telemetry Architecture',
    version: 1,
    metadata: {
      createdAt: now,
      updatedAt: now,
      author: 'Principal Systems Architect',
      description: 'Zero-drift spatial topology graph with bi-directional schema compilation.'
    },
    nodes: [
      {
        id: 'node_api_gateway',
        type: TOPOLOGY_NODE_TYPES.SERVICE,
        label: 'API Gateway & Ingress Proxy',
        description: 'Edge reverse proxy handling rate-limiting and TLS termination.',
        bounds: { x: 80, y: 160, width: 200, height: 90 },
        properties: {
          technology: 'Envoy / NGINX',
          color: '#38bdf8',
          endpoints: [
            { method: 'POST', path: '/v1/inference', summary: 'Submit real-time inference request' },
            { method: 'GET', path: '/v1/health', summary: 'Edge health probe' }
          ]
        },
        edges: [
          { target: 'node_auth_service', relation: TOPOLOGY_RELATION_TYPES.CALLS, label: 'Verify Bearer Token' },
          { target: 'node_inference_orchestrator', relation: TOPOLOGY_RELATION_TYPES.FLOWS_TO, label: 'Forward Validated Request' }
        ]
      },
      {
        id: 'node_auth_service',
        type: TOPOLOGY_NODE_TYPES.SERVICE,
        label: 'Auth & KMS Service',
        description: 'Decentralized JWT validation and hardware security module integration.',
        bounds: { x: 360, y: 60, width: 190, height: 80 },
        properties: {
          technology: 'Go / Vault',
          color: '#818cf8',
          endpoints: [
            { method: 'POST', path: '/auth/verify', summary: 'Verify cryptographic signature' }
          ]
        },
        edges: [
          { target: 'node_redis_cache', relation: TOPOLOGY_RELATION_TYPES.READS_WRITES_TO, label: 'Session Token Cache' }
        ]
      },
      {
        id: 'node_inference_orchestrator',
        type: TOPOLOGY_NODE_TYPES.SERVICE,
        label: 'Inference Orchestrator',
        description: 'GPU cluster load balancer and dynamic context builder.',
        bounds: { x: 360, y: 260, width: 220, height: 100 },
        properties: {
          technology: 'Rust / gRPC',
          color: '#f59e0b',
          endpoints: [
            { method: 'POST', path: '/orchestrate/run', summary: 'Execute multi-agent inference step' }
          ]
        },
        edges: [
          { target: 'node_redis_cache', relation: TOPOLOGY_RELATION_TYPES.DEPENDS_ON, label: 'KV Cache Lookup' },
          { target: 'node_postgres_db', relation: TOPOLOGY_RELATION_TYPES.READS_WRITES_TO, label: 'Persist Audit Log' },
          { target: 'node_compliance_auditor', relation: TOPOLOGY_RELATION_TYPES.CALLS, label: 'Trigger Guardrail Policy' }
        ]
      },
      {
        id: 'node_redis_cache',
        type: TOPOLOGY_NODE_TYPES.DATABASE,
        label: 'Redis Context Store',
        description: 'In-memory low-latency semantic cache and rate limiter.',
        bounds: { x: 680, y: 80, width: 200, height: 100 },
        properties: {
          technology: 'Redis 7.2 Cluster',
          color: '#ef4444',
          columns: [
            { name: 'cache_key', type: 'VARCHAR(255)', isPrimaryKey: true },
            { name: 'context_payload', type: 'JSONB' },
            { name: 'ttl_seconds', type: 'INTEGER' },
            { name: 'created_at', type: 'TIMESTAMPTZ' }
          ]
        },
        edges: []
      },
      {
        id: 'node_postgres_db',
        type: TOPOLOGY_NODE_TYPES.DATABASE,
        label: 'PostgreSQL Ledger',
        description: 'ACID-compliant relational database for telemetry, audits, and billing records.',
        bounds: { x: 680, y: 260, width: 210, height: 120 },
        properties: {
          technology: 'PostgreSQL 16',
          color: '#10b981',
          columns: [
            { name: 'id', type: 'BIGSERIAL', isPrimaryKey: true },
            { name: 'request_id', type: 'UUID' },
            { name: 'user_id', type: 'VARCHAR(64)' },
            { name: 'model_id', type: 'VARCHAR(64)' },
            { name: 'prompt_tokens', type: 'INTEGER' },
            { name: 'completion_tokens', type: 'INTEGER' },
            { name: 'cost_usd', type: 'DECIMAL(10,6)' },
            { name: 'created_at', type: 'TIMESTAMPTZ' }
          ]
        },
        edges: []
      },
      {
        id: 'node_compliance_auditor',
        type: TOPOLOGY_NODE_TYPES.ARCHITECTURE_COMPONENT,
        label: 'SOC2 Compliance Guardrail',
        description: 'Audits data residency boundaries and PII masking.',
        bounds: { x: 680, y: 440, width: 210, height: 80 },
        properties: {
          technology: 'Open Policy Agent (OPA)',
          color: '#a855f7'
        },
        edges: [
          { target: 'node_postgres_db', relation: TOPOLOGY_RELATION_TYPES.READS_WRITES_TO, label: 'Log Non-Compliance Findings' }
        ]
      }
    ]
  };
}

/**
 * Synchronize edges array from individual node edge definitions.
 */
function reconcileGraphEdges(topology) {
  if (!topology || !topology.nodes) return topology;
  const flatEdges = [];
  topology.nodes.forEach(node => {
    if (Array.isArray(node.edges)) {
      node.edges.forEach((edge, idx) => {
        if (!edge.id) {
          edge.id = `edge_${node.id}_${edge.target}_${idx}`;
        }
        flatEdges.push({
          id: edge.id,
          source: node.id,
          target: edge.target,
          relation: edge.relation || TOPOLOGY_RELATION_TYPES.DEPENDS_ON,
          label: edge.label || '',
          condition: edge.condition || null
        });
      });
    }
  });
  topology.edges = flatEdges;
  return topology;
}

export function initializeTopology() {
  if (isStorageInitialized) return;
  isStorageInitialized = true;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_TOPOLOGY);
      if (raw) {
        activeTopology = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[SpatialTopologyEngine] Failed to read localStorage:', e);
    }
  }

  if (!activeTopology) {
    activeTopology = reconcileGraphEdges(createDefaultSeedTopology());
  } else {
    reconcileGraphEdges(activeTopology);
  }
}

function persistTopologyState() {
  if (typeof window !== 'undefined' && window.localStorage && activeTopology) {
    try {
      window.localStorage.setItem(STORAGE_KEY_TOPOLOGY, JSON.stringify(activeTopology));
    } catch (e) {
      console.warn('[SpatialTopologyEngine] Failed to persist state:', e);
    }
  }
  notifySubscribers();
}

function notifySubscribers() {
  if (!activeTopology) return;
  const snapshot = {
    topology: JSON.parse(JSON.stringify(activeTopology)),
    analysis: analyzeTopology(activeTopology)
  };
  subscribers.forEach(listener => {
    try {
      listener(snapshot);
    } catch (err) {
      console.error('[SpatialTopologyEngine] Subscriber error:', err);
    }
  });
}

export function subscribeToTopology(listener) {
  initializeTopology();
  subscribers.add(listener);
  listener({
    topology: JSON.parse(JSON.stringify(activeTopology)),
    analysis: analyzeTopology(activeTopology)
  });
  return () => subscribers.delete(listener);
}

export function getTopologyGraph() {
  initializeTopology();
  return JSON.parse(JSON.stringify(activeTopology));
}

export function clearTopologyGraph() {
  initializeTopology();
  activeTopology = {
    id: generateId('top'),
    title: 'Blank Architecture Canvas',
    version: 1,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'User'
    },
    nodes: [],
    edges: []
  };
  persistTopologyState();
  return activeTopology;
}

export function resetToSeedTopology() {
  isStorageInitialized = true;
  activeTopology = reconcileGraphEdges(createDefaultSeedTopology());
  persistTopologyState();
  return activeTopology;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOPOLOGICAL GRAPH MUTATIONS (CRUD & CONNECTIONS)
// ─────────────────────────────────────────────────────────────────────────────

export function addTopologyNode(nodeInput = {}) {
  initializeTopology();
  const id = nodeInput.id || generateId('node');
  const x = nodeInput.x ?? nodeInput.bounds?.x ?? 120;
  const y = nodeInput.y ?? nodeInput.bounds?.y ?? 120;
  const width = nodeInput.width ?? nodeInput.bounds?.width ?? 180;
  const height = nodeInput.height ?? nodeInput.bounds?.height ?? 80;
  const status = nodeInput.status || nodeInput.metadata?.status || 'live';

  const newNode = {
    id,
    type: nodeInput.type || TOPOLOGY_NODE_TYPES.SERVICE,
    label: nodeInput.label || 'New Component',
    description: nodeInput.description || '',
    bounds: { x, y, width, height },
    x,
    y,
    width,
    height,
    status,
    metadata: nodeInput.metadata || {},
    properties: nodeInput.properties || nodeInput.metadata || {},
    edges: Array.isArray(nodeInput.edges) ? [...nodeInput.edges] : []
  };

  activeTopology.nodes.push(newNode);
  activeTopology.version = (activeTopology.version || 1) + 1;
  activeTopology.metadata.updatedAt = new Date().toISOString();
  reconcileGraphEdges(activeTopology);
  persistTopologyState();

  try {
    syncTopologyToContextGraph(activeTopology);
  } catch (_e) {}

  return newNode;
}

export function updateTopologyNode(nodeId, updates = {}) {
  initializeTopology();
  const index = activeTopology.nodes.findIndex(n => n.id === nodeId);
  if (index === -1) return null;

  const current = activeTopology.nodes[index];
  const newStatus = updates.status || updates.metadata?.status || current.status || 'live';
  const updated = {
    ...current,
    ...updates,
    status: newStatus,
    metadata: updates.metadata ? { ...current.metadata, ...updates.metadata, status: newStatus } : current.metadata,
    bounds: updates.bounds ? { ...current.bounds, ...updates.bounds } : current.bounds,
    properties: updates.properties ? { ...current.properties, ...updates.properties } : current.properties
  };

  if (updates.x !== undefined) { updated.x = updates.x; if (updated.bounds) updated.bounds.x = updates.x; }
  if (updates.y !== undefined) { updated.y = updates.y; if (updated.bounds) updated.bounds.y = updates.y; }
  if (updates.width !== undefined) { updated.width = updates.width; if (updated.bounds) updated.bounds.width = updates.width; }
  if (updates.height !== undefined) { updated.height = updates.height; if (updated.bounds) updated.bounds.height = updates.height; }

  activeTopology.nodes[index] = updated;
  activeTopology.version = (activeTopology.version || 1) + 1;
  activeTopology.metadata.updatedAt = new Date().toISOString();
  reconcileGraphEdges(activeTopology);
  persistTopologyState();

  try {
    syncTopologyToContextGraph(activeTopology);
  } catch (_e) {}

  return updated;
}

export function deleteTopologyNode(nodeId) {
  initializeTopology();
  const initialLen = activeTopology.nodes.length;
  activeTopology.nodes = activeTopology.nodes.filter(n => n.id !== nodeId);

  // Clean up references to this node across other nodes' edges
  activeTopology.nodes.forEach(node => {
    if (Array.isArray(node.edges)) {
      node.edges = node.edges.filter(e => e.target !== nodeId);
    }
  });

  if (activeTopology.nodes.length !== initialLen) {
    activeTopology.version = (activeTopology.version || 1) + 1;
    activeTopology.metadata.updatedAt = new Date().toISOString();
    reconcileGraphEdges(activeTopology);
    persistTopologyState();
    return true;
  }
  return false;
}

export function connectTopologyNodes(sourceOrEdgeInput, targetId, relation = TOPOLOGY_RELATION_TYPES.DEPENDS_ON, label = '') {
  initializeTopology();
  let src, tgt, rel, lbl;
  if (typeof sourceOrEdgeInput === 'object' && sourceOrEdgeInput !== null) {
    src = sourceOrEdgeInput.source || sourceOrEdgeInput.sourceId;
    tgt = sourceOrEdgeInput.target || sourceOrEdgeInput.targetId;
    rel = sourceOrEdgeInput.relation || TOPOLOGY_RELATION_TYPES.DEPENDS_ON;
    lbl = sourceOrEdgeInput.label || sourceOrEdgeInput.description || '';
  } else {
    src = sourceOrEdgeInput;
    tgt = targetId;
    rel = relation;
    lbl = label;
  }

  const sourceNode = activeTopology.nodes.find(n => n.id === src);
  const targetNode = activeTopology.nodes.find(n => n.id === tgt);

  if (!sourceNode || !targetNode) return null;

  if (!Array.isArray(sourceNode.edges)) sourceNode.edges = [];
  
  // Prevent duplicate edge
  let existing = sourceNode.edges.find(e => e.target === tgt && e.relation === rel);
  if (!existing) {
    sourceNode.edges.push({ target: tgt, relation: rel, label: lbl });
  } else {
    existing.label = lbl || existing.label;
  }

  activeTopology.version = (activeTopology.version || 1) + 1;
  activeTopology.metadata.updatedAt = new Date().toISOString();
  reconcileGraphEdges(activeTopology);
  persistTopologyState();

  try {
    syncTopologyToContextGraph(activeTopology);
  } catch (_e) {}

  const created = activeTopology.edges?.find(e => e.source === src && e.target === tgt && e.relation === rel) || {
    id: `edge_${src}_${tgt}_${Date.now()}`,
    source: src,
    target: tgt,
    relation: rel,
    label: lbl
  };

  return created;
}

export function disconnectTopologyNodes(sourceOrEdgeId, targetId, relation = null) {
  initializeTopology();
  
  if (arguments.length === 1 && typeof sourceOrEdgeId === 'string' && (!targetId || targetId === undefined)) {
    const edgeId = sourceOrEdgeId;
    let found = false;
    activeTopology.nodes.forEach(node => {
      if (Array.isArray(node.edges)) {
        const initialLen = node.edges.length;
        node.edges = node.edges.filter(e => {
          const derivedId = e.id || `edge_${node.id}_${e.target}_${e.relation}`;
          return derivedId !== edgeId && e.id !== edgeId;
        });
        if (node.edges.length !== initialLen) found = true;
      }
    });
    if (Array.isArray(activeTopology.edges)) {
      activeTopology.edges = activeTopology.edges.filter(e => e.id !== edgeId);
    }
    if (found) {
      activeTopology.version = (activeTopology.version || 1) + 1;
      activeTopology.metadata.updatedAt = new Date().toISOString();
      reconcileGraphEdges(activeTopology);
      persistTopologyState();
      return true;
    }
  }

  const sourceNode = activeTopology.nodes.find(n => n.id === sourceOrEdgeId);
  if (!sourceNode || !Array.isArray(sourceNode.edges)) return false;

  const initialLen = sourceNode.edges.length;
  sourceNode.edges = sourceNode.edges.filter(e => {
    if (e.target !== targetId) return true;
    if (relation && e.relation !== relation) return true;
    return false;
  });

  if (sourceNode.edges.length !== initialLen) {
    activeTopology.version = (activeTopology.version || 1) + 1;
    activeTopology.metadata.updatedAt = new Date().toISOString();
    reconcileGraphEdges(activeTopology);
    persistTopologyState();
    return true;
  }
  return false;
}

export function getTopologyNodeById(nodeId) {
  initializeTopology();
  return activeTopology.nodes.find(n => n.id === nodeId) || null;
}

export const getTopologyNode = getTopologyNodeById;

// ─────────────────────────────────────────────────────────────────────────────
// 2. GRAPH TOPOLOGICAL ANALYSIS (DEGREES, SINK, CYCLES)
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeTopology(topology = null) {
  const g = topology || getTopologyGraph();
  const nodes = g?.nodes || [];
  const inDegree = {};
  const outDegree = {};

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    outDegree[n.id] = (n.edges || []).length;
  });

  nodes.forEach(n => {
    (n.edges || []).forEach(e => {
      if (inDegree[e.target] !== undefined) {
        inDegree[e.target]++;
      }
    });
  });

  const rootNodes = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const sinkNodes = nodes.filter(n => outDegree[n.id] === 0).map(n => n.id);

  // Cycle detection via DFS
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];

  function dfs(nodeId, path) {
    visited.add(nodeId);
    recStack.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node && Array.isArray(node.edges)) {
      for (const edge of node.edges) {
        if (!visited.has(edge.target)) {
          dfs(edge.target, [...path, edge.target]);
        } else if (recStack.has(edge.target)) {
          cycles.push([...path, edge.target]);
        }
      }
    }

    recStack.delete(nodeId);
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfs(n.id, [n.id]);
    }
  });

  return {
    nodeCount: nodes.length,
    edgeCount: (g.edges || []).length,
    inDegree,
    outDegree,
    inDegrees: inDegree,
    outDegrees: outDegree,
    rootNodes,
    sinkNodes,
    hasCycles: cycles.length > 0,
    cycles,
    density: nodes.length > 1 ? Number(((g.edges || []).length / (nodes.length * (nodes.length - 1))).toFixed(3)) : 0
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BI-DIRECTIONAL COMPILERS (HUMAN DIAGRAM -> MACHINE SCHEMAS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compiles topological nodes and relational edges into valid ANSI SQL DDL.
 */
export function compileTopologyToSqlSchema(topology = null) {
  const g = topology || getTopologyGraph();
  const nodes = g?.nodes || [];
  const lines = [
    `-- =========================================================================`,
    `-- ANSI SQL DDL SCHEMA GENERATION FROM SPATIAL TOPOLOGY GRAPH`,
    `-- Topology ID: ${g.id || 'top_active'}`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- =========================================================================\n`
  ];

  const dbNodes = nodes.filter(n => n.type === TOPOLOGY_NODE_TYPES.DATABASE || (n.properties && n.properties.columns) || (n.metadata && n.metadata.columns));

  if (dbNodes.length === 0) {
    // Generate derived tables for service components if no explicit database node
    nodes.forEach(n => {
      const tableName = n.label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      lines.push(`CREATE TABLE ${tableName} (`);
      lines.push(`  id BIGSERIAL PRIMARY KEY,`);
      lines.push(`  name VARCHAR(255) NOT NULL,`);
      lines.push(`  status VARCHAR(64) DEFAULT 'ACTIVE',`);
      lines.push(`  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`);
      lines.push(`);\n`);
    });
    return lines.join('\n');
  }

  dbNodes.forEach(node => {
    const tableName = node.label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    lines.push(`CREATE TABLE IF NOT EXISTS ${tableName} (`);
    
    const rawCols = node.properties?.columns || node.metadata?.columns || [
      { name: 'id', type: 'BIGSERIAL', isPrimaryKey: true },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ];

    const colDefs = rawCols.map(c => {
      if (typeof c === 'string') return `  ${c}`;
      let def = `  ${c.name} ${c.type}`;
      if (c.isPrimaryKey) def += ' PRIMARY KEY';
      if (c.isForeignKey && c.references) def += ` REFERENCES ${c.references}`;
      return def;
    });

    lines.push(colDefs.join(',\n'));
    lines.push(`);\n`);
  });

  // Generate relational foreign keys from outbound edges
  nodes.forEach(source => {
    (source.edges || []).forEach(edge => {
      if (edge.relation === TOPOLOGY_RELATION_TYPES.READS_WRITES_TO || edge.relation === TOPOLOGY_RELATION_TYPES.DEPENDS_ON || edge.relation === TOPOLOGY_RELATION_TYPES.WRITES_TO) {
        const target = nodes.find(n => n.id === edge.target);
        if (target && target.type === TOPOLOGY_NODE_TYPES.DATABASE) {
          const srcTable = source.label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const tgtTable = target.label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          lines.push(`-- Edge relation: [${source.label}] --(${edge.relation})--> [${target.label}]`);
          lines.push(`-- ALTER TABLE ${srcTable} ADD CONSTRAINT fk_${srcTable}_${tgtTable} FOREIGN KEY (target_id) REFERENCES ${tgtTable}(id);\n`);
        }
      }
    });
  });

  return lines.join('\n');
}

/**
 * Compiles topological services and dependencies into OpenAPI 3.0 specification.
 */
export function compileTopologyToOpenApi(topology = null) {
  const g = topology || getTopologyGraph();
  const nodes = g?.nodes || [];

  const lines = [
    `openapi: 3.0.3`,
    `info:`,
    `  title: ${g.title || 'Microservice Architecture Specification'}`,
    `  version: 1.0.0`,
    `  description: Compiled directly from Regaarder Spatial Topology Graph.`,
    `paths:`
  ];

  nodes.forEach(node => {
    const endpoints = node.properties?.endpoints || node.metadata?.endpoints || 
      (node.metadata?.endpoint ? [{ path: node.metadata.endpoint, method: node.metadata.method || 'POST', summary: node.label }] : []);

    if (endpoints.length > 0) {
      endpoints.forEach(ep => {
        const epPath = ep.path || `/${node.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const epMethod = (ep.method || 'GET').toLowerCase();
        lines.push(`  ${epPath}:`);
        lines.push(`    ${epMethod}:`);
        lines.push(`      tags: [${node.label}]`);
        lines.push(`      summary: ${ep.summary || node.label}`);
        lines.push(`      responses:`);
        lines.push(`        '200':`);
        lines.push(`          description: Successful response`);
      });
    } else {
      const resourcePath = `/${node.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      lines.push(`  ${resourcePath}:`);
      lines.push(`    get:`);
      lines.push(`      tags: [${node.label}]`);
      lines.push(`      summary: List ${node.label}`);
      lines.push(`      responses:`);
      lines.push(`        '200':`);
      lines.push(`          description: OK`);
    }
  });

  return lines.join('\n');
}

/**
 * Compiles flow steps and decisions into an executable State Machine (XState format).
 */
export function compileTopologyToStateMachine(topology = null) {
  const g = topology || getTopologyGraph();
  const nodes = g?.nodes || [];
  const analysis = analyzeTopology(g);

  const initialNodeId = analysis.rootNodes[0] || nodes[0]?.id || 'idle';
  const states = {};

  nodes.forEach(node => {
    const transitions = {};
    (node.edges || []).forEach(edge => {
      const eventName = edge.label ? edge.label.toUpperCase().replace(/[^A-Z0-9_]/g, '_') : 'NEXT';
      transitions[eventName] = {
        target: edge.target,
        meta: { relation: edge.relation, condition: edge.condition || null }
      };
    });

    states[node.id] = {
      id: node.id,
      meta: { label: node.label, type: node.type },
      on: transitions,
      ...(analysis.sinkNodes.includes(node.id) ? { type: 'final' } : {})
    };
  });

  const stateMachine = {
    id: 'WhiteboardStateMachine',
    initial: initialNodeId,
    states
  };

  return JSON.stringify(stateMachine, null, 2);
}

/**
 * Compiles spatial topology into a clean, token-optimized Markdown report.
 */
export function compileTopologyToArchitectureSummary(topology = null) {
  const g = topology || getTopologyGraph();
  const nodes = g?.nodes || [];
  const analysis = analyzeTopology(g);

  let md = `# Spatial Whiteboard Architecture Specification (Whiteboard Spatial Topology): ${g.title || 'System Graph'}\n`;
  md += `**Topology ID:** \`${g.id}\` | **Version:** v${g.version} | **Updated:** ${g.metadata?.updatedAt || 'Recently'}\n`;
  md += `**Graph Metrics:** ${analysis.nodeCount} Components | ${analysis.edgeCount} Dependency Edges | ${analysis.hasCycles ? '⚠️ Contains Cycles' : '✓ Acyclic DAG'}\n\n`;

  md += `## 1. Topological Components\n\n`;
  md += `| ID | Component Name | Type | In-Degree | Out-Degree | Tech Stack |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;

  nodes.forEach(n => {
    const tech = n.properties?.technology || 'Standard';
    md += `| \`${n.id}\` | **${n.label}** | \`${n.type}\` | ${analysis.inDegree[n.id] || 0} | ${analysis.outDegree[n.id] || 0} | ${tech} |\n`;
  });

  md += `\n## 2. Directed Relational Edges & Dependencies\n\n`;
  if (g.edges && g.edges.length > 0) {
    md += `| Source Node | Relation | Target Node | Edge Label |\n`;
    md += `| :--- | :---: | :--- | :--- |\n`;
    g.edges.forEach(e => {
      const src = nodes.find(n => n.id === e.source)?.label || e.source;
      const tgt = nodes.find(n => n.id === e.target)?.label || e.target;
      md += `| **${src}** | \`${e.relation}\` | **${tgt}** | ${e.label || '—'} |\n`;
    });
  } else {
    md += `*No directional edges currently defined.*\n`;
  }

  return md;
}

/**
 * Takes a structured agent plan or workflow and computes a spatial layout
 * with auto-arranged (x, y) coordinates and directed edges.
 */
export function renderAgentPlanToTopology(plan = {}, options = {}) {
  initializeTopology();
  if (options?.clearExisting) {
    clearTopologyGraph();
  }

  const title = plan.title || 'Autonomous Agent Execution Plan';
  const steps = plan.steps || [];

  if (steps.length === 0) {
    return activeTopology;
  }

  const nodes = [];
  const colWidth = 260;
  const rowHeight = 150;
  const itemsPerRow = 4;

  steps.forEach((step, idx) => {
    const col = idx % itemsPerRow;
    const row = Math.floor(idx / itemsPerRow);
    const nodeId = step.id || `node_plan_${idx + 1}`;
    const x = 80 + col * colWidth;
    const y = 80 + row * rowHeight;
    const width = 200;
    const height = 85;

    nodes.push({
      id: nodeId,
      type: step.nodeType || step.type || (step.isDecision ? TOPOLOGY_NODE_TYPES.DECISION : TOPOLOGY_NODE_TYPES.FLOW_STEP),
      label: step.label || step.title || `Step ${idx + 1}`,
      description: step.description || '',
      status: step.status || 'live',
      x,
      y,
      width,
      height,
      bounds: { x, y, width, height },
      properties: {
        color: step.color || (step.isDecision ? '#f59e0b' : '#38bdf8'),
        technology: step.assignedAgent || 'Autonomous Agent'
      },
      edges: (step.dependencies || step.dependsOn || []).map(depId => ({
        target: depId,
        relation: TOPOLOGY_RELATION_TYPES.DEPENDS_ON,
        label: 'Prerequisite'
      }))
    });
  });

  // If linear sequential steps without explicit dependencies, chain sequentially
  if (!steps.some(s => (s.dependencies && s.dependencies.length > 0) || (s.dependsOn && s.dependsOn.length > 0))) {
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].edges.push({
        target: nodes[i + 1].id,
        relation: TOPOLOGY_RELATION_TYPES.FLOWS_TO,
        label: 'Next Step'
      });
    }
  }

  const newTopology = {
    id: generateId('top_plan'),
    title,
    version: 1,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: plan.author || 'Relay Autonomous Agent',
      isAgentPlan: true
    },
    nodes,
    edges: []
  };

  activeTopology = reconcileGraphEdges(newTopology);
  persistTopologyState();

  try {
    syncTopologyToContextGraph(activeTopology);
  } catch (_e) {}

  return activeTopology;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. WHITEBOARD OBJECTS <-> TOPOLOGY ADAPTERS
// ─────────────────────────────────────────────────────────────────────────────

export function whiteboardObjectsToTopology(whiteboardObjects = []) {
  const nodes = [];
  const rawConnectors = [];

  whiteboardObjects.forEach((obj, idx) => {
    if (obj.type === 'line' || obj.type === 'connector' || obj.type === 'arrow') {
      rawConnectors.push(obj);
    } else {
      nodes.push({
        id: obj.id || `node_wb_${idx}`,
        type: obj.nodeType || (obj.type === 'rect' ? TOPOLOGY_NODE_TYPES.SERVICE : TOPOLOGY_NODE_TYPES.NOTE),
        label: obj.text || obj.label || `Shape ${idx + 1}`,
        bounds: {
          x: obj.x || 0,
          y: obj.y || 0,
          width: obj.w || obj.width || 160,
          height: obj.h || obj.height || 80
        },
        properties: {
          color: obj.color || '#38bdf8'
        },
        edges: []
      });
    }
  });

  // Reconcile connectors to nearest node targets
  rawConnectors.forEach(conn => {
    const sourceId = conn.sourceId || conn.source || conn.from || conn.startBinding?.elementId;
    const targetId = conn.targetId || conn.target || conn.to || conn.endBinding?.elementId;
    if (sourceId && targetId) {
      const src = nodes.find(n => n.id === sourceId);
      if (src) {
        src.edges.push({
          target: targetId,
          relation: conn.relation || TOPOLOGY_RELATION_TYPES.FLOWS_TO,
          label: conn.label || conn.text || ''
        });
      }
    }
  });

  const topology = {
    id: generateId('top_imported'),
    title: 'Imported Whiteboard Topology',
    version: 1,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Whiteboard Importer'
    },
    nodes,
    edges: []
  };

  return reconcileGraphEdges(topology);
}

export function topologyToWhiteboardObjects(topology = null) {
  const g = topology || getTopologyGraph();
  const objects = [];

  (g.nodes || []).forEach(node => {
    objects.push({
      id: node.id,
      nodeType: node.type,
      type: 'rect',
      x: node.bounds?.x || 100,
      y: node.bounds?.y || 100,
      w: node.bounds?.width || 180,
      h: node.bounds?.height || 80,
      text: node.label,
      color: node.properties?.color || '#38bdf8'
    });
  });

  (g.edges || []).forEach(edge => {
    const src = g.nodes.find(n => n.id === edge.source);
    const tgt = g.nodes.find(n => n.id === edge.target);
    if (src && tgt) {
      objects.push({
        id: edge.id,
        type: 'line',
        sourceId: edge.source,
        targetId: edge.target,
        relation: edge.relation,
        label: edge.label,
        x1: (src.bounds?.x || 0) + (src.bounds?.width || 180),
        y1: (src.bounds?.y || 0) + (src.bounds?.height || 80) / 2,
        x2: tgt.bounds?.x || 0,
        y2: (tgt.bounds?.y || 0) + (tgt.bounds?.height || 80) / 2
      });
    }
  });

  return objects;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TOKEN-DENSE SERIALIZERS & CONTEXT GRAPH SYNC
// ─────────────────────────────────────────────────────────────────────────────

export function serializeTopologyToMarkdown(topology = null) {
  return compileTopologyToArchitectureSummary(topology);
}

export function serializeTopologyToJson(topology = null) {
  const g = topology || getTopologyGraph();
  return JSON.stringify(g, null, 2);
}

export function syncTopologyToContextGraph(topology = null) {
  const g = topology || getTopologyGraph();
  try {
    return recordTopologyGraphNode(g);
  } catch (err) {
    console.warn('[SpatialTopologyEngine] Context graph sync notice:', err);
    return null;
  }
}
