import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, Play, Sparkles, GitPullRequest, ArrowRight, Layers, Clock, 
  ShieldCheck, AlertCircle, RefreshCw, Copy, Check, Filter, Plus, Terminal, 
  ExternalLink, User, Bot, Users, CheckCircle2, ChevronRight, Hash
} from 'lucide-react';
import {
  subscribeToDirectives,
  queueAgentDirective,
  updateDirective,
  deleteDirective,
  executeAgentDirective,
  checkoutNextAgentDirective,
  linkDirectiveToBlock,
  clearRunnerLogs,
  serializeDirectivesToMarkdown,
  serializeDirectivesToJson,
  DIRECTIVE_STATUS,
  DIRECTIVE_OWNER,
  DIRECTIVE_PRIORITY
} from '../../services/directiveQueueEngine.js';

export default function DirectiveQueueInspector() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'pointers' | 'runner' | 'staging'
  const [queueState, setQueueState] = useState({ directives: [], logs: [], stats: { total: 0, userTasks: 0, agentTasks: 0, teamTasks: 0, pending: 0, running: 0, staged: 0, completed: 0 } });
  const [selectedDirectiveId, setSelectedDirectiveId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // New directive form state
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState(DIRECTIVE_OWNER.AGENT);
  const [newPriority, setNewPriority] = useState(DIRECTIVE_PRIORITY.HIGH);
  const [newBlockId, setNewBlockId] = useState('blk_q3_financial_matrix');
  const [newSnippet, setNewSnippet] = useState('Cluster Region | Capacity Units | Projected Cost | Gross Margin %');

  useEffect(() => {
    const unsubscribe = subscribeToDirectives((data) => {
      setQueueState(data);
      if (!selectedDirectiveId && data.directives.length > 0) {
        setSelectedDirectiveId(data.directives[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedDirectiveId]);

  const selectedDirective = useMemo(() => {
    return queueState.directives.find(d => d.id === selectedDirectiveId) || queueState.directives[0] || null;
  }, [queueState.directives, selectedDirectiveId]);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateDirective = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = queueAgentDirective({
      title: newTitle.trim(),
      owner: newOwner,
      priority: newPriority,
      blockPointer: newBlockId ? {
        documentId: 'doc_active',
        blockId: newBlockId.trim(),
        targetApp: 'canvas',
        blockSnippet: newSnippet.trim()
      } : null
    });

    setNewTitle('');
    setSelectedDirectiveId(created.id);
    setActionNotice(`Created directive "${created.title}".`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExecuteSingle = async (directiveId) => {
    setIsExecuting(true);
    try {
      const res = await executeAgentDirective(directiveId, { stage: true });
      if (res.success) {
        setActionNotice(`Directive execution finished with status: ${res.status.toUpperCase()}`);
      } else {
        setActionNotice(`Execution failed: ${res.error}`);
      }
    } catch (err) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRunCheckoutCycle = async () => {
    setIsExecuting(true);
    try {
      const checkedOut = checkoutNextAgentDirective();
      if (!checkedOut) {
        setActionNotice('No pending agent directives eligible for execution.');
      } else {
        const res = await executeAgentDirective(checkedOut.id, { stage: true });
        setActionNotice(`Checked out and executed "${checkedOut.title}" (Status: ${res.status}).`);
      }
    } catch (err) {
      setActionNotice(`Runner error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case DIRECTIVE_PRIORITY.URGENT:
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40';
      case DIRECTIVE_PRIORITY.HIGH:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40';
      case DIRECTIVE_PRIORITY.MEDIUM:
        return 'text-sky-600 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/40';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case DIRECTIVE_STATUS.COMPLETED:
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40';
      case DIRECTIVE_STATUS.STAGED:
        return 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40';
      case DIRECTIVE_STATUS.RUNNING:
        return 'text-sky-600 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40 animate-pulse';
      case DIRECTIVE_STATUS.FAILED:
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40';
      default:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/60 dark:bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-2xs">
      
      {/* ── Top Header / Substrate Bar ── */}
      <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/70 dark:bg-zinc-900/70 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <CheckSquare size={16} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Directive Queue & Execution Substrate</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                Pillar 8 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Autonomous execution scripts with block-linked AST pointers (blk_...) and Pillar 3 sandbox staging.
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleRunCheckoutCycle();
            }}
            disabled={isExecuting}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play size={12} fill="currentColor" />
            <span>Run Agent Checkout</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Banner ── */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-zinc-900/40 text-[11px]">
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Total Directives</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{queueState.stats.total}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">User Tasks</span>
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">{queueState.stats.userTasks}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Agent Directives</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{queueState.stats.agentTasks}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Team Checkpoints</span>
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{queueState.stats.teamTasks}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Pending</span>
          <span className="text-sm font-bold text-amber-600">{queueState.stats.pending}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Running</span>
          <span className="text-sm font-bold text-sky-600">{queueState.stats.running}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Staged PRs</span>
          <span className="text-sm font-bold text-violet-600">{queueState.stats.staged}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[10px] text-slate-400 block">Completed</span>
          <span className="text-sm font-bold text-emerald-600">{queueState.stats.completed}</span>
        </div>
      </div>

      {actionNotice && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Sparkles size={13} className="shrink-0 text-amber-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── Sub-Navigation Tabs (Rule 3 Non-Pill Styling) ── */}
      <div className="px-6 pt-3 flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-900/50">
        {[
          { id: 'matrix', label: 'Three-Tier Matrix', icon: Layers },
          { id: 'pointers', label: 'Block AST Pointers', icon: Hash },
          { id: 'runner', label: 'Autonomous Runner Console', icon: Terminal },
          { id: 'staging', label: 'Staged PR Sandboxes', icon: GitPullRequest }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 rounded-t-md cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white/80 dark:bg-zinc-800/80 outline-none ring-1 ring-amber-500/20'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Views ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Your Tasks */}
            <div className="flex flex-col rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-600" />
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your Tasks</h2>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600">
                  {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.USER).length}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.USER).map(directive => (
                  <div 
                    key={directive.id}
                    onClick={() => setSelectedDirectiveId(directive.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedDirectiveId === directive.id
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-black/[0.04] dark:border-white/[0.06] bg-white/80 dark:bg-zinc-800/80 hover:border-black/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(directive.priority)}`}>
                        {directive.priority.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusColor(directive.status)}`}>
                        {directive.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">{directive.title}</div>
                    {directive.description && (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{directive.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Agent Directives */}
            <div className="flex flex-col rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-amber-600" />
                  <h2 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Agent Directives</h2>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.AGENT).length}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.AGENT).map(directive => (
                  <div 
                    key={directive.id}
                    onClick={() => setSelectedDirectiveId(directive.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedDirectiveId === directive.id
                        ? 'border-amber-500/50 bg-amber-500/5 shadow-xs'
                        : 'border-black/[0.04] dark:border-white/[0.06] bg-white/80 dark:bg-zinc-800/80 hover:border-black/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(directive.priority)}`}>
                        {directive.priority.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusColor(directive.status)}`}>
                        {directive.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">{directive.title}</div>
                    {directive.blockPointer && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-mono">
                        <Hash size={10} />
                        <span>{directive.blockPointer.blockId}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteSingle(directive.id);
                        }}
                        disabled={isExecuting || directive.status === DIRECTIVE_STATUS.RUNNING}
                        className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play size={10} fill="currentColor" />
                        <span>Execute</span>
                      </button>
                      {directive.stagedBranchId && (
                        <span className="text-[10px] text-violet-600 font-mono">
                          PR #{directive.stagedBranchId.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Team Checkpoints */}
            <div className="flex flex-col rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-violet-600" />
                  <h2 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">Team Checkpoints</h2>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.TEAM).length}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {queueState.directives.filter(d => d.owner === DIRECTIVE_OWNER.TEAM).map(directive => (
                  <div 
                    key={directive.id}
                    onClick={() => setSelectedDirectiveId(directive.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedDirectiveId === directive.id
                        ? 'border-violet-500/50 bg-violet-500/5'
                        : 'border-black/[0.04] dark:border-white/[0.06] bg-white/80 dark:bg-zinc-800/80 hover:border-black/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(directive.priority)}`}>
                        {directive.priority.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusColor(directive.status)}`}>
                        {directive.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">{directive.title}</div>
                    {directive.blockPointer && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-mono">
                        <Hash size={10} />
                        <span>{directive.blockPointer.blockId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'pointers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Block-Linked Pointer Anchors</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Directives bound to Canvas AST nodes (blk_...) enabling surgical zero-drift edits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queueState.directives.filter(d => d.blockPointer).map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(d.priority)}`}>
                        {d.priority.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{d.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 font-bold">
                      {d.blockPointer.targetApp.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.06] text-xs font-mono text-slate-700 dark:text-zinc-300">
                    <div className="text-[10px] text-slate-400 mb-1">Target Block Node: <span className="text-violet-500 font-bold">{d.blockPointer.blockId}</span></div>
                    <div className="text-[11px] italic text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-800/60 p-2 rounded border border-black/[0.04] dark:border-white/[0.04]">
                      "{d.blockPointer.blockSnippet}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Owner: <strong className="text-slate-700 dark:text-zinc-300">{d.owner}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleExecuteSingle(d.id)}
                      disabled={isExecuting}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Execute via Block</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'runner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Autonomous Agent Runner Console</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Real-time execution transcripts, step logs, and checkout events.</p>
              </div>
              <button
                type="button"
                onClick={clearRunnerLogs}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Clear Console
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2 max-h-[420px] overflow-y-auto">
              {queueState.logs.length === 0 ? (
                <div className="text-zinc-500 italic py-6 text-center">No runner logs recorded yet. Run a checkout cycle to view logs.</div>
              ) : (
                queueState.logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 py-1 border-b border-zinc-800/60 last:border-0">
                    <span className="text-[10px] text-zinc-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`text-[10px] font-bold px-1 rounded uppercase shrink-0 ${
                      log.type === 'ERROR' ? 'bg-rose-500/20 text-rose-400' :
                      log.type === 'STAGED' ? 'bg-violet-500/20 text-violet-400' :
                      log.type === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-zinc-300 break-words">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'staging' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Staged PR Sandboxes (Pillar 3)</h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Agent mutations awaiting executive visual redline approval before commit.</p>
              </div>
            </div>

            <div className="space-y-3">
              {queueState.directives.filter(d => d.stagedBranchId).map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-violet-500/20 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GitPullRequest size={14} className="text-violet-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{d.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 font-semibold">
                        {d.stagedBranchId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Target: {d.blockPointer?.targetApp.toUpperCase() || 'TASKS'} | Completed at {d.completedAt ? new Date(d.completedAt).toLocaleTimeString() : 'Recently'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_STAGING_MODAL__) {
                        window.__REGAARDER_OPEN_STAGING_MODAL__(d.stagedBranchId);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <GitPullRequest size={12} />
                    <span>Review Redline Diff</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Queue Creation Form ── */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 shrink-0">
        <form onSubmit={handleCreateDirective} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="Queue new autonomous agent directive (e.g. 'Reconcile Q3 cluster margins')..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <select
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value={DIRECTIVE_OWNER.AGENT}>Agent Directive</option>
            <option value={DIRECTIVE_OWNER.TEAM}>Team Checkpoint</option>
            <option value={DIRECTIVE_OWNER.USER}>Your Task</option>
          </select>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value={DIRECTIVE_PRIORITY.URGENT}>Urgent</option>
            <option value={DIRECTIVE_PRIORITY.HIGH}>High</option>
            <option value={DIRECTIVE_PRIORITY.MEDIUM}>Medium</option>
            <option value={DIRECTIVE_PRIORITY.LOW}>Low</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={13} />
            <span>Queue Directive</span>
          </button>
        </form>
      </div>

    </div>
  );
}
