import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, Code2, Sparkles, Layers, RefreshCw, Copy, Check, Plus, 
  ArrowRight, Database, Server, Globe, Cpu, GitFork, CheckCircle2, 
  AlertTriangle, ShieldCheck, Terminal, Download, Zap, MoveRight, 
  Boxes, FileCode, CheckSquare, RefreshCcw, Share2, Compass
} from 'lucide-react';
import {
  subscribeToTopology,
  getTopologyGraph,
  addTopologyNode,
  updateTopologyNode,
  deleteTopologyNode,
  connectTopologyNodes,
  disconnectTopologyNodes,
  analyzeTopology,
  compileTopologyToSqlSchema,
  compileTopologyToOpenApi,
  compileTopologyToStateMachine,
  compileTopologyToArchitectureSummary,
  renderAgentPlanToTopology,
  serializeTopologyToMarkdown,
  serializeTopologyToJson,
  clearTopologyGraph,
  TOPOLOGY_NODE_TYPES,
  TOPOLOGY_RELATION_TYPES
} from '../../services/spatialTopologyEngine.js';

export default function SpatialTopologyInspector() {
  const [activeTab, setActiveTab] = useState('topology'); // 'topology' | 'compiler' | 'synthesis' | 'context_sync'
  const [graphState, setGraphState] = useState(() => getTopologyGraph());
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [compilerTarget, setCompilerTarget] = useState('sql'); // 'sql' | 'openapi' | 'state_machine' | 'summary'
  const [copiedKey, setCopiedKey] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // New Node Form State
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState(TOPOLOGY_NODE_TYPES.SERVICE);
  const [newNodeCapabilities, setNewNodeCapabilities] = useState('');

  // New Edge Form State
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeRelation, setNewEdgeRelation] = useState(TOPOLOGY_RELATION_TYPES.CALLS);

  // Agent Synthesis Form State
  const [presetArchitecture, setPresetArchitecture] = useState('payment_pipeline');

  useEffect(() => {
    const unsubscribe = subscribeToTopology((updatedGraph) => {
      setGraphState({ ...updatedGraph });
      if (!selectedNodeId && updatedGraph.nodes.length > 0) {
        setSelectedNodeId(updatedGraph.nodes[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedNodeId]);

  const analysis = useMemo(() => {
    return analyzeTopology();
  }, [graphState]);

  const selectedNode = useMemo(() => {
    return graphState.nodes.find(n => n.id === selectedNodeId) || graphState.nodes[0] || null;
  }, [graphState.nodes, selectedNodeId]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return graphState.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [graphState.edges, selectedNode]);

  const compiledCode = useMemo(() => {
    if (compilerTarget === 'sql') return compileTopologyToSqlSchema();
    if (compilerTarget === 'openapi') return compileTopologyToOpenApi();
    if (compilerTarget === 'state_machine') return compileTopologyToStateMachine();
    return compileTopologyToArchitectureSummary();
  }, [compilerTarget, graphState]);

  const handleCopy = (key, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleAddNode = (e) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const capabilities = newNodeCapabilities
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const x = Math.floor(100 + (graphState.nodes.length % 4) * 260);
    const y = Math.floor(120 + Math.floor(graphState.nodes.length / 4) * 160);

    const node = addTopologyNode({
      label: newNodeLabel.trim(),
      type: newNodeType,
      x,
      y,
      metadata: {
        capabilities,
        status: 'live',
        sourceApp: 'whiteboard'
      }
    });

    setNewNodeLabel('');
    setNewNodeCapabilities('');
    setSelectedNodeId(node.id);
    setActionNotice(`Added node "${node.label}" at (${x}, ${y}).`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleConnectNodes = (e) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) return;

    const edge = connectTopologyNodes({
      source: newEdgeSource,
      target: newEdgeTarget,
      relation: newEdgeRelation
    });

    if (edge) {
      setActionNotice(`Connected ${edge.source} --[${edge.relation}]--> ${edge.target}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleDeleteNode = (nodeId) => {
    deleteTopologyNode(nodeId);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setActionNotice(`Node "${nodeId}" deleted from topology.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRunAgentSynthesis = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      let plan = null;
      if (presetArchitecture === 'payment_pipeline') {
        plan = {
          title: 'Distributed Enterprise Payment Processing Pipeline',
          steps: [
            {
              id: 'step_gateway',
              title: 'API Payment Gateway',
              description: 'TLS terminating gateway with rate limiting and token authentication.',
              nodeType: TOPOLOGY_NODE_TYPES.API_ENDPOINT,
              status: 'live'
            },
            {
              id: 'step_auth',
              title: 'Card Auth & Fraud Engine',
              description: 'Real-time ML risk scoring and 3D-Secure 2.0 validation.',
              nodeType: TOPOLOGY_NODE_TYPES.SERVICE,
              dependsOn: ['step_gateway'],
              status: 'live'
            },
            {
              id: 'step_ledger',
              title: 'Double-Entry Transaction Ledger',
              description: 'ACID immutable financial ledger with ledger replication.',
              nodeType: TOPOLOGY_NODE_TYPES.DATABASE,
              dependsOn: ['step_auth'],
              status: 'live'
            },
            {
              id: 'step_settlement',
              title: 'ACH & FedNow Settlement Queue',
              description: 'Batch settlement dispatch to clearinghouse network.',
              nodeType: TOPOLOGY_NODE_TYPES.QUEUE,
              dependsOn: ['step_ledger'],
              status: 'pending'
            }
          ]
        };
      } else if (presetArchitecture === 'research_swarm') {
        plan = {
          title: 'Autonomous Multi-Agent Research Swarm',
          steps: [
            {
              id: 'step_dispatch',
              title: 'Chief Orchestrator Agent',
              description: 'Decomposes executive query into research sub-tasks.',
              nodeType: TOPOLOGY_NODE_TYPES.AGENT_STEP,
              status: 'live'
            },
            {
              id: 'step_crawler',
              title: 'Web & SEC Filing Harvester',
              description: 'Extracts 10-K, 10-Q, and press releases into semantic markdown.',
              nodeType: TOPOLOGY_NODE_TYPES.SERVICE,
              dependsOn: ['step_dispatch'],
              status: 'live'
            },
            {
              id: 'step_eval',
              title: 'Financial Model Synthesizer',
              description: 'Populates tabular financial models and checks project rules.',
              nodeType: TOPOLOGY_NODE_TYPES.DATABASE,
              dependsOn: ['step_crawler'],
              status: 'live'
            },
            {
              id: 'step_briefing',
              title: 'Executive Briefing Generator',
              description: 'Compiles boardroom slides and decision memo PR.',
              nodeType: TOPOLOGY_NODE_TYPES.CLIENT,
              dependsOn: ['step_eval'],
              status: 'pending'
            }
          ]
        };
      } else {
        plan = {
          title: 'Event-Driven Real-Time Analytics Mesh',
          steps: [
            {
              id: 'step_ingest',
              title: 'Kafka Telemetry Cluster',
              description: 'High-throughput sensor and transaction event streaming.',
              nodeType: TOPOLOGY_NODE_TYPES.QUEUE,
              status: 'live'
            },
            {
              id: 'step_flink',
              title: 'Flink Stateful Stream Processor',
              description: 'Sliding window aggregations and metric anomalies.',
              nodeType: TOPOLOGY_NODE_TYPES.SERVICE,
              dependsOn: ['step_ingest'],
              status: 'live'
            },
            {
              id: 'step_olap',
              title: 'ClickHouse Columnar Warehouse',
              description: 'Sub-second real-time analytical SQL queries.',
              nodeType: TOPOLOGY_NODE_TYPES.DATABASE,
              dependsOn: ['step_flink'],
              status: 'live'
            },
            {
              id: 'step_dashboard',
              title: 'Executive Real-Time Dashboard',
              description: 'WebSocket pushed canvas metric widgets.',
              nodeType: TOPOLOGY_NODE_TYPES.CLIENT,
              dependsOn: ['step_olap'],
              status: 'live'
            }
          ]
        };
      }

      const result = renderAgentPlanToTopology(plan, { clearExisting: true });
      setIsSynthesizing(false);
      setActionNotice(`Synthesized "${plan.title}" (${result.nodes.length} nodes, ${result.edges.length} edges) onto canvas.`);
      setTimeout(() => setActionNotice(null), 4000);
    }, 400);
  };

  const getNodeTypeIcon = (type) => {
    switch (type) {
      case TOPOLOGY_NODE_TYPES.DATABASE:
      case TOPOLOGY_NODE_TYPES.DATA_STORE:
        return <Database size={13} className="text-amber-500" />;
      case TOPOLOGY_NODE_TYPES.API_ENDPOINT:
        return <Globe size={13} className="text-blue-500" />;
      case TOPOLOGY_NODE_TYPES.AGENT_STEP:
        return <Cpu size={13} className="text-purple-500" />;
      case TOPOLOGY_NODE_TYPES.QUEUE:
        return <Layers size={13} className="text-indigo-500" />;
      case TOPOLOGY_NODE_TYPES.CLIENT:
        return <Boxes size={13} className="text-emerald-500" />;
      case TOPOLOGY_NODE_TYPES.STATE_NODE:
        return <GitFork size={13} className="text-rose-500" />;
      default:
        return <Server size={13} className="text-teal-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans select-none overflow-hidden">
      {/* ── HEADER BANNER ── */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-xs">
            <Network size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                Spatial Topology & Visual Context Graph
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                Pillar 9 Substrate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Migrating 2D canvas whiteboard elements into bi-directional relational graph ASTs & code schemas.
            </p>
          </div>
        </div>

        {/* Global Analytics Metrics Chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 font-medium">
            <span className="text-slate-400 dark:text-zinc-500">Nodes:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{graphState.nodes.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 font-medium">
            <span className="text-slate-400 dark:text-zinc-500">Edges:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{graphState.edges.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 font-medium">
            <span className="text-slate-400 dark:text-zinc-500">Density:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{analysis.density}%</span>
          </div>
          <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-medium ${analysis.hasCycles ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
            <span>{analysis.hasCycles ? 'Cyclic' : 'DAG (Acyclic)'}</span>
          </div>
        </div>
      </div>

      {/* ── ACTION NOTICE BANNER ── */}
      {actionNotice && (
        <div className="px-4 py-2 bg-teal-500/10 border-b border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-teal-500" />
            <span>{actionNotice}</span>
          </div>
          <button 
            type="button" 
            onPointerDown={(e) => { e.preventDefault(); setActionNotice(null); }}
            className="text-teal-600 hover:text-teal-700 cursor-pointer text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── NON-PILL TAB NAVIGATION (Rule 3) ── */}
      <div className="px-4 pt-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-900/60 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); setActiveTab('topology'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors border-t border-x cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'topology'
              ? 'bg-white dark:bg-zinc-950 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-zinc-800 ring-1 ring-teal-500/30'
              : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Network size={13} />
          <span>Spatial Graph Topology</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
            {graphState.nodes.length}
          </span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); setActiveTab('compiler'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors border-t border-x cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'compiler'
              ? 'bg-white dark:bg-zinc-950 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-zinc-800 ring-1 ring-teal-500/30'
              : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Code2 size={13} />
          <span>Bi-Directional Compiler Studio</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); setActiveTab('synthesis'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors border-t border-x cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'synthesis'
              ? 'bg-white dark:bg-zinc-950 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-zinc-800 ring-1 ring-teal-500/30'
              : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Agent Plan Canvas Synthesis</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); setActiveTab('context_sync'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors border-t border-x cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'context_sync'
              ? 'bg-white dark:bg-zinc-950 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-zinc-800 ring-1 ring-teal-500/30'
              : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Share2 size={13} />
          <span>Universal Context Sync Feed</span>
        </button>
      </div>

      {/* ── TAB CONTENT BODY ── */}
      <div className="flex-1 overflow-hidden p-4 bg-white dark:bg-zinc-950">
        {/* TAB 1: SPATIAL GRAPH TOPOLOGY */}
        {activeTab === 'topology' && (
          <div className="h-full flex gap-4 overflow-hidden">
            {/* Left: Node Cards Grid */}
            <div className="flex-1 flex flex-col min-w-0 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Whiteboard Canvas Spatial Nodes ({graphState.nodes.length})
                </span>
                <span className="text-[11px] text-slate-400">Click node to inspect directional edges</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {graphState.nodes.map(node => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <div
                      key={node.id}
                      onPointerDown={(e) => { e.preventDefault(); setSelectedNodeId(node.id); }}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 ring-1 ring-teal-500/30 shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getNodeTypeIcon(node.type)}
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {node.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase font-mono">
                            {node.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({node.x}, {node.y})
                          </span>
                        </div>
                      </div>

                      {node.metadata?.capabilities && node.metadata.capabilities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {node.metadata.capabilities.map((cap, idx) => (
                            <span 
                              key={idx}
                              className="text-[9.5px] px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {graphState.nodes.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No nodes on whiteboard canvas. Add a node below or run agent synthesis.
                  </div>
                )}
              </div>

              {/* Add Node Mini-Form */}
              <form onSubmit={handleAddNode} className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    placeholder="New Node Label (e.g. Ingestion Pipeline)"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {Object.values(TOPOLOGY_NODE_TYPES).map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNodeCapabilities}
                    onChange={(e) => setNewNodeCapabilities(e.target.value)}
                    placeholder="Capabilities (comma separated: REST API, ACID, JWT)"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus size={12} />
                    <span>Add Node</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Selected Node Drawer & Directed Edges */}
            <div className="w-80 flex flex-col border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-slate-50/50 dark:bg-zinc-900/30 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Node Inspector & Relational Edges
                </span>
                {selectedNode && (
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); handleDeleteNode(selectedNode.id); }}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Delete Node
                  </button>
                )}
              </div>

              {selectedNode ? (
                <div className="flex-1 flex flex-col overflow-y-auto space-y-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">{selectedNode.id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {selectedNode.status || 'live'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {selectedNode.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Coordinates: <span className="font-mono text-slate-700 dark:text-zinc-300">X: {selectedNode.x}px, Y: {selectedNode.y}px</span> ({selectedNode.width}x{selectedNode.height})
                    </div>
                  </div>

                  {/* Connected Edges */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Directed Relational Edges ({connectedEdges.length})
                    </div>
                    <div className="space-y-1.5">
                      {connectedEdges.map(edge => {
                        const isSource = edge.source === selectedNode.id;
                        return (
                          <div 
                            key={edge.id}
                            className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`font-mono text-[11px] ${isSource ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}>
                                {edge.source}
                              </span>
                              <span className="text-[10px] px-1 py-0.2 rounded-sm bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                --[{edge.relation}]--&gt;
                              </span>
                              <span className={`font-mono text-[11px] ${!isSource ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}>
                                {edge.target}
                              </span>
                            </div>
                            <button
                              type="button"
                              onPointerDown={(e) => { e.preventDefault(); disconnectTopologyNodes(edge.id); }}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                              title="Disconnect Edge"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}

                      {connectedEdges.length === 0 && (
                        <div className="text-xs text-slate-400 p-2 text-center bg-white dark:bg-zinc-900 rounded-md border border-dashed border-slate-200 dark:border-zinc-800">
                          Isolated Node (No connected directed edges)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Edge Form */}
                  <form onSubmit={handleConnectNodes} className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Connect Directed Edge
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={newEdgeSource || selectedNode.id}
                        onChange={(e) => setNewEdgeSource(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                      >
                        {graphState.nodes.map(n => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                      <select
                        value={newEdgeRelation}
                        onChange={(e) => setNewEdgeRelation(e.target.value)}
                        className="px-1.5 py-1 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                      >
                        {Object.values(TOPOLOGY_RELATION_TYPES).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <select
                        value={newEdgeTarget}
                        onChange={(e) => setNewEdgeTarget(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                      >
                        <option value="">Target...</option>
                        {graphState.nodes.filter(n => n.id !== (newEdgeSource || selectedNode.id)).map(n => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={!newEdgeTarget}
                      className="w-full py-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-800 dark:text-zinc-200 rounded-md text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <GitFork size={12} />
                      <span>Create Relational Edge</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Select a node from the left grid to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BI-DIRECTIONAL COMPILER STUDIO */}
        {activeTab === 'compiler' && (
          <div className="h-full flex flex-col border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-900 text-slate-100 overflow-hidden">
            {/* Compiler Control Bar */}
            <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1">Target Language:</span>
                {[
                  { id: 'sql', label: 'ANSI SQL DDL' },
                  { id: 'openapi', label: 'OpenAPI 3.0 (YAML)' },
                  { id: 'state_machine', label: 'Executable State Machine (JSON)' },
                  { id: 'summary', label: 'Markdown Architecture Spec' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); setCompilerTarget(opt.id); }}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      compilerTarget === opt.id
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); handleCopy('compiled_code', compiledCode); }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedKey === 'compiled_code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedKey === 'compiled_code' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Output Viewer */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-teal-300 leading-relaxed bg-slate-950/80">
              <pre>{compiledCode}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: AGENT PLAN CANVAS SYNTHESIS */}
        {activeTab === 'synthesis' && (
          <div className="h-full flex flex-col max-w-2xl mx-auto space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Synthesize Multi-Stage Architecture to Whiteboard
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-normal">
                Autonomous agents synthesize structured execution plans onto the whiteboard canvas with computed 2D spatial coordinates, discrete node types, and directed dependencies.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Select Architectural Blueprint Preset:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'payment_pipeline',
                      title: 'Distributed Enterprise Payment Processing Pipeline',
                      desc: '4-node topology: Gateway (API) -> Card Auth (Service) -> Double-Entry Ledger (DB) -> Settlement (Queue).'
                    },
                    {
                      id: 'research_swarm',
                      title: 'Autonomous Multi-Agent Research Swarm',
                      desc: '4-node topology: Orchestrator (Agent) -> SEC Harvester (Service) -> Model Synthesizer (DB) -> Briefing (Client).'
                    },
                    {
                      id: 'event_mesh',
                      title: 'Event-Driven Real-Time Analytics Mesh',
                      desc: '4-node topology: Kafka Telemetry (Queue) -> Flink Streamer (Service) -> ClickHouse (DB) -> Canvas Dashboard (Client).'
                    }
                  ].map(blueprint => (
                    <div
                      key={blueprint.id}
                      onPointerDown={(e) => { e.preventDefault(); setPresetArchitecture(blueprint.id); }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        presetArchitecture === blueprint.id
                          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 ring-1 ring-teal-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{blueprint.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{blueprint.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSynthesizing}
                  onPointerDown={(e) => { e.preventDefault(); handleRunAgentSynthesis(); }}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>{isSynthesizing ? 'Synthesizing onto Canvas...' : 'Render Architecture to Canvas'}</span>
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); clearTopologyGraph(); setActionNotice('Cleared canvas topology.'); }}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                >
                  Clear Canvas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: UNIVERSAL CONTEXT SYNC FEED */}
        {activeTab === 'context_sync' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-teal-900 dark:text-teal-200">
                  Universal Context Graph Sync Status: ACTIVE
                </span>
              </div>
              <div className="text-teal-700 dark:text-teal-300 font-mono text-[11px]">
                Resource URI: workspace://whiteboard/topology
              </div>
            </div>

            <div className="flex-1 flex gap-3 overflow-hidden">
              {/* Token Efficiency Card */}
              <div className="w-64 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Token Density & Savings
                  </div>
                  <div className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="text-[11px] text-slate-500">Raw Pixel Coordinates:</div>
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-zinc-100">~2,400 tokens</div>
                  </div>
                  <div className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="text-[11px] text-slate-500">Relational Topology AST:</div>
                    <div className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">~380 tokens</div>
                  </div>
                  <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                    <div className="text-[10px] uppercase font-bold tracking-wide">Efficiency Gain</div>
                    <div className="text-lg font-mono font-black">+84.2% Savings</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Allows lightweight and local LLMs to reason over whiteboard visual models without hallucinating coordinate math.
                </div>
              </div>

              {/* JSON Serialization Preview */}
              <div className="flex-1 flex flex-col border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-2 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                  <span>Structured Graph JSON-LD AST</span>
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); handleCopy('graph_json', serializeTopologyToJson()); }}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-300 cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === 'graph_json' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedKey === 'graph_json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="flex-1 p-3 overflow-auto font-mono text-xs text-slate-700 dark:text-zinc-300 bg-slate-50/50 dark:bg-zinc-900/30">
                  <pre>{serializeTopologyToJson()}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
