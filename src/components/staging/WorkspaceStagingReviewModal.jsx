import React, { useState } from 'react';
import { 
  GitPullRequest, Check, X, ShieldAlert, ShieldCheck, Trash2,
  FileText, CheckSquare, Sparkles, Layers, ArrowRight, Eye, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { 
  approveAndCommitBranch, 
  rejectBranch, 
  rejectStagedMutation,
  toggleMutationSelection 
} from '../../services/workspaceStagingEngine.js';
import { RegaarderProductIcon } from '../RegaarderProductIcons';

export default function WorkspaceStagingReviewModal({
  branch,
  onClose,
  onCommitted,
  onRejected
}) {
  const [activeMutations, setActiveMutations] = useState(() => branch?.mutations || []);
  const [selectedIds, setSelectedIds] = useState(() => {
    return (branch?.mutations || [])
      .filter(m => m.selected !== false)
      .map(m => m.mutationId);
  });
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(null);
  const [diffViewMode, setDiffViewMode] = useState('unified'); // 'unified' | 'split'

  if (!branch) return null;

  const handleClose = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (onClose) onClose();
  };

  const handleToggle = (mutId, e) => {
    if (e?.preventDefault) e.preventDefault();
    setSelectedIds(prev => {
      const next = prev.includes(mutId) 
        ? prev.filter(id => id !== mutId) 
        : [...prev, mutId];
      toggleMutationSelection(branch.id, mutId, next.includes(mutId));
      return next;
    });
  };

  const handleSelectAll = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const all = activeMutations.map(m => m.mutationId);
    setSelectedIds(all);
    all.forEach(id => toggleMutationSelection(branch.id, id, true));
  };

  const handleDeselectAll = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSelectedIds([]);
    activeMutations.forEach(m => toggleMutationSelection(branch.id, m.mutationId, false));
  };

  const handleRejectMutation = (mutId, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (e?.preventDefault) e.preventDefault();
    try {
      const res = rejectStagedMutation(branch.id, mutId);
      if (res.success) {
        const nextList = activeMutations.filter(m => m.mutationId !== mutId);
        setActiveMutations(nextList);
        setSelectedIds(prev => prev.filter(id => id !== mutId));
        if (nextList.length === 0) {
          if (onRejected) onRejected(branch.id);
          if (onClose) onClose();
        }
      }
    } catch (err) {
      console.error('[StagingModal] Discard mutation failed:', err);
    }
  };

  const handleApprove = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (selectedIds.length === 0 || isCommitting) return;
    setIsCommitting(true);
    try {
      const result = await approveAndCommitBranch(branch.id, selectedIds);
      setCommitSuccess(result);
      setTimeout(() => {
        if (onCommitted) onCommitted(result);
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      console.error('[StagingModal] Commit failed:', err);
      setIsCommitting(false);
    }
  };

  const handleReject = (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      const result = rejectBranch(branch.id, 'Discarded by user from Staging Review Modal');
      if (onRejected) onRejected(result);
      if (onClose) onClose();
    } catch (err) {
      console.error('[StagingModal] Rejection failed:', err);
    }
  };

  const totalAdditions = activeMutations.reduce((acc, m) => acc + (m.stats?.addedChars || 0), 0);
  const totalDeletions = activeMutations.reduce((acc, m) => acc + (m.stats?.removedChars || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold outline outline-1 outline-emerald-500/15">
                <GitPullRequest size={12} />
                <span>PR #{branch.prNumber}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Created by <strong className="text-slate-700 dark:text-zinc-300">{branch.agentId}</strong>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • {new Date(branch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1">
                {branch.targetApps?.map(app => (
                  <span key={app} className="text-[9.5px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/15">
                    {app}
                  </span>
                ))}
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {branch.title}
            </h2>
            {branch.description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400">{branch.description}</p>
            )}
          </div>

          <button
            type="button"
            onPointerDown={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Diff Metrics & Cherry-Pick Controls Bar */}
        <div className="px-5 py-2.5 border-b border-black/[0.04] dark:border-white/[0.06] bg-slate-50/30 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 dark:text-zinc-300 font-medium">
              {activeMutations.length} staged change(s)
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{totalAdditions}</span>
              <span className="text-slate-300 dark:text-zinc-600">/</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">-{totalDeletions} chars</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Cherry-pick:</span>
              <button
                type="button"
                onPointerDown={handleSelectAll}
                className="text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer"
              >
                All
              </button>
              <span>•</span>
              <button
                type="button"
                onPointerDown={handleDeselectAll}
                className="text-slate-400 hover:underline cursor-pointer"
              >
                None
              </button>
            </div>

            {/* View Mode Toggle - Sharp rounded rectangles, no pills */}
            <div className="flex items-center rounded-lg bg-black/[0.04] dark:bg-white/[0.06] p-0.5 text-[10.5px] font-semibold font-mono">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); setDiffViewMode('unified'); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  diffViewMode === 'unified' 
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs outline outline-1 outline-violet-500/30' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
              >
                Unified Diff
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); setDiffViewMode('split'); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  diffViewMode === 'split' 
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs outline outline-1 outline-violet-500/30' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
              >
                Side-by-Side
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Redline Diff Canvas */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeMutations.map((mut) => {
            const isSelected = selectedIds.includes(mut.mutationId);
            const clearance = mut.securityGate?.clearanceLevel || (mut.metadata?.destructive ? 'HIGH_RISK' : 'STANDARD');
            const isHighRisk = clearance === 'HIGH_RISK' || clearance === 'STRICT' || clearance === 'CONFIRMATION_REQUIRED';

            return (
              <div
                key={mut.mutationId}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800/80 border-violet-500/30 shadow-sm outline outline-1 outline-violet-500/20'
                    : 'bg-slate-50/60 dark:bg-zinc-900/40 border-black/[0.04] dark:border-white/[0.05] opacity-60'
                }`}
              >
                {/* Item Header */}
                <div 
                  className="p-3.5 flex items-center justify-between gap-3 border-b border-black/[0.04] dark:border-white/[0.05] select-none bg-slate-50/50 dark:bg-zinc-800/50"
                >
                  <div 
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    onPointerDown={(e) => handleToggle(mut.mutationId, e)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(mut.mutationId)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-zinc-300 border border-black/[0.04]">
                        {mut.targetApp}
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white truncate">
                        {mut.targetTitle}
                      </strong>
                      <span className="text-[10.5px] font-mono text-slate-400">
                        ({mut.toolName})
                      </span>

                      {/* Security Clearance Gate Badge */}
                      <div 
                        title={mut.securityGate?.reason || (isHighRisk ? 'Destructive operation requires confirmation' : 'Standard clearance')}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold uppercase ${
                          isHighRisk
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 outline outline-1 outline-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-zinc-400 border border-black/5 dark:border-white/5'
                        }`}
                      >
                        {isHighRisk ? (
                          <ShieldAlert size={10} className="text-amber-600 dark:text-amber-400" />
                        ) : (
                          <ShieldCheck size={10} className="text-emerald-500" />
                        )}
                        <span>{clearance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{mut.stats?.addedChars || 0}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">-{mut.stats?.removedChars || 0}</span>
                    </div>

                    {/* Individual Mutation Discard Button */}
                    <button
                      type="button"
                      title="Discard this staged mutation"
                      onPointerDown={(e) => handleRejectMutation(mut.mutationId, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Diff Viewer Body */}
                <div className="p-3.5 text-xs font-mono">
                  {diffViewMode === 'unified' ? (
                    <div className="p-3 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-64">
                      {(mut.diffChunks || []).map((chunk, cIdx) => {
                        if (chunk.type === 'insert') {
                          return (
                            <span 
                              key={cIdx} 
                              className="bg-emerald-500/25 text-emerald-300 font-semibold px-0.5 rounded border-b border-emerald-500/40"
                            >
                              {chunk.text}
                            </span>
                          );
                        }
                        if (chunk.type === 'delete') {
                          return (
                            <span 
                              key={cIdx} 
                              className="bg-rose-500/25 text-rose-300 line-through px-0.5 rounded opacity-75"
                            >
                              {chunk.text}
                            </span>
                          );
                        }
                        return <span key={cIdx}>{chunk.text}</span>;
                      })}
                    </div>
                  ) : (
                    /* Side-by-side view */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-slate-950/90 text-rose-300/90 overflow-x-auto max-h-56">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Original Content</div>
                        <pre className="whitespace-pre-wrap">{mut.beforeText || '(empty)'}</pre>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/90 text-emerald-300 overflow-x-auto max-h-56">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Proposed Modification</div>
                        <pre className="whitespace-pre-wrap">{mut.afterText || '(empty)'}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onPointerDown={handleReject}
            disabled={isCommitting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            Reject & Discard PR
          </button>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">
              {selectedIds.length} of {activeMutations.length} changes selected
            </span>

            <button
              type="button"
              disabled={selectedIds.length === 0 || isCommitting}
              onPointerDown={handleApprove}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md ${
                commitSuccess
                  ? 'bg-emerald-600 text-white outline outline-1 outline-emerald-400/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {commitSuccess ? (
                <>
                  <CheckCircle2 size={13} className="animate-bounce" />
                  <span>Committed to Production!</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>{isCommitting ? 'Applying Changes...' : `Approve & Commit (${selectedIds.length})`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
