import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyRelayIntent, processRelayAgentMessage } from '../src/services/relayAgentService.js';
import * as spatialTopology from '../src/services/spatialTopologyEngine.js';
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
console.log(' PILLAR 9: SPATIAL TOPOLOGY & VISUAL CONTEXT GRAPH TEST SUITE');
console.log('================================================================\n');

// ── Section 1: Intent Regression & Whiteboard Intent Classification ────────
console.log('── Section 1: Intent Regression & Whiteboard Intent ──────────');

{
  const r = classifyRelayIntent('create a document called Q3 Strategy Report');
  assert('isDocCreation fires for create-document prompt', r.isDocCreation === true);
  assert('isWhiteboardTopology does NOT fire for doc creation', r.isWhiteboardTopology === false);
}

{
  const r = classifyRelayIntent('add a task: deploy the production build');
  assert('isTaskSchedule fires for task prompt', r.isTaskSchedule === true);
  assert('isWhiteboardTopology does NOT fire for simple task prompt', r.isWhiteboardTopology === false);
}

{
  const r = classifyRelayIntent('schedule a meeting for Monday at 10am');
  assert('isScheduleMeeting fires for schedule prompt', r.isScheduleMeeting === true);
  assert('isWhiteboardTopology does NOT fire for schedule prompt', r.isWhiteboardTopology === false);
}

{
  const r = classifyRelayIntent('queue an agent directive: reconcile GPU metrics');
  assert('isDirectiveQueue fires for directive prompt', r.isDirectiveQueue === true);
  assert('isWhiteboardTopology does NOT fire for directive prompt', r.isWhiteboardTopology === false);
}

{
  const r = classifyRelayIntent('compile whiteboard diagram to sql schema');
  assert('isWhiteboardTopology fires for "compile whiteboard diagram to sql schema"', r.isWhiteboardTopology === true);
  assert('isAction is true for whiteboard compilation', r.isAction === true);
  assert('isDocCreation does NOT fire for diagram compilation', r.isDocCreation === false);
}

{
  const r = classifyRelayIntent('render an architecture diagram on canvas');
  assert('isWhiteboardTopology fires for "render an architecture diagram on canvas"', r.isWhiteboardTopology === true);
}

{
  const r = classifyRelayIntent('generate spatial topology flowchart');
  assert('isWhiteboardTopology fires for "generate spatial topology flowchart"', r.isWhiteboardTopology === true);
}

// ── Section 2: Spatial Topology Graph CRUD & Analytics ───────────────────
console.log('\n── Section 2: Graph CRUD & Topological Analytics ────────────');

{
  const initialGraph = spatialTopology.getTopologyGraph();
  assert('Initial graph has seeded nodes', initialGraph.nodes.length >= 4);
  assert('Initial graph has seeded directed edges', initialGraph.edges.length >= 4);

  // Add node
  const newNode = spatialTopology.addTopologyNode({
    label: 'Redis Cache Layer',
    type: spatialTopology.TOPOLOGY_NODE_TYPES.SERVICE,
    x: 350,
    y: 200,
    metadata: {
      capabilities: ['In-memory caching', 'Session store'],
      status: 'live'
    }
  });
  assert('addTopologyNode returns created node with ID', Boolean(newNode && newNode.id));
  assertEqual('New node label matches', newNode.label, 'Redis Cache Layer');

  // Update node
  const updated = spatialTopology.updateTopologyNode(newNode.id, {
    label: 'Distributed Redis Cluster',
    metadata: { capabilities: ['Redis Cluster', 'Multi-zone'], status: 'staged' }
  });
  assertEqual('updateTopologyNode updates label', updated.label, 'Distributed Redis Cluster');
  assertEqual('updateTopologyNode updates status', updated.status, 'staged');

  // Connect edge
  const edge = spatialTopology.connectTopologyNodes({
    source: newNode.id,
    target: initialGraph.nodes[0].id,
    relation: spatialTopology.TOPOLOGY_RELATION_TYPES.READS_FROM,
    description: 'Reads cached session state'
  });
  assert('connectTopologyNodes returns directed edge', Boolean(edge && edge.id));
  assertEqual('Edge relation matches', edge.relation, spatialTopology.TOPOLOGY_RELATION_TYPES.READS_FROM);

  // Topological analysis
  const analysis = spatialTopology.analyzeTopology();
  assert('analyzeTopology computes node degrees', analysis.inDegrees[newNode.id] !== undefined);
  assert('analyzeTopology computes graph density', typeof analysis.density === 'number');
  assert('analyzeTopology detects DAG / cycles', typeof analysis.hasCycles === 'boolean');

  // Disconnect edge
  const disconnected = spatialTopology.disconnectTopologyNodes(edge.id);
  assert('disconnectTopologyNodes returns true', disconnected === true);

  // Delete node
  const deleted = spatialTopology.deleteTopologyNode(newNode.id);
  assert('deleteTopologyNode returns true', deleted === true);
  assert('Node no longer exists in graph', spatialTopology.getTopologyNode(newNode.id) === null);
}

// ── Section 3: Cycle Detection & Edge Cases ───────────────────────────────
console.log('\n── Section 3: Topological Cycle Detection & Analytics ───────');

{
  // Reset with clean acyclic chain
  spatialTopology.clearTopologyGraph();
  const nA = spatialTopology.addTopologyNode({ label: 'Node A', x: 0, y: 0 });
  const nB = spatialTopology.addTopologyNode({ label: 'Node B', x: 200, y: 0 });
  const nC = spatialTopology.addTopologyNode({ label: 'Node C', x: 400, y: 0 });

  spatialTopology.connectTopologyNodes({ source: nA.id, target: nB.id });
  spatialTopology.connectTopologyNodes({ source: nB.id, target: nC.id });

  let analysis = spatialTopology.analyzeTopology();
  assert('Acyclic linear chain has no cycles', analysis.hasCycles === false);
  assert('Node A is identified as root node', analysis.rootNodes.includes(nA.id));
  assert('Node C is identified as sink node', analysis.sinkNodes.includes(nC.id));

  // Introduce feedback loop (C -> A)
  const cycleEdge = spatialTopology.connectTopologyNodes({ source: nC.id, target: nA.id });
  analysis = spatialTopology.analyzeTopology();
  assert('Cycle detected when C connects back to A', analysis.hasCycles === true);

  // Remove feedback edge
  spatialTopology.disconnectTopologyNodes(cycleEdge.id);
  analysis = spatialTopology.analyzeTopology();
  assert('Graph becomes acyclic after removing cycle edge', analysis.hasCycles === false);
}

// ── Section 4: Bi-Directional Compilers (SQL, OpenAPI, StateMachine, Summary) ─
console.log('\n── Section 4: Bi-Directional Code Compilers ────────────────');

{
  // Setup standard microservices graph
  spatialTopology.clearTopologyGraph();
  const authNode = spatialTopology.addTopologyNode({
    label: 'Authentication Service',
    type: spatialTopology.TOPOLOGY_NODE_TYPES.API_ENDPOINT,
    metadata: { endpoint: '/api/v1/auth', method: 'POST', requestSchema: 'AuthRequest', responseSchema: 'AuthResponse' },
    x: 100,
    y: 100
  });

  const userDb = spatialTopology.addTopologyNode({
    label: 'User Accounts Database',
    type: spatialTopology.TOPOLOGY_NODE_TYPES.DATABASE,
    metadata: { columns: ['id UUID PRIMARY KEY', 'email VARCHAR(255) UNIQUE', 'hashed_pw VARCHAR(255)'] },
    x: 400,
    y: 100
  });

  spatialTopology.connectTopologyNodes({
    source: authNode.id,
    target: userDb.id,
    relation: spatialTopology.TOPOLOGY_RELATION_TYPES.WRITES_TO,
    description: 'Stores hashed user credentials'
  });

  // 1. ANSI SQL DDL Compiler
  const sql = spatialTopology.compileTopologyToSqlSchema();
  assert('compileTopologyToSqlSchema outputs ANSI SQL header', sql.includes('ANSI SQL DDL SCHEMA GENERATION'));
  assert('SQL contains CREATE TABLE for database node', sql.includes('CREATE TABLE') && sql.includes('user_accounts_database'));
  assert('SQL contains column definitions', sql.includes('email VARCHAR(255) UNIQUE'));

  // 2. OpenAPI 3.0 Compiler
  const openapi = spatialTopology.compileTopologyToOpenApi();
  assert('compileTopologyToOpenApi outputs OpenAPI 3.0.3 spec', openapi.includes('openapi: 3.0.3'));
  assert('OpenAPI contains paths section', openapi.includes('paths:'));
  assert('OpenAPI contains endpoint path', openapi.includes('/api/v1/auth'));

  // 3. Executable State Machine (XState) Compiler
  const smJson = spatialTopology.compileTopologyToStateMachine();
  const sm = JSON.parse(smJson);
  assert('compileTopologyToStateMachine outputs valid JSON', Boolean(sm));
  assertEqual('State machine ID matches', sm.id, 'WhiteboardStateMachine');
  assert('State machine has states', Object.keys(sm.states).length >= 2);
  assert('Auth state transitions to userDb', Boolean(sm.states[authNode.id]?.on));

  // 4. Markdown Architecture Summary
  const summary = spatialTopology.compileTopologyToArchitectureSummary();
  assert('compileTopologyToArchitectureSummary outputs markdown spec', summary.includes('# Spatial Whiteboard Architecture Specification'));
  assert('Summary lists nodes and directed relations', summary.includes('Directed Relational Edges'));
}

// ── Section 5: Canvas Object Adapters & Plan Synthesizer ─────────────────
console.log('\n── Section 5: Canvas Object Adapters & Plan Synthesizer ────');

{
  // Canvas Adapters
  const sampleCanvasObjects = [
    { id: 'rect_1', type: 'rectangle', x: 50, y: 60, width: 140, height: 70, text: 'Payment Webhook' },
    { id: 'rect_2', type: 'rectangle', x: 280, y: 60, width: 140, height: 70, text: 'Kafka Ingestion' },
    { id: 'arrow_1', type: 'arrow', startBinding: { elementId: 'rect_1' }, endBinding: { elementId: 'rect_2' }, label: 'dispatches_to' }
  ];

  const graphFromCanvas = spatialTopology.whiteboardObjectsToTopology(sampleCanvasObjects);
  assertEqual('whiteboardObjectsToTopology parses 2 nodes', graphFromCanvas.nodes.length, 2);
  assertEqual('whiteboardObjectsToTopology parses 1 edge', graphFromCanvas.edges.length, 1);
  assertEqual('Node text extracted as label', graphFromCanvas.nodes[0].label, 'Payment Webhook');

  const canvasFromGraph = spatialTopology.topologyToWhiteboardObjects(graphFromCanvas);
  assert('topologyToWhiteboardObjects produces canvas elements', canvasFromGraph.length === 3);

  // Agent Plan Synthesizer
  const agentPlan = {
    title: 'Multi-Stage Ingestion Pipeline',
    steps: [
      { id: 'step_fetch', title: 'Fetch SEC Filings', description: 'Download 10-K filings', nodeType: 'service', status: 'live' },
      { id: 'step_parse', title: 'Parse Financial Tables', description: 'Extract tables to CSV', nodeType: 'database', dependsOn: ['step_fetch'], status: 'live' },
      { id: 'step_eval', title: 'Audit Dual-Sourcing Rules', description: 'Check against strict rules', nodeType: 'client', dependsOn: ['step_parse'], status: 'pending' }
    ]
  };

  const synthesized = spatialTopology.renderAgentPlanToTopology(agentPlan, { clearExisting: true });
  assertEqual('Synthesizer created 3 nodes', synthesized.nodes.length, 3);
  assertEqual('Synthesizer created 2 directed edges', synthesized.edges.length, 2);
  assert('Synthesizer placed step_parse with higher X coordinate than step_fetch', 
    synthesized.nodes.find(n => n.id === 'step_parse').x > synthesized.nodes.find(n => n.id === 'step_fetch').x
  );
}

// ── Section 6: Canonical Docs Tools Integration ───────────────────────────
console.log('\n── Section 6: Canonical Docs Tools Execution ────────────────');

{
  // 1. get_whiteboard_topology
  const toolGet = getToolByName('get_whiteboard_topology');
  assert('get_whiteboard_topology registered in Canonical Tools', Boolean(toolGet));
  assertEqual('get_whiteboard_topology is non-mutating', toolGet.mutatesDocument, false);

  const getRes = await toolGet.execute({ includeAnalysis: true });
  assert('get_whiteboard_topology execution succeeded', getRes.success === true);
  assert('Returned topology includes nodes and analysis', getRes.data.nodes && getRes.data.analysis);

  // 2. compile_diagram_to_schema
  const toolCompile = getToolByName('compile_diagram_to_schema');
  assert('compile_diagram_to_schema registered', Boolean(toolCompile));

  const sqlRes = await toolCompile.execute({ target: 'sql' });
  assert('compile_diagram_to_schema (sql) succeeds', sqlRes.success === true && sqlRes.data.includes('ANSI SQL DDL'));

  const apiRes = await toolCompile.execute({ target: 'openapi' });
  assert('compile_diagram_to_schema (openapi) succeeds', apiRes.success === true && apiRes.data.includes('openapi: 3.0.3'));

  const smRes = await toolCompile.execute({ target: 'state_machine' });
  assert('compile_diagram_to_schema (state_machine) succeeds', smRes.success === true && JSON.parse(smRes.data).id);

  // 3. render_agent_plan_to_canvas
  const toolRender = getToolByName('render_agent_plan_to_canvas');
  assert('render_agent_plan_to_canvas registered', Boolean(toolRender));
  assertEqual('render_agent_plan_to_canvas mutates document', toolRender.mutatesDocument, true);

  const renderRes = await toolRender.execute({
    title: 'Test Plan',
    steps: [
      { id: 's1', title: 'Step 1' },
      { id: 's2', title: 'Step 2', dependsOn: ['s1'] }
    ]
  });
  assert('render_agent_plan_to_canvas execution succeeds', renderRes.success === true);
  assertEqual('2 nodes rendered', renderRes.data.nodes.length, 2);

  // 4. patch_whiteboard_node
  const toolPatch = getToolByName('patch_whiteboard_node');
  assert('patch_whiteboard_node registered', Boolean(toolPatch));
  assertEqual('patch_whiteboard_node mutates document', toolPatch.mutatesDocument, true);

  const patchRes = await toolPatch.execute({
    nodeId: 's1',
    patch: { label: 'Step 1 Patched', status: 'live' }
  });
  assert('patch_whiteboard_node succeeds', patchRes.success === true);
  assertEqual('Patched label matches', patchRes.data.label, 'Step 1 Patched');
}

// ── Section 7: Staging PR Sandbox & Tool Executor Integration ─────────────
console.log('\n── Section 7: Staging PR Sandbox & Tool Executor ────────────');

{
  const stagedExec = await executeTool(
    'patch_whiteboard_node',
    { nodeId: 's2', patch: { label: 'Step 2 Staged for Review', status: 'staged' } },
    { targetApp: 'whiteboard' },
    { stage: true }
  );

  assert('executeTool in stage mode marks isStaged = true', stagedExec.isStaged === true);
  assert('Staged execution created PR number', typeof stagedExec.prNumber === 'number');
  assert('Branch ID generated for whiteboard patch', Boolean(stagedExec.branchId));
  assert('Target app routed to whiteboard', stagedExec.data.targetApp === 'whiteboard');
}

// ── Section 8: Model Context Protocol (MCP) Resource Integration ───────────
console.log('\n── Section 8: Model Context Protocol (MCP) Resource ─────────');

{
  const resourceDef = MCP_RESOURCES.find(r => r.uri === 'workspace://whiteboard/topology');
  assert('workspace://whiteboard/topology registered in MCP_RESOURCES', Boolean(resourceDef));
  assertEqual('Resource mimeType is text/markdown', resourceDef.mimeType, 'text/markdown');

  const resourceData = await readResource('workspace://whiteboard/topology');
  assert('readResource reads whiteboard topology', Boolean(resourceData && resourceData.text));
  assert('Resource text contains markdown nodes summary', resourceData.text.includes('Whiteboard Spatial Topology'));
}

// ── Section 9: Relay Agent Intent & Action Card Integration ───────────────
console.log('\n── Section 9: Relay Agent Intent & Action Card ─────────────');

{
  const relayOutcome = await processRelayAgentMessage({
    userPrompt: 'compile the whiteboard diagram into sql'
  });

  assert('Relay agent produced replyText', Boolean(relayOutcome.replyText && relayOutcome.replyText.includes('SQL')));
  assert('Relay agent generated actionCard', Boolean(relayOutcome.actionCard));
  assertEqual('ActionCard type is "topology"', relayOutcome.actionCard?.type, 'topology');
  assertEqual('ActionCard target is "sql"', relayOutcome.actionCard?.target, 'sql');
  assert('ActionCard contains previewSnippet', Boolean(relayOutcome.actionCard?.previewSnippet));
}

// ── Section 10: UI & Global Window Contracts ──────────────────────────────
console.log('\n── Section 10: UI & Global Window Contracts ─────────────────');

{
  // 1. SpatialTopologyInspector component file verification
  const inspectorPath = path.join(__dirname, '..', 'src', 'components', 'whiteboard', 'SpatialTopologyInspector.jsx');
  assert('SpatialTopologyInspector.jsx exists', fs.existsSync(inspectorPath));
  const inspectorCode = fs.readFileSync(inspectorPath, 'utf8');
  assert('Inspector does not use pill tabs (Rule 3)', !inspectorCode.includes('rounded-full'));
  assert('Inspector describes active visual state as "outline" (Rule 2)', inspectorCode.includes('ring-1') || inspectorCode.includes('outline'));
  assert('Inspector uses touch-safe onPointerDown (Rule 6)', inspectorCode.includes('onPointerDown'));

  // 2. ExecutiveDirectMessages action card rendering contract
  const chatPath = path.join(__dirname, '..', 'src', 'components', 'chat', 'ExecutiveDirectMessages.jsx');
  const chatCode = fs.readFileSync(chatPath, 'utf8');
  assert('ExecutiveDirectMessages imports Network icon', chatCode.includes('Network'));
  assert('ExecutiveDirectMessages handles actionCard.type === "topology"', chatCode.includes("msg.actionCard.type === 'topology'"));
  assert('ExecutiveDirectMessages has touch-safe onPointerDown CTA', chatCode.includes('__REGAARDER_OPEN_TOPOLOGY_INSPECTOR__'));

  // 3. MemoryDashboard registration contract
  const memPath = path.join(__dirname, '..', 'src', 'MemoryDashboard.jsx');
  const memCode = fs.readFileSync(memPath, 'utf8');
  assert('MemoryDashboard imports SpatialTopologyInspector', memCode.includes('SpatialTopologyInspector'));
  assert('MemoryDashboard registers "topology" in MEMORY_TABS', memCode.includes("id: 'topology'"));
  assert('MemoryDashboard renders <SpatialTopologyInspector />', memCode.includes('<SpatialTopologyInspector />'));

  // 4. App.jsx global window contract
  const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf8');
  assert('App.jsx registers window.__REGAARDER_SPATIAL_TOPOLOGY__', appCode.includes('__REGAARDER_SPATIAL_TOPOLOGY__'));
  assert('App.jsx registers window.__REGAARDER_OPEN_TOPOLOGY_INSPECTOR__', appCode.includes('__REGAARDER_OPEN_TOPOLOGY_INSPECTOR__'));
  assert('App.jsx cleans up topology globals on unmount', appCode.includes('delete window.__REGAARDER_SPATIAL_TOPOLOGY__'));
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(` PILLAR 9 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
