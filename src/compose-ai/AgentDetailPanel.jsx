/**
 * AgentDetailPanel.jsx
 *
 * Renders the suggestion list for a specific agent (Editor, Logic,
 * Research, Consistency, Compliance, Knowledge Gap, Designer).
 *
 * Differentiates between three states:
 *   1. Agent has never been run → shows a contextual "Run Analysis" CTA
 *   2. Agent ran and found no issues → shows a success state
 *   3. Agent ran and found issues → renders sorted SuggestionCards
 *
 * The Designer agent gets an extra detected document type chip.
 */
import React, { useMemo } from 'react';
import { ChevronLeft, RefreshCw, Loader2, Zap, Trash2 } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { AGENT_REGISTRY } from './agentConfig';

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

const AGENT_CTAS = {
  editor:          'Analyze Grammar & Style',
  logic:           'Analyze Reasoning',
  designer:        'Detect Document Type',
  research:        'Find Citation Needs',
  consistency:     'Scan for Inconsistencies',
  compliance:      'Check Compliance',
  'knowledge-gap': 'Detect Knowledge Gaps',
};

export const AgentDetailPanel = ({
  agentId,
  agentData,     // raw parsed data (object for designer, array for others, undefined if not run)
  suggestionStatuses,
  isLoading,
  onBack,
  onRunAgent,
  onPreview,
  onCancelPreview,
  onApply,
  onIgnore,
  customAgent = null,
  onDeleteCustom = null,
}) => {
  const builtInAgent = AGENT_REGISTRY.find(a => a.id === agentId);
  const agent = customAgent || builtInAgent;
  const hasBeenRun = agentData !== undefined;

  // For designer, extract suggestions from nested object; for others, agentData is the array
  const suggestions = useMemo(() => {
    if (!hasBeenRun) return [];
    if (agentId === 'designer') return Array.isArray(agentData?.suggestions) ? agentData.suggestions : [];
    return Array.isArray(agentData) ? agentData : [];
  }, [agentId, agentData, hasBeenRun]);

  const sorted = useMemo(() =>
    [...suggestions].sort((a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    ), [suggestions]);

  const pendingCount = sorted.filter(s => (suggestionStatuses[s.id] || 'pending') === 'pending').length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
        <button type="button" onClick={onBack}
          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100 truncate">{agent?.label || agentId} Agent</p>
          {agentId === 'designer' && agentData?.detectedType && (
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
              {agentData.detectedType} — {agentData.confidence}% confidence
            </p>
          )}
        </div>
        {customAgent && onDeleteCustom && (
          <button type="button" onClick={onDeleteCustom} title="Delete custom agent"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
        {hasBeenRun && (
          <button type="button" onClick={onRunAgent} title="Re-run agent"
            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto thin-scrollbar p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Loader2 size={20} className="text-violet-500 animate-spin" />
            <p className="text-[12px] text-slate-500 dark:text-zinc-400">{agent?.label} Agent is analyzing…</p>
          </div>

        ) : !hasBeenRun ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className={`w-12 h-12 rounded-2xl ${agent?.bgClass || 'bg-slate-50'} flex items-center justify-center`}>
              <Zap size={20} className={agent?.accentClass || 'text-slate-500'} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100 mb-1">{agent?.description}</p>
              <p className="text-[12px] text-slate-400 dark:text-zinc-500 max-w-[200px] leading-relaxed">
                Run the analysis to find issues and inline highlights in your document.
              </p>
            </div>
            <button type="button" onClick={onRunAgent}
              className={`flex items-center gap-2 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm`}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Zap size={13} /> {AGENT_CTAS[agentId] || 'Run Analysis'}
            </button>
          </div>

        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-zinc-200">No issues found</p>
            <p className="text-[12px] text-slate-400 dark:text-zinc-500 max-w-[190px] leading-relaxed">
              This dimension looks great. Re-run anytime after new edits.
            </p>
          </div>

        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mb-0.5">
              {pendingCount} issue{pendingCount !== 1 ? 's' : ''} found
            </p>
            {sorted.map(sug => (
              <SuggestionCard
                key={sug.id}
                suggestion={sug}
                status={suggestionStatuses[sug.id] || 'pending'}
                onPreview={onPreview}
                onCancelPreview={onCancelPreview}
                onApply={onApply}
                onIgnore={onIgnore}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
