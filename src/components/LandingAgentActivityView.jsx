import React, { useState, useEffect } from 'react';
import { GitPullRequest, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { 
  getAgentDailyJournal, 
  subscribeToJournal, 
  formatStoryTime 
} from '../services/agentJournalService.js';

/**
 * LandingAgentActivityView
 *
 * Full-stage, executive-facing Activity Canvas inspired by Slack & Linear:
 * - Replaces the 8-card launchpad in-place when toggled or when "View Journal" is clicked.
 * - Top global workspace navbar stays completely intact (user, search, switcher).
 * - Max-width 740px centered column with generous breathing room (zero title clipping).
 * - Apple-style segmented control: "All Activity", "Auto-Executed", "Needs Review".
 * - Timeline items with status dots, causal attribution ("Why it acted"), and 1-click PR review.
 */
export default function LandingAgentActivityView({ onBackToProducts, onOpenStagingPr }) {
  const [journalData, setJournalData] = useState(() => getAgentDailyJournal());
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'AUTO' | 'STAGED'

  useEffect(() => {
    const unsub = subscribeToJournal(data => {
      setJournalData(data);
    });
    return unsub;
  }, []);

  const { metrics, stories } = journalData;

  const filteredStories = stories.filter(story => {
    if (filterMode === 'STAGED') return story.autonomyStatus === 'STAGED_FOR_REVIEW';
    if (filterMode === 'AUTO') return story.autonomyStatus === 'AUTO_EXECUTED' || story.autonomyStatus === 'COMMITTED';
    return true;
  });

  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Navigation Row: Back to Products & View Context */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-white/[0.05]">
        <button
          type="button"
          onClick={onBackToProducts}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
            {metrics.totalOperationsToday} operations today
          </span>
          <span className="text-slate-300 dark:text-zinc-700">·</span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {metrics.autonomyRatePercent}% auto-cleared
          </span>
        </div>
      </div>

      {/* Main Activity Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Agent Activity
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
              Today
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">
            Everything your autonomous agents executed, why they acted, and items requiring review.
          </p>
        </div>

        {/* Apple Segmented Control Filter Tabs */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800/70 border border-slate-200/50 dark:border-white/[0.04] shrink-0 self-start sm:self-auto">
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
                onClick={() => setFilterMode(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Summary Strip (3 Columns, clean borderless background) */}
      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/40 dark:border-white/[0.04] shadow-[0_1px_3px_rgba(15,23,42,0.02)] grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/[0.05]">
        <div className="px-3 first:pl-1">
          <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
            Operations Today
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block tracking-tight">
            {metrics.totalOperationsToday}
          </span>
          <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
            across all connected tools
          </span>
        </div>

        <div className="px-4">
          <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
            Autonomy Clearance
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block tracking-tight">
            {metrics.autonomyRatePercent}%
          </span>
          <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
            {metrics.autoExecutedCount} completed with 0 prompts
          </span>
        </div>

        <div className="px-4">
          <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
            Direct Time Saved
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block tracking-tight">
            {metrics.timeSavedLabel}
          </span>
          <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
            {metrics.stagedCount} currently awaiting review
          </span>
        </div>
      </div>

      {/* Feed Container (Clean Linear / Slack style timeline cards) */}
      <div className="space-y-3 pb-12 select-text">
        {filteredStories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/40 dark:border-white/[0.04] p-8">
            No agent activity found for this filter.
          </div>
        ) : (
          filteredStories.map((story) => {
            const isStaged = story.autonomyStatus === 'STAGED_FOR_REVIEW';

            return (
              <div 
                key={story.id} 
                className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/40 dark:border-white/[0.04] shadow-[0_1px_3px_rgba(15,23,42,0.02)] hover:border-slate-300/70 dark:hover:border-white/10 transition-all duration-200"
              >
                {/* Story Top Metadata */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isStaged ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      }`} 
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {story.agentName}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-700">·</span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      {formatStoryTime(story.timestamp)} ({story.period})
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                      isStaged
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                    }`}
                  >
                    {isStaged ? 'Needs Review · Staged PR' : 'Auto-Cleared'}
                  </span>
                </div>

                {/* Primary Action Title (Wide, unclipped, elegant) */}
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                  {story.title}
                </h3>

                {/* Causal Attribution ("Why it acted") */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.04] space-y-1">
                  <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Why the agent acted
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {story.why}
                  </p>
                </div>

                {/* Bottom Footer: Trigger & Actions */}
                <div className="flex items-center justify-between pt-3 mt-1 text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Trigger: <strong className="font-medium text-slate-600 dark:text-zinc-400">{story.trigger}</strong>
                  </span>

                  {/* Staged PR CTA Button */}
                  {isStaged && story.stagedBranchId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenStagingPr) {
                          onOpenStagingPr(story.stagedBranchId);
                        } else if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_STAGING_MODAL__) {
                          window.__REGAARDER_OPEN_STAGING_MODAL__({ id: story.stagedBranchId });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <GitPullRequest size={12} />
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
  );
}
