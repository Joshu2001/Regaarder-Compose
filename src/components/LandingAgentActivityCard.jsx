import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getAgentDailyJournal, subscribeToJournal } from '../services/agentJournalService.js';

/**
 * LandingAgentActivityCard
 *
 * Executive summary card embedded directly on the Home / Landing page:
 * Shows at a glance what agents did today, why, and how many items are staged for review.
 *
 * Conforms strictly to:
 * - Rule 3: Apple minimalist aesthetics, slightly rounded corners
 * - Rule 6: Touch-safe pointer event handling
 * - Rule 10: Official Regaarder circle AI signature icon (RegaarderAiIcon)
 */
export default function LandingAgentActivityCard({ onOpenJournal, onOpenStagingPr }) {
  const [journalData, setJournalData] = useState(() => getAgentDailyJournal());

  useEffect(() => {
    const unsub = subscribeToJournal((data) => {
      setJournalData(data);
    });
    return unsub;
  }, []);

  const { metrics, stories } = journalData;
  const latestStory = stories && stories.length > 0 ? stories[0] : null;

  const handleOpenJournal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOpenJournal) {
      onOpenJournal();
    } else if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_AGENT_JOURNAL__) {
      window.__REGAARDER_OPEN_AGENT_JOURNAL__();
    }
  };

  const isStaged = latestStory?.autonomyStatus === 'STAGED_FOR_REVIEW';

  return (
    <div 
      onClick={handleOpenJournal}
      className="w-full mt-2 sm:mt-2.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white/80 dark:bg-[#18181b]/80 border border-slate-200/50 dark:border-white/[0.04] shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:border-slate-300/80 dark:hover:border-white/10 transition-all duration-150 cursor-pointer select-none group flex items-center justify-between gap-3 text-left"
    >
      {/* Left side: Status dot + Activity title summary */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Status Dot: Green for auto-cleared, Amber for needs review */}
        <span 
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isStaged ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
          }`} 
        />

        <div className="flex items-center gap-2 min-w-0 text-[11.5px] sm:text-[12px] truncate">
          <span className="font-semibold text-slate-800 dark:text-zinc-200 shrink-0">
            {latestStory?.agentName || "Agent Activity"}
          </span>
          <span className="text-slate-300 dark:text-zinc-700 shrink-0">·</span>
          <span className="text-slate-500 dark:text-zinc-400 font-normal truncate group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
            {latestStory?.title || "Operations synced across workspace"}
          </span>
        </div>
      </div>

      {/* Right side: Stats & affordance */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
          <span>{metrics.totalOperationsToday} ops</span>
          <span>·</span>
          <span>{metrics.autonomyRatePercent}% auto-cleared</span>
          <span>·</span>
          <span>{metrics.timeSavedLabel} saved</span>
        </span>

        <button
          type="button"
          onPointerDown={handleOpenJournal}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400/90 group-hover:text-slate-900 dark:text-zinc-400 dark:group-hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <span>View Activity</span>
          <ArrowRight size={10.5} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
