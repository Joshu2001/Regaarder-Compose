import React, { useState, useEffect } from 'react';
import { X, GitPullRequest } from 'lucide-react';
import { 
  getAgentDailyJournal, 
  subscribeToJournal, 
  formatStoryTime 
} from '../../services/agentJournalService.js';

/**
 * AgentActivityJournalModal
 *
 * Executive Apple-tier contextual surface.
 * - Solid opaque surface (bg-[#fafbfc] / bg-[#161618]) to completely eliminate ghosting/bleed-through.
 * - Layered with genuine Apple lateral shadow (shadow-[-12px_0_40px_rgba(0,0,0,0.08)]).
 * - Highest z-index (z-[999999]) to guarantee it renders safely above global floating buttons.
 * - Native workspace segmented control (recessed track + sliding white tab).
 * - Understated horizontal metric strip matching the workspace aesthetic.
 * - Narrative timeline with clean dividers and typography-driven hierarchy.
 */
export default function AgentActivityJournalModal({ isOpen, onClose, onOpenStagingPr }) {
  const [journalData, setJournalData] = useState(() => getAgentDailyJournal());
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'AUTO' | 'STAGED'

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToJournal(data => {
      setJournalData(data);
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const { metrics, stories } = journalData;

  const filteredStories = stories.filter(story => {
    if (filterMode === 'STAGED') return story.autonomyStatus === 'STAGED_FOR_REVIEW';
    if (filterMode === 'AUTO') return story.autonomyStatus === 'AUTO_EXECUTED' || story.autonomyStatus === 'COMMITTED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end animate-in fade-in duration-150">
      {/* Soft Apple Dimming Scrim */}
      <div 
        className="flex-1 bg-black/25 backdrop-blur-[2px] cursor-pointer transition-opacity" 
        onClick={onClose} 
      />

      {/* Solid Slide-over Contextual Surface (490px) */}
      <div 
        data-popover="agent-journal-modal"
        className="w-full max-w-[490px] bg-[#fafbfc] dark:bg-[#161618] border-l border-slate-200/70 dark:border-white/[0.06] h-full shadow-[-16px_0_48px_rgba(15,23,42,0.12)] dark:shadow-[-16px_0_48px_rgba(0,0,0,0.6)] flex flex-col animate-in slide-in-from-right duration-200 select-none relative z-10"
      >
        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200/60 dark:border-white/[0.05] shrink-0 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0" />
                <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Agent Activity Journal
                </h2>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 ml-1">
                  Today
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">
                Everything agents did today, why they acted, and what was cleared.
              </p>
              
              {/* Immediate Control Status Cue */}
              <div className="flex items-center gap-2 mt-2 text-[11.5px] font-medium text-slate-600 dark:text-zinc-300">
                <span>{metrics.totalOperationsToday} operations</span>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="text-emerald-600 dark:text-emerald-400">{metrics.autoExecutedCount} auto-executed</span>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <span className={metrics.stagedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500'}>
                  {metrics.stagedCount} {metrics.stagedCount === 1 ? 'needs review' : 'need review'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onClose?.();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Close Journal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Metric Strip (Native Apple tabular aesthetic) */}
          <div className="mt-4 py-2.5 px-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] grid grid-cols-3 divide-x divide-slate-200/60 dark:divide-white/[0.06]">
            <div className="pr-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Operations
              </span>
              <span className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 block tracking-tight">
                {metrics.totalOperationsToday}
              </span>
            </div>

            <div className="px-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Autonomy
              </span>
              <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block tracking-tight">
                {metrics.autonomyRatePercent}%
              </span>
            </div>

            <div className="pl-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Time Saved
              </span>
              <span className="text-[14px] font-semibold text-slate-900 dark:text-white mt-0.5 block tracking-tight">
                {metrics.timeSavedLabel}
              </span>
            </div>
          </div>

          {/* Native Workspace Segmented Control (Rule 3: Slightly rounded rectangles, no pills) */}
          <div className="flex items-center gap-1 mt-4 p-0.5 rounded-lg bg-slate-200/50 dark:bg-zinc-800/60 border border-slate-200/40 dark:border-white/[0.04]">
            {[
              { key: 'ALL', label: 'All Activity' },
              { key: 'AUTO', label: 'Auto-Executed' },
              { key: 'STAGED', label: metrics.stagedCount > 0 ? `Needs Review (${metrics.stagedCount})` : 'Needs Review' }
            ].map((tab) => {
              const isActive = filterMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setFilterMode(tab.key);
                  }}
                  className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Storyline Chronological Feed */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-6 divide-y divide-slate-200/50 dark:divide-white/[0.04] select-text">
          {filteredStories.length === 0 ? (
            <div className="py-20 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No activity entries under this filter.
            </div>
          ) : (
            filteredStories.map((story) => {
              const isStaged = story.autonomyStatus === 'STAGED_FOR_REVIEW';

              return (
                <div key={story.id} className="py-4 space-y-1.5">
                  {/* Top Metadata Line */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11.5px] text-slate-400 dark:text-zinc-500">
                      <span className="font-mono">
                        {formatStoryTime(story.timestamp)}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {story.agentName}
                      </span>
                    </div>

                    {/* Clean Status Cue */}
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase ${
                        isStaged
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isStaged ? 'STAGED PR' : 'AUTO-EXECUTED'}
                    </span>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                    {story.title}
                  </h3>

                  {/* Why it acted: typography-driven narrative */}
                  <div className="pt-0.5 space-y-0.5">
                    <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                      Why it acted
                    </span>
                    <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {story.why}
                    </p>
                  </div>

                  {/* Trigger tag & Action */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 dark:text-zinc-500 text-[10.5px]">
                      {story.trigger}
                    </span>

                    {/* Staged PR CTA */}
                    {isStaged && story.stagedBranchId && (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          onClose?.();
                          if (onOpenStagingPr) {
                            onOpenStagingPr(story.stagedBranchId);
                          } else if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_STAGING_MODAL__) {
                            window.__REGAARDER_OPEN_STAGING_MODAL__({ id: story.stagedBranchId });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-[10.5px] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        <GitPullRequest size={11} />
                        <span>Review Staged PR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
