/**
 * workspaceStagingEngine.js
 * 
 * Pillar 3: Human-in-the-Loop "Approval & Sandbox" Engine
 * 
 * Implements isolated sandbox execution state and GitHub Pull Request-style
 * visual diffing for multi-step agent workflows across Docs, Sheets, and Tasks.
 * 
 * Prevents silent state corruption by sandboxing all impactful agent mutations
 * until the human director reviews redlines, cherry-picks changes, and clicks Approve.
 */

import DiffMatchPatch from 'diff-match-patch';
import { mutateAndPropagate } from './universalContextGraph.js';
import * as docsCommandApi from './docsCommandApi.js';

const DiffTool = DiffMatchPatch.diff_match_patch || DiffMatchPatch;
const dmp = new DiffTool();

const STAGING_STORAGE_KEY = 'regaarder_staging_branches_v1';
let prSequenceCounter = 1;

// In-memory active branches cache
let stagingBranchesCache = null;
const stagingListeners = new Set();

const safeGetItem = (key, fallback) => {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn(`[StagingEngine] Failed to read ${key}:`, e);
    return fallback;
  }
};

const safeSetItem = (key, val) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`[StagingEngine] Failed to write ${key}:`, e);
  }
};

const notifyStagingListeners = () => {
  const branches = getActiveBranches();
  stagingListeners.forEach(fn => {
    try {
      fn(branches);
    } catch (e) {
      console.error('[StagingEngine] Listener error:', e);
    }
  });
};

const initializeStaging = () => {
  if (!stagingBranchesCache) {
    stagingBranchesCache = safeGetItem(STAGING_STORAGE_KEY, []);
    if (stagingBranchesCache.length > 0) {
      const maxPr = Math.max(...stagingBranchesCache.map(b => b.prNumber || 1), 0);
      prSequenceCounter = maxPr + 1;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. VISUAL REDLINE DIFF GENERATOR (DIFF-MATCH-PATCH)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes semantic, token-level visual redline diffs.
 * 
 * @param {string} beforeText  - Baseline original text.
 * @param {string} afterText   - Proposed modification.
 * @returns {Array<{ type: 'insert'|'delete'|'equal', text: string }>}
 */
export function computeVisualDiff(beforeText = '', afterText = '') {
  const str1 = String(beforeText || '');
  const str2 = String(afterText || '');

  const rawDiffs = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(rawDiffs);

  let addedChars = 0;
  let removedChars = 0;

  const chunks = rawDiffs.map(([op, text]) => {
    if (op === 1) {
      addedChars += text.length;
      return { type: 'insert', text };
    }
    if (op === -1) {
      removedChars += text.length;
      return { type: 'delete', text };
    }
    return { type: 'equal', text };
  });

  return {
    chunks,
    stats: {
      addedChars,
      removedChars,
      isModified: addedChars > 0 || removedChars > 0,
      totalDiffSegments: chunks.filter(c => c.type !== 'equal').length
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STAGING BRANCH & SANDBOX MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to staging branch lifecycle events.
 */
export function subscribeToStaging(listener) {
  stagingListeners.add(listener);
  initializeStaging();
  listener(getActiveBranches());
  return () => stagingListeners.delete(listener);
}

/**
 * Get all active, uncommitted staging branches awaiting human approval.
 */
export function getActiveBranches() {
  initializeStaging();
  return stagingBranchesCache.filter(b => b.status === 'pending_review');
}

/**
 * Get all staging branches (including committed and rejected).
 */
export function getAllBranches() {
  initializeStaging();
  return [...stagingBranchesCache];
}

/**
 * Get a specific staging branch by ID.
 */
export function getBranchById(branchId) {
  initializeStaging();
  return stagingBranchesCache.find(b => b.id === branchId) || null;
}

/**
 * Create a new isolated staging branch.
 */
export function createStagingBranch({
  branchId: customBranchId,
  title,
  description = '',
  agentId = 'relay_agent',
  sourceApp = 'relay',
  targetApps = ['compose']
}) {
  initializeStaging();

  const prNumber = prSequenceCounter++;
  const branchId = customBranchId || `pr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newBranch = {
    id: branchId,
    branchId,
    prNumber,
    title: title || `Agent Proposed PR #${prNumber}`,
    description,
    agentId,
    sourceApp,
    targetApps,
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    mutations: []
  };

  stagingBranchesCache.unshift(newBranch);
  safeSetItem(STAGING_STORAGE_KEY, stagingBranchesCache);
  notifyStagingListeners();

  return newBranch;
}

/**
 * Stage an isolated mutation into a branch.
 */
export function stageMutation({
  branchId,
  targetApp = 'compose',
  entityId = 'ent_doc_active',
  targetTitle = 'Active Document',
  toolName,
  params = {},
  beforeText = '',
  afterText = '',
  metadata = {}
}) {
  initializeStaging();

  let branch = stagingBranchesCache.find(b => b.id === branchId);
  if (!branch) {
    branch = createStagingBranch({
      title: `Agent Proposal: ${targetTitle}`,
      description: `Automated staged changes for ${targetTitle}`,
      targetApps: [targetApp]
    });
  }

  const { chunks, stats } = computeVisualDiff(beforeText, afterText);

  const mutation = {
    mutationId: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    targetApp,
    entityId,
    targetTitle,
    toolName,
    params,
    beforeText,
    afterText,
    diffChunks: chunks,
    stats,
    metadata,
    selected: true,
    stagedAt: new Date().toISOString()
  };

  branch.mutations.push(mutation);

  if (!branch.targetApps.includes(targetApp)) {
    branch.targetApps.push(targetApp);
  }

  safeSetItem(STAGING_STORAGE_KEY, stagingBranchesCache);
  notifyStagingListeners();

  return {
    success: true,
    branchId: branch.id,
    mutationId: mutation.mutationId,
    prNumber: branch.prNumber,
    targetApp: mutation.targetApp,
    mutation
  };
}

/**
 * Toggle cherry-pick selection of a staged mutation.
 */
export function toggleMutationSelection(branchId, mutationId, isSelected) {
  initializeStaging();

  const branch = stagingBranchesCache.find(b => b.id === branchId);
  if (!branch) return false;

  const mut = branch.mutations.find(m => m.mutationId === mutationId);
  if (mut) {
    mut.selected = typeof isSelected === 'boolean' ? isSelected : !mut.selected;
    safeSetItem(STAGING_STORAGE_KEY, stagingBranchesCache);
    notifyStagingListeners();
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ATOMIC HUMAN APPROVAL & COMMIT LOOP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Approve and atomically commit staged changes into the production workspace.
 * Supports cherry-picking specific mutation IDs.
 * 
 * @param {string} branchId - The branch to commit.
 * @param {Array<string>} [selectedMutationIds] - Optional cherry-pick IDs. If omitted, commits all selected.
 */
export async function approveAndCommitBranch(branchId, selectedMutationIds = null) {
  initializeStaging();

  const branch = stagingBranchesCache.find(b => b.id === branchId);
  if (!branch) {
    throw new Error(`Staging branch '${branchId}' not found.`);
  }

  if (branch.status !== 'pending_review') {
    throw new Error(`Staging branch '${branchId}' has already been ${branch.status}.`);
  }

  const mutationsToApply = branch.mutations.filter(m => {
    if (selectedMutationIds && Array.isArray(selectedMutationIds)) {
      return selectedMutationIds.includes(m.mutationId);
    }
    return m.selected !== false;
  });

  if (mutationsToApply.length === 0) {
    return {
      success: false,
      message: 'No mutations were selected for commit.',
      committedCount: 0
    };
  }

  const commitResults = [];

  for (const mut of mutationsToApply) {
    try {
      // 1. Compose Document Target
      if (mut.targetApp === 'compose') {
        if (mut.afterText) {
          docsCommandApi.replaceRange({
            targetText: mut.beforeText || '',
            replacementText: mut.afterText,
            replaceAll: !mut.beforeText
          });
        }
        commitResults.push({ mutationId: mut.mutationId, success: true, targetApp: 'compose' });
      } 
      // 2. Sheets Target
      else if (mut.targetApp === 'sheets') {
        if (typeof window !== 'undefined' && window.__REGAARDER_UPDATE_SHEET_CELLS__ && mut.params?.updates) {
          window.__REGAARDER_UPDATE_SHEET_CELLS__(mut.params.updates);
        }
        commitResults.push({ mutationId: mut.mutationId, success: true, targetApp: 'sheets' });
      }
      // 3. Tasks Target
      else if (mut.targetApp === 'tasks') {
        if (typeof window !== 'undefined' && window.__REGAARDER_ADD_TASK__ && mut.params) {
          window.__REGAARDER_ADD_TASK__(mut.params);
        }
        commitResults.push({ mutationId: mut.mutationId, success: true, targetApp: 'tasks' });
      }

      // Propagate into Universal Context Graph
      mutateAndPropagate(
        mut.entityId || 'ent_doc_active',
        {
          title: mut.targetTitle,
          excerpt: mut.afterText ? mut.afterText.slice(0, 160) : 'Staged PR committed',
          lastCommitBy: branch.agentId,
          prNumber: branch.prNumber
        },
        mut.targetApp,
        `Approved PR #${branch.prNumber}: ${branch.title}`
      );
    } catch (applyErr) {
      console.error(`[StagingEngine] Failed to apply mutation ${mut.mutationId}:`, applyErr);
      commitResults.push({ mutationId: mut.mutationId, success: false, error: applyErr.message });
    }
  }

  // Mark branch status as approved
  branch.status = 'approved';
  branch.committedAt = new Date().toISOString();
  branch.committedMutationIds = mutationsToApply.map(m => m.mutationId);

  safeSetItem(STAGING_STORAGE_KEY, stagingBranchesCache);
  notifyStagingListeners();

  return {
    success: true,
    branchId: branch.id,
    prNumber: branch.prNumber,
    committedCount: mutationsToApply.length,
    totalMutations: branch.mutations.length,
    results: commitResults
  };
}

/**
 * Safely reject a branch and discard the sandbox state without side effects.
 */
export function rejectBranch(branchId, reason = 'Rejected by Human Director') {
  initializeStaging();

  const branch = stagingBranchesCache.find(b => b.id === branchId);
  if (!branch) {
    throw new Error(`Staging branch '${branchId}' not found.`);
  }

  branch.status = 'rejected';
  branch.rejectedAt = new Date().toISOString();
  branch.rejectionReason = reason;

  safeSetItem(STAGING_STORAGE_KEY, stagingBranchesCache);
  notifyStagingListeners();

  return {
    success: true,
    branchId: branch.id,
    prNumber: branch.prNumber,
    status: 'rejected'
  };
}

export const getActiveStagedBranches = getActiveBranches;

/**
 * Reset staging branches for unit testing.
 */
export function resetStagingForTesting() {
  stagingBranchesCache = [];
  prSequenceCounter = 1;
  safeSetItem(STAGING_STORAGE_KEY, []);
  notifyStagingListeners();
}

