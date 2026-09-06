# Agent Activity & Daily Narrative Journal (Archived Feature)

This document preserves the complete source code, architecture, and wiring for the **Agent Activity & Daily Narrative Journal** feature. It was archived so the team can launch immediately without adding non-launch-critical surface area.

---

## 1. Overview & Architecture

The Agent Activity feature provides:
1. **Landing Card / Ticker (`LandingAgentActivityCard.jsx`)**: An ultra-compact, Apple-styled status row embedded directly on the homepage showing operations executed today, autonomy clearance %, time saved, and the latest narrative headline with a glowing status dot.
2. **Central Full-Stage Activity Canvas (`LandingAgentActivityView.jsx`)**: When tapping "View Activity", the central product grid swaps in-place into an executive-grade Linear/Slack-style timeline with filter tabs (*All Activity*, *Auto-Executed*, *Needs Review*), causal attribution ("Why the agent acted"), metrics, and direct links to review Staged PR sandboxes.
3. **Slide-Over Modal (`AgentActivityJournalModal.jsx`)**: A slide-over sheet accessible from anywhere across the workspace via `window.__REGAARDER_OPEN_AGENT_JOURNAL__()`.
4. **Daily Narrative Synthesizer (`agentJournalService.js`)**: Converts low-level engine mutations and context graph propagations into human-readable business headlines with metric roll-ups.

---

## 2. Source Code

### `src/services/agentJournalService.js`
```javascript
/**
 * agentJournalService.js
 *
 * Executive Agent Activity Journal & Daily Narrative Synthesizer
 *
 * Transforms low-level execution logs (AnalyticsRegistry), cross-workspace
 * propagation events (universalContextGraph), and staging sandboxes (workspaceStagingEngine)
 * into a human-readable, executive-facing daily storyline ("Here's what agents did today and why").
 *
 * Core Capabilities:
 * 1. Narrative Translation: Converts raw tool calls (patch_block, update_sheet_cell)
 *    into punchy business accomplishment headlines.
 * 2. Causal Attribution ("The Why"): Articulates why the agent acted
 *    (User intent, cross-doc propagation, scheduled rule, or constraint safeguard).
 * 3. Daily Roll-Up Metrics:
 *    - Total agent operations completed today
 *    - Autonomy clearance rate (% auto-executed vs. staged into PRs)
 *    - Estimated executive minutes saved
 *    - Financial & metric values reconciled
 * 4. Chronological Storyline Buckets: Groups activities by Morning, Afternoon, Evening.
 */

import { getPropagationHistory } from './universalContextGraph.js';
import { getAllBranches } from './workspaceStagingEngine.js';

const STORAGE_KEY_JOURNAL = 'regaarder_agent_journal_v1';
const journalListeners = new Set();

/**
 * Built-in baseline curated journal events to guarantee an executive narrative
 * experience even on first load before live agent executions accumulate.
 */
const DEFAULT_JOURNAL_STORIES = [
  {
    id: 'story_rev_reconcile',
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(), // ~38 mins ago
    period: 'Afternoon',
    title: 'Synchronized Datacenter GPU Revenue to $12.4B across Strategy Memo',
    agentName: 'Elena Agent',
    agentRole: 'Financial Modeling Specialist',
    sourceApp: 'sheets',
    targetApps: ['compose', 'memory'],
    autonomyStatus: 'AUTO_EXECUTED',
    autonomyLabel: 'Auto-Executed (Budget Delta < $500)',
    clearanceTier: 'DEFAULT_PERMISSIONS',
    trigger: 'Cross-Workspace Propagation',
    why: 'Quarterly financial sheet cell C4 was modified; downstream executive memo contained an outdated metric ($11.8B). Automatically aligned figures to maintain epistemic truth.',
    impact: 'Updated 2 downstream documents with zero manual re-typing.',
    timeSavedMin: 15,
    metrics: { monetaryFigure: '$12.4B' },
    stagedBranchId: null
  },
  {
    id: 'story_clause_quarantine',
    timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(), // ~2 hours ago
    period: 'Morning',
    title: 'Quarantined Modification to Arbitration Clause 4 into Sandbox PR #104',
    agentName: 'Alex Agent',
    agentRole: 'Governance & Systems Orchestrator',
    sourceApp: 'compose',
    targetApps: ['compose'],
    autonomyStatus: 'STAGED_FOR_REVIEW',
    autonomyLabel: 'Diverted to Staging PR (Protected Clause Invariant)',
    clearanceTier: 'DEFAULT_PERMISSIONS',
    trigger: 'Invariant Policy Guardrail',
    why: 'Autonomous drafting pass suggested rewording legal terms. Protected clause rule pol_protected_clause intercepted changes to preserve arbitration integrity.',
    impact: 'Protected legal sovereignty while presenting redlines for 1-click director sign-off.',
    timeSavedMin: 20,
    metrics: {},
    stagedBranchId: 'pr_sample_104'
  },
  {
    id: 'story_intent_schedule',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // ~4 hours ago
    period: 'Morning',
    title: 'Negotiated 45-Min Bilateral Strategy Sync with Elena Agent',
    agentName: 'Relay Executive Orchestrator',
    agentRole: 'Autonomous Calendar Negotiator',
    sourceApp: 'schedule',
    targetApps: ['schedule', 'room'],
    autonomyStatus: 'AUTO_EXECUTED',
    autonomyLabel: 'Auto-Executed (Zero Conflict Constraint)',
    clearanceTier: 'DEFAULT_PERMISSIONS',
    trigger: 'Intent Scheduler Engine',
    why: 'Colloquial prompt "Schedule board prep sync" solved via mathematical CSP solver, aligning participants at optimal circadian energy window (10:15 AM).',
    impact: 'Eliminated 4 back-and-forth scheduling emails.',
    timeSavedMin: 12,
    metrics: { duration: '45 mins' },
    stagedBranchId: null
  }
];

function safeStorageGet(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function getDayPeriod(dateObj) {
  const hour = dateObj.getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export function formatStoryTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

export function getAgentDailyJournal() {
  const customStories = safeStorageGet(STORAGE_KEY_JOURNAL, []);
  const allStories = [...customStories];

  // Ingest from live Staging Branches
  try {
    const stagingBranches = getAllBranches();
    stagingBranches.forEach(branch => {
      if (!allStories.some(s => s.id === `st_branch_${branch.id}`)) {
        const createdDate = new Date(branch.createdAt || Date.now());
        const isCommitted = branch.status === 'committed';
        const isRejected = branch.status === 'rejected';

        allStories.push({
          id: `st_branch_${branch.id}`,
          timestamp: branch.createdAt || new Date().toISOString(),
          period: getDayPeriod(createdDate),
          title: branch.title || `Staged PR #${branch.prNumber || 1} for ${branch.sourceApp} Review`,
          agentName: branch.agentId ? branch.agentId.replace('_', ' ').toUpperCase() : 'Relay Agent',
          agentRole: 'Autonomous Workspace Specialist',
          sourceApp: branch.sourceApp || 'relay',
          targetApps: branch.targetApps || ['compose'],
          autonomyStatus: isCommitted ? 'COMMITTED' : isRejected ? 'REJECTED' : 'STAGED_FOR_REVIEW',
          autonomyLabel: isCommitted ? 'Director Approved & Merged' : isRejected ? 'Declined by Director' : 'Awaiting Review (Staging Sandbox)',
          clearanceTier: 'DEFAULT_PERMISSIONS',
          trigger: branch.origin === 'room_observer' ? 'Real-Time In-Meeting Consensus' : 'Human Intent Execution',
          why: branch.description || `Modifications staged with ${branch.mutations?.length || 1} changes to prevent state pollution.`,
          impact: `${branch.mutations?.length || 1} atomic updates isolated from production.`,
          timeSavedMin: Math.max(10, (branch.mutations?.length || 1) * 8),
          metrics: { mutationsCount: branch.mutations?.length || 1 },
          stagedBranchId: branch.id
        });
      }
    });
  } catch (err) {
    console.warn('[AgentJournalService] Failed to ingest staging branches:', err);
  }

  // Ingest from Propagation History
  try {
    const propagations = getPropagationHistory();
    propagations.forEach(prop => {
      if (!allStories.some(s => s.id === `st_prop_${prop.mutationId}`)) {
        const propDate = new Date(prop.timestamp || Date.now());
        allStories.push({
          id: `st_prop_${prop.mutationId}`,
          timestamp: prop.timestamp || new Date().toISOString(),
          period: getDayPeriod(propDate),
          title: `Propagated updates from "${prop.sourceTitle}" to ${prop.impactedCount} linked entities`,
          agentName: 'Universal Context Bus',
          agentRole: 'Reactive Knowledge Engine',
          sourceApp: 'memory',
          targetApps: ['compose', 'sheets'],
          autonomyStatus: 'AUTO_EXECUTED',
          autonomyLabel: 'Reactive Graph Auto-Sync',
          clearanceTier: 'DEFAULT_PERMISSIONS',
          trigger: prop.reason || 'Cross-Workspace Mutation Propagation',
          why: `Graph traversal identified downstream entities depending on ${prop.sourceTitle}. Deliberately synced state without human prompt.`,
          impact: `Synchronized ${prop.impactedCount} dependent artifacts.`,
          timeSavedMin: 15,
          metrics: { impactedCount: prop.impactedCount },
          stagedBranchId: null
        });
      }
    });
  } catch (err) {
    console.warn('[AgentJournalService] Failed to ingest propagation history:', err);
  }

  // Merge default benchmark stories if sparse
  DEFAULT_JOURNAL_STORIES.forEach(ds => {
    if (!allStories.some(s => s.id === ds.id)) {
      allStories.push(ds);
    }
  });

  allStories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalOps = allStories.length;
  const autoExecuted = allStories.filter(s => s.autonomyStatus === 'AUTO_EXECUTED' || s.autonomyStatus === 'COMMITTED').length;
  const stagedCount = allStories.filter(s => s.autonomyStatus === 'STAGED_FOR_REVIEW').length;
  const autonomyRate = totalOps > 0 ? Math.round((autoExecuted / totalOps) * 100) : 100;
  const totalTimeSavedMin = allStories.reduce((acc, s) => acc + (s.timeSavedMin || 10), 0);

  const groupedPeriods = {
    Evening: allStories.filter(s => s.period === 'Evening'),
    Afternoon: allStories.filter(s => s.period === 'Afternoon'),
    Morning: allStories.filter(s => s.period === 'Morning')
  };

  return {
    metrics: {
      totalOperationsToday: totalOps,
      autoExecutedCount: autoExecuted,
      stagedCount: stagedCount,
      autonomyRatePercent: autonomyRate,
      estimatedTimeSavedMinutes: totalTimeSavedMin,
      timeSavedLabel: totalTimeSavedMin >= 60 ? `${(totalTimeSavedMin / 60).toFixed(1)} hrs` : `${totalTimeSavedMin} mins`
    },
    stories: allStories,
    groupedPeriods
  };
}

export function recordJournalStory(story) {
  const custom = safeStorageGet(STORAGE_KEY_JOURNAL, []);
  const newStory = {
    ...story,
    id: story.id || `story_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: story.timestamp || new Date().toISOString(),
    period: getDayPeriod(new Date(story.timestamp || Date.now()))
  };
  custom.unshift(newStory);
  safeStorageSet(STORAGE_KEY_JOURNAL, custom.slice(0, 100));
  notifyJournalSubscribers();
  return newStory;
}

function notifyJournalSubscribers() {
  const data = getAgentDailyJournal();
  journalListeners.forEach(listener => {
    try {
      listener(data);
    } catch (e) {
      console.error('[AgentJournalService] Listener notification error:', e);
    }
  });
}

export function subscribeToJournal(listener) {
  journalListeners.add(listener);
  listener(getAgentDailyJournal());
  return () => journalListeners.delete(listener);
}
```

---

### `src/components/LandingAgentActivityCard.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getAgentDailyJournal, subscribeToJournal } from '../services/agentJournalService.js';

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
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
```

---

### `src/components/LandingAgentActivityView.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { GitPullRequest, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { 
  getAgentDailyJournal, 
  subscribeToJournal, 
  formatStoryTime 
} from '../services/agentJournalService.js';

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

                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                  {story.title}
                </h3>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.04] space-y-1">
                  <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Why the agent acted
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {story.why}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-1 text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Trigger: <strong className="font-medium text-slate-600 dark:text-zinc-400">{story.trigger}</strong>
                  </span>

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
```

---

### `src/components/autonomy/AgentActivityJournalModal.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { X, GitPullRequest } from 'lucide-react';
import { 
  getAgentDailyJournal, 
  subscribeToJournal, 
  formatStoryTime 
} from '../../services/agentJournalService.js';

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
      <div 
        className="flex-1 bg-black/25 backdrop-blur-[2px] cursor-pointer transition-opacity" 
        onClick={onClose} 
      />

      <div 
        data-popover="agent-journal-modal"
        className="w-full max-w-[490px] bg-[#fafbfc] dark:bg-[#161618] border-l border-slate-200/70 dark:border-white/[0.06] h-full shadow-[-16px_0_48px_rgba(15,23,42,0.12)] dark:shadow-[-16px_0_48px_rgba(0,0,0,0.6)] flex flex-col animate-in slide-in-from-right duration-200 select-none relative z-10"
      >
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

          <div className="mt-4 py-2.5 px-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] grid grid-cols-3 divide-x divide-slate-200/60 dark:divide-white/[0.06]">
            <div className="pr-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Operations
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block tracking-tight">
                {metrics.totalOperationsToday}
              </span>
            </div>
            <div className="px-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Clearance
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block tracking-tight">
                {metrics.autonomyRatePercent}%
              </span>
            </div>
            <div className="pl-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Time Saved
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block tracking-tight">
                {metrics.timeSavedLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin-scrollbar p-6 space-y-3">
          {filteredStories.map((story) => (
            <div 
              key={story.id}
              className="p-4 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200/50 dark:border-white/[0.04] shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  {story.agentName}
                </span>
                <span className="text-[10.5px] font-mono text-slate-400 dark:text-zinc-500">
                  {formatStoryTime(story.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                {story.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                {story.why}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. How to Re-enable in the Future

1. **In `src/RegaarderComposeLanding.jsx`**:
   - Re-import `LandingAgentActivityCard` and `LandingAgentActivityView`.
   - Re-insert `<LandingAgentActivityCard onOpenJournal={() => setLandingViewMode('activity')} />` right above `LandingRecentWorkStrip`.
   - Wrap the main stage in `landingViewMode === 'activity' ? <LandingAgentActivityView /> : <ProductsLauncherGrid />`.
2. **In `src/App.jsx`**:
   - Mount `<AgentActivityJournalModal isOpen={isAgentJournalOpen} onClose={() => setIsAgentJournalOpen(false)} />`.
   - Connect `window.__REGAARDER_OPEN_AGENT_JOURNAL__ = () => setIsAgentJournalOpen(true);`.
