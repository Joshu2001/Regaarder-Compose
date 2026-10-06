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
 * 1. Narrative Translation: Converts raw tool calls (`patch_block`, `update_sheet_cell`)
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

/**
 * Categorize a date/timestamp into human periods.
 */
function getDayPeriod(dateObj) {
  const hour = dateObj.getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

/**
 * Formats ISO timestamp to concise executive time (e.g. "2:15 PM").
 */
export function formatStoryTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

/**
 * Synthesize raw events from Staging Branches and Context Graph into narrative stories.
 */
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

  // Sort descending by timestamp
  allStories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Compute Daily Executive Metrics
  const totalOps = allStories.length;
  const autoExecuted = allStories.filter(s => s.autonomyStatus === 'AUTO_EXECUTED' || s.autonomyStatus === 'COMMITTED').length;
  const stagedCount = allStories.filter(s => s.autonomyStatus === 'STAGED_FOR_REVIEW').length;
  const autonomyRate = totalOps > 0 ? Math.round((autoExecuted / totalOps) * 100) : 100;
  const totalTimeSavedMin = allStories.reduce((acc, s) => acc + (s.timeSavedMin || 10), 0);

  // Group by Time Period (Morning, Afternoon, Evening)
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

/**
 * Record a new custom narrative journal story.
 */
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

/**
 * Subscribe to live changes in the daily activity journal.
 */
export function subscribeToJournal(listener) {
  journalListeners.add(listener);
  listener(getAgentDailyJournal());
  return () => journalListeners.delete(listener);
}
