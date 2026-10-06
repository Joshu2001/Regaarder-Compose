import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Table, CheckSquare, Sparkles, ArrowRight, Layers, Database, 
  GitPullRequest, RefreshCw, Upload, Eye, ShieldCheck, Zap, Copy, Check,
  ChevronDown, ExternalLink, Filter, AlertCircle, FileCode, CheckCircle2,
  Maximize2, Split, Clock, Plus, Trash2
} from 'lucide-react';
import { 
  getPortalQueue, 
  getIngestionManifest, 
  getIngestionPackageById, 
  subscribeToPortal, 
  decomposeDocumentCrossApp, 
  createIngestionPackage, 
  routeEntitiesCrossApp, 
  stageIngestionPackage, 
  clearPortalHistory,
  serializePackageToMarkdown,
  serializePackageToJson,
  PORTAL_FORMATS 
} from '../../services/omniPortalEngine.js';

// Pre-packaged executive sample document for instant 1-click demonstration
const SAMPLE_EXECUTIVE_READOUT = `# Q3 2026 Strategic Business Review & Infrastructure Plan

## Executive Overview
Regaarder platform adoption increased 38% quarter-over-quarter, driven by enterprise migration to local-first autonomous execution substrates. Our compute efficiency initiatives have lowered model inference latency to sub-12ms across all regional clusters.

## Financial & Capacity Projections
The following table outlines data center expansion capital requirements and revenue targets through fiscal 2027:

| Cluster Region | Capacity Units | Projected Cost | Gross Margin % | Deployment Status |
| :--- | :--- | :--- | :--- | :--- |
| US-East Virginia | 2,400 | $14.2M | 68% | Active |
| EU-West Frankfurt | 1,800 | $11.5M | 64% | In Progress |
| AP-South Singapore | 1,200 | $8.9M | 62% | Pending |
| US-West Oregon | 3,100 | $18.4M | 71% | Active |

## Strategic Action Items & Commitments
- [ ] AGENT: Reconcile third-party GPU vendor agreements against corporate dual-sourcing compliance rule by Friday.
- [ ] TEAM: Review and approve SOC2 Type II compliance audit report before board readout.
- [ ] USER: Authorize capital deployment tranche for Singapore cluster expansion by October 1st.
- [ ] AGENT: Generate automated financial model variance scenario in Regaarder Sheets.`;

export default function OmniPortalInspector() {
  const [activeTab, setActiveTab] = useState('dual_view'); // 'dual_view' | 'hydration_matrix' | 'playground' | 'queue'
  const [portalData, setPortalData] = useState({ jobs: [], manifest: [] });
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [playgroundInput, setPlaygroundInput] = useState(SAMPLE_EXECUTIVE_READOUT);
  const [playgroundDocTitle, setPlaygroundDocTitle] = useState('Q3 Strategic Readout');
  const [playgroundFileName, setPlaygroundFileName] = useState('Q3_Strategic_Readout.docx');
  const [viewSplitMode, setViewSplitMode] = useState('split'); // 'split' | 'original' | 'state'
  const [copiedKey, setCopiedKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Subscribe to reactive portal bus
  useEffect(() => {
    const unsubscribe = subscribeToPortal((data) => {
      setPortalData(data);
      if (!selectedPackageId && data.jobs.length > 0) {
        setSelectedPackageId(data.jobs[0].id);
      }
    });

    // If queue is empty initially, seed with sample package
    const currentQueue = getPortalQueue();
    if (currentQueue.length === 0) {
      const seeded = createIngestionPackage(SAMPLE_EXECUTIVE_READOUT, {
        fileName: 'Q3_Strategic_Readout.docx',
        title: 'Q3 Strategic Readout'
      });
      setSelectedPackageId(seeded.id);
    } else {
      setSelectedPackageId(currentQueue[0].id);
    }

    return () => unsubscribe();
  }, []);

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) return portalData.jobs[0] || null;
    return portalData.jobs.find(j => j.id === selectedPackageId) || portalData.jobs[0] || null;
  }, [selectedPackageId, portalData]);

  // Real-time playground decomposition
  const playgroundDecomposition = useMemo(() => {
    if (!playgroundInput.trim()) return null;
    try {
      return decomposeDocumentCrossApp(playgroundInput, {
        title: playgroundDocTitle,
        fileName: playgroundFileName
      });
    } catch (err) {
      console.warn('[OmniPortalInspector] Decomposition error:', err);
      return null;
    }
  }, [playgroundInput, playgroundDocTitle, playgroundFileName]);

  const handleCopy = (key, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleIngestPlayground = () => {
    setIsProcessing(true);
    try {
      const pkg = createIngestionPackage(playgroundInput, {
        title: playgroundDocTitle,
        fileName: playgroundFileName
      });
      setSelectedPackageId(pkg.id);
      setActiveTab('dual_view');
      setActionNotice({ type: 'success', text: `Ingested "${pkg.title}" with ${pkg.workspaceState.tokenStats.savingsPercent}% token savings.` });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStagePackage = async (pkg) => {
    if (!pkg) return;
    setIsProcessing(true);
    try {
      const staged = stageIngestionPackage(pkg);
      setActionNotice({
        type: 'success',
        text: `Staged in PR #${staged.branchNumber} (${staged.branchId}) across Docs, Sheets, and Tasks.`
      });
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/40 text-slate-800 dark:text-zinc-200">
      {/* ── Top Header & Stats Strip ── */}
      <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 shadow-2xs">
              <Upload size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Omni-Portal Universal Ingestion Substrate
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-800/40">
                  Pillar 7 Active
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Lossless schema translation & multi-app decomposition (Matrix • Canvas AST • Directive Queue)
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Chips */}
        <div className="flex items-center gap-2">
          {actionNotice && (
            <div className={`text-[11px] px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5 animate-fadeIn ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
            }`}>
              <CheckCircle2 size={12} />
              <span>{actionNotice.text}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleStagePackage(selectedPackage)}
            disabled={!selectedPackage || isProcessing}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <GitPullRequest size={13} />
            <span>Stage Ingestion PR</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tab Bar (Apple-tier Non-Pill Slightly Rounded Rectangles) ── */}
      <div className="px-4 pt-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-zinc-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'dual_view', label: 'Dual-View Ingestion Studio', icon: Split },
          { id: 'hydration_matrix', label: 'Cross-App Hydration Matrix', icon: Layers },
          { id: 'playground', label: 'Schema Translation Playground', icon: Sparkles },
          { id: 'queue', label: 'Ingestion Queue & History', icon: Database },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap mb-2 ${
                isActive
                  ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                  : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
              }`}
            >
              <TabIcon size={13} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Content ── */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        
        {/* ── TAB 1: DUAL-VIEW INGESTION STUDIO ── */}
        {activeTab === 'dual_view' && selectedPackage && (
          <div className="space-y-4">
            {/* Package Selector & Token Savings Metric Banner */}
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Active Document:</span>
                <select
                  value={selectedPackageId || ''}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                >
                  {portalData.jobs.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title} ({pkg.format.toUpperCase()})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono">
                  {selectedPackage.fileName}
                </span>
              </div>

              {/* Token Savings Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Context Savings</div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <Zap size={13} className="text-amber-500 fill-amber-500" />
                    <span>{selectedPackage.workspaceState?.tokenStats?.savingsPercent || 0}% Savings</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 border-l border-black/[0.06] dark:border-white/[0.08] pl-3">
                  <div>~{selectedPackage.workspaceState?.tokenStats?.semanticTokensEstimate || 0} semantic tokens</div>
                  <div className="text-slate-400 dark:text-zinc-500 line-through">~{selectedPackage.workspaceState?.tokenStats?.rawTokensEstimate || 0} raw markup tokens</div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5 bg-slate-100/80 dark:bg-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setViewSplitMode('split')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      viewSplitMode === 'split' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewSplitMode('original')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      viewSplitMode === 'original' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Human View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewSplitMode('state')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      viewSplitMode === 'state' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Agent AST View
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen Surfaces */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Human Original View */}
              {(viewSplitMode === 'split' || viewSplitMode === 'original') && (
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Human Original View
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                      Native Layout Preview • ~{selectedPackage.originalView?.pageCountEstimate || 1} pages
                    </span>
                  </div>

                  {/* Document Render Surface */}
                  <div className="flex-1 overflow-y-auto max-h-[460px] p-4 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg font-serif text-sm leading-relaxed text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800/60">
                    <div className="prose dark:prose-invert max-w-none text-xs">
                      <h2 className="text-base font-bold font-sans text-slate-900 dark:text-white mb-2">{selectedPackage.title}</h2>
                      <p className="text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                        {selectedPackage.originalView?.previewSnippet}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: Agent Workspace State View (AST) */}
              {(viewSplitMode === 'split' || viewSplitMode === 'state') && (
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <FileCode size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Agent Workspace State View
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy('ast_md', serializePackageToMarkdown(selectedPackage))}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Copy Markdown AST"
                      >
                        {copiedKey === 'ast_md' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Token-Dense Markdown AST
                      </span>
                    </div>
                  </div>

                  {/* High-density AST Markdown representation */}
                  <div className="flex-1 overflow-y-auto max-h-[460px] p-3 bg-zinc-950 text-zinc-200 rounded-lg font-mono text-[11px] leading-relaxed border border-zinc-800">
                    <pre className="whitespace-pre-wrap">{serializePackageToMarkdown(selectedPackage)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: CROSS-APP HYDRATION MATRIX ── */}
        {activeTab === 'hydration_matrix' && selectedPackage && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Entity Decomposition & Target Workspaces
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Extracted components mapped into Canvas AST blocks, Matrix Engine tables, and Directive Queue tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStagePackage(selectedPackage)}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GitPullRequest size={13} />
                <span>Hydrate All Workspaces via PR</span>
              </button>
            </div>

            {/* 3-Destination Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Destination 1: Canvas AST */}
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <div className="w-6 h-6 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 flex items-center justify-center">
                    <FileText size={13} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Canvas AST</div>
                    <div className="text-[10px] text-slate-400">Compose Word Processor</div>
                  </div>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-semibold">
                    {selectedPackage.workspaceState?.canvas?.blockCount || 0} blocks
                  </span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                  {(selectedPackage.workspaceState?.canvas?.blockTree?.blocks || []).slice(0, 6).map((block, bIdx) => (
                    <div key={block.id || bIdx} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/50 text-[11px]">
                      <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 mb-0.5">
                        <span className="text-violet-600 dark:text-violet-400 font-semibold">{block.id}</span>
                        <span>{block.type}</span>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 truncate">{block.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination 2: Matrix Engine */}
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
                    <Table size={13} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Matrix Engine</div>
                    <div className="text-[10px] text-slate-400">Sheets Data Substrate</div>
                  </div>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
                    {selectedPackage.workspaceState?.matrix?.totalTables || 0} tables
                  </span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                  {(selectedPackage.workspaceState?.matrix?.sheets || []).map((sheet, sIdx) => (
                    <div key={sheet.id || sIdx} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/50 text-[11px]">
                      <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 mb-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{sheet.id}</span>
                        <span>{sheet.rowCount}R × {sheet.colCount}C</span>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate mb-1">{sheet.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {(sheet.schema?.columns || []).map((col, cIdx) => (
                          <span key={cIdx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-mono">
                            {col.name || col.key}: {col.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination 3: Directive Queue */}
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center">
                    <CheckSquare size={13} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Directive Queue</div>
                    <div className="text-[10px] text-slate-400">Sidebar Tasks Substrate</div>
                  </div>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
                    {selectedPackage.workspaceState?.directives?.totalTasks || 0} tasks
                  </span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                  {(selectedPackage.workspaceState?.directives?.items || []).map((task, tIdx) => (
                    <div key={task.id || tIdx} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/50 text-[11px]">
                      <div className="flex items-center justify-between text-[9.5px] font-semibold uppercase mb-0.5">
                        <span className={`px-1.5 py-0.2 rounded ${
                          task.owner === 'agent' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' :
                          task.owner === 'team' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {task.owner}
                        </span>
                        <span className="text-slate-400 font-normal">{task.priority}</span>
                      </div>
                      <p className="text-slate-800 dark:text-zinc-200 leading-snug">{task.text}</p>
                      {task.linkedBlockId && (
                        <div className="text-[9px] font-mono text-slate-400 mt-1">
                          Anchor: {task.linkedBlockId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: SCHEMA TRANSLATION PLAYGROUND ── */}
        {activeTab === 'playground' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Schema Translation Playground
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Paste raw Markdown, HTML, or CSV to test zero-latency entity extraction, Rule 7 isolation, and token metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlaygroundInput(SAMPLE_EXECUTIVE_READOUT);
                    setPlaygroundDocTitle('Q3 Strategic Readout');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium hover:bg-slate-50"
                >
                  Load Sample Readout
                </button>
                <button
                  type="button"
                  onClick={handleIngestPlayground}
                  disabled={!playgroundInput.trim() || isProcessing}
                  className="px-3.5 py-1 text-xs rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload size={12} />
                  <span>Ingest Document</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Raw Content Editor */}
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Raw Input Content</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playgroundDocTitle}
                      onChange={(e) => setPlaygroundDocTitle(e.target.value)}
                      placeholder="Title"
                      className="text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                    />
                    <span className="text-[10px] font-mono text-slate-400">
                      {playgroundInput.length} chars
                    </span>
                  </div>
                </div>
                <textarea
                  rows={16}
                  value={playgroundInput}
                  onChange={(e) => setPlaygroundInput(e.target.value)}
                  placeholder="Paste unstructured document content, tables, or markdown here..."
                  className="w-full flex-1 p-3 bg-slate-50/80 dark:bg-zinc-950/60 rounded-lg font-mono text-xs text-slate-800 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-800 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Right: Live Decomposition Preview */}
              <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Decomposition Results</span>
                  {playgroundDecomposition && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      {playgroundDecomposition.tokenStats.savingsPercent}% Savings
                    </span>
                  )}
                </div>

                {playgroundDecomposition ? (
                  <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
                    {/* Token Metrics Card */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/50 text-center">
                      <div>
                        <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Blocks</div>
                        <div className="text-base font-bold text-violet-600">{playgroundDecomposition.canvas.blockCount}</div>
                      </div>
                      <div>
                        <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Tables</div>
                        <div className="text-base font-bold text-emerald-600">{playgroundDecomposition.matrix.totalTables}</div>
                      </div>
                      <div>
                        <div className="text-[9.5px] text-slate-400 uppercase font-semibold">Tasks</div>
                        <div className="text-base font-bold text-amber-600">{playgroundDecomposition.directives.totalTasks}</div>
                      </div>
                    </div>

                    {/* Extracted Tables Preview */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                        <Table size={12} className="text-emerald-600" />
                        <span>Extracted Matrix Tables ({playgroundDecomposition.matrix.sheets.length})</span>
                      </div>
                      {playgroundDecomposition.matrix.sheets.map((sheet, sIdx) => (
                        <div key={sIdx} className="p-2 rounded bg-zinc-950 text-zinc-300 text-[10.5px] font-mono mb-2 overflow-x-auto">
                          <pre>{sheet.markdown}</pre>
                        </div>
                      ))}
                    </div>

                    {/* Extracted Action Items */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                        <CheckSquare size={12} className="text-amber-600" />
                        <span>Extracted Action Items ({playgroundDecomposition.directives.items.length})</span>
                      </div>
                      <div className="space-y-1">
                        {playgroundDecomposition.directives.items.map((task, tIdx) => (
                          <div key={tIdx} className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-[11px] flex items-center gap-2">
                            <span className="font-mono text-[9px] px-1 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold uppercase">
                              {task.owner}
                            </span>
                            <span className="truncate flex-1">{task.text}</span>
                            <span className="text-[9px] text-slate-400">{task.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                    Enter document text on the left to see live extraction.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: INGESTION QUEUE & HISTORY ── */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ingestion Catalog & Manifest History
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Audit trail of all processed documents, extracted block counts, and active PR sandboxes.
                </p>
              </div>
              <button
                type="button"
                onClick={clearPortalHistory}
                className="px-2.5 py-1 text-xs rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Clear History</span>
              </button>
            </div>

            {/* Catalog List */}
            <div className="space-y-2">
              {portalData.manifest.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  No documents in ingestion manifest. Use the Playground or Ingestion Studio to process files.
                </div>
              ) : (
                portalData.manifest.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedPackageId(item.id);
                      setActiveTab('dual_view');
                    }}
                    className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 shadow-2xs hover:border-violet-400/50 dark:hover:border-violet-500/50 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 flex items-center justify-center font-bold text-xs">
                        {item.format?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.fileName} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-slate-500">{item.blocks} blocks</span>
                      <span className="text-slate-500">{item.sheets} sheets</span>
                      <span className="text-slate-500">{item.tasks} tasks</span>
                      <span className="text-emerald-600 font-bold">+{item.savingsPercent}% tokens</span>
                      <ChevronDown size={14} className="text-slate-400 -rotate-90" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
