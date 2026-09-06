/**
 * actionPolicyEngine.js
 *
 * Pillar 4B (#4): Programmable Per-Action Autonomy & Guardrails Policy Engine
 *
 * Provides a declarative, fine-grained permission and autonomy layer operating per action,
 * not merely per user role.
 *
 * Core Capabilities:
 * 1. Declarative Action Policies: Rules defining auto-execution vs. mandatory staging PR routing.
 * 2. Quantitative & Numerical Thresholds: Enforces constraints such as maximum budget deltas (e.g. <= $500),
 *    maximum recipient counts, or allowed workspace directories.
 * 3. Protected Resource Invariants: Blocks autonomous edits to sensitive contracts or protected AST block IDs.
 * 4. Reactive Governance: Persists policies in localStorage and broadcasts updates to MCP and UI inspectors.
 */

export const AUTONOMY_DECISION = {
  AUTO_EXECUTE: 'AUTO_EXECUTE',
  REQUIRE_STAGING_PR: 'REQUIRE_STAGING_PR',
  DENY: 'DENY'
};

export const POLICY_SEVERITY = {
  STRICT: 'STRICT',
  ADVISORY: 'ADVISORY'
};

const STORAGE_KEY_POLICIES = 'regaarder_action_policies_v1';
const policyListeners = new Set();
let policiesCache = null;

export const DEFAULT_POLICIES = [
  {
    id: 'pol_budget_threshold',
    name: 'Monetary Delta Autonomy Limit ($500)',
    description: 'Autonomous financial model mutations are auto-executed if the net dollar change is <= $500. Changes exceeding $500 must be staged into a human review PR.',
    actionPattern: 'sheets:*|update_sheet_cell|patch_matrix_cells',
    category: 'finance',
    severity: POLICY_SEVERITY.STRICT,
    enabled: true,
    rules: {
      type: 'numeric_threshold',
      field: 'deltaAmount',
      maxAllowedAuto: 500,
      currency: 'USD'
    },
    defaultDecision: AUTONOMY_DECISION.REQUIRE_STAGING_PR
  },
  {
    id: 'pol_destructive_guard',
    name: 'Destructive Action Quarantine',
    description: 'Any action matching delete, clear, or reset patterns is barred from silent execution and requires a staged PR or director confirmation.',
    actionPattern: 'delete_*|clear_*|remove_*|reset_*|drop_*',
    category: 'safety',
    severity: POLICY_SEVERITY.STRICT,
    enabled: true,
    rules: {
      type: 'destructive_check'
    },
    defaultDecision: AUTONOMY_DECISION.REQUIRE_STAGING_PR
  },
  {
    id: 'pol_protected_clause',
    name: 'Legal & Governance Protected Clauses',
    description: 'Documents containing designated protected legal clauses (e.g. blk_clause_4 or SOC2 data sovereignty) cannot be overwritten without staging review.',
    actionPattern: 'patch_block|replace_selection|set_full_content',
    category: 'legal',
    severity: POLICY_SEVERITY.STRICT,
    enabled: true,
    rules: {
      type: 'protected_blocks',
      protectedBlockIds: ['blk_clause_4', 'blk_sec_governance_p4', 'blk_seed_governance_p4']
    },
    defaultDecision: AUTONOMY_DECISION.REQUIRE_STAGING_PR
  },
  {
    id: 'pol_communication_throttle',
    name: 'Mass Outreach Recipient Cap',
    description: 'Any external message, email, or meeting dispatch targeting more than 5 external recipients requires explicit human sign-off.',
    actionPattern: 'schedule:*|email:*|notify_*|commit_scheduled_event',
    category: 'communication',
    severity: POLICY_SEVERITY.STRICT,
    enabled: true,
    rules: {
      type: 'numeric_threshold',
      field: 'recipientCount',
      maxAllowedAuto: 5
    },
    defaultDecision: AUTONOMY_DECISION.REQUIRE_STAGING_PR
  }
];

function safeStorageGet(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[ActionPolicyEngine] Read failed for ${key}:`, e);
    return fallback;
  }
}

function safeStorageSet(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[ActionPolicyEngine] Write failed for ${key}:`, e);
  }
}

function initializePolicies() {
  if (policiesCache) return;
  const stored = safeStorageGet(STORAGE_KEY_POLICIES, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    policiesCache = stored;
  } else {
    policiesCache = [...DEFAULT_POLICIES];
    safeStorageSet(STORAGE_KEY_POLICIES, policiesCache);
  }
}

function notifyPolicySubscribers() {
  const current = getActivePolicies();
  policyListeners.forEach(listener => {
    try {
      listener(current);
    } catch (err) {
      console.error('[ActionPolicyEngine] Listener notification error:', err);
    }
  });
}

/**
 * Subscribe to policy changes.
 */
export function subscribeToPolicies(listener) {
  initializePolicies();
  policyListeners.add(listener);
  listener(getActivePolicies());
  return () => policyListeners.delete(listener);
}

/**
 * Returns all active policies.
 */
export function getActivePolicies() {
  initializePolicies();
  return [...policiesCache];
}

/**
 * Add or update a policy.
 */
export function savePolicy(policy) {
  initializePolicies();
  const existingIdx = policiesCache.findIndex(p => p.id === policy.id);
  if (existingIdx >= 0) {
    policiesCache[existingIdx] = { ...policiesCache[existingIdx], ...policy, updatedAt: new Date().toISOString() };
  } else {
    policiesCache.push({
      ...policy,
      id: policy.id || `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  safeStorageSet(STORAGE_KEY_POLICIES, policiesCache);
  notifyPolicySubscribers();
  return policy;
}

/**
 * Delete a policy by ID.
 */
export function deletePolicy(policyId) {
  initializePolicies();
  policiesCache = policiesCache.filter(p => p.id !== policyId);
  safeStorageSet(STORAGE_KEY_POLICIES, policiesCache);
  notifyPolicySubscribers();
  return true;
}

/**
 * Reset policies to system defaults.
 */
export function resetPoliciesToDefault() {
  policiesCache = [...DEFAULT_POLICIES];
  safeStorageSet(STORAGE_KEY_POLICIES, policiesCache);
  notifyPolicySubscribers();
  return policiesCache;
}

/**
 * Tests if a toolName matches a glob pattern (e.g. "sheets:*" or "delete_*|clear_*").
 */
function matchesActionPattern(toolName, pattern) {
  if (!pattern || pattern === '*') return true;
  const parts = pattern.split('|').map(s => s.trim());
  for (const part of parts) {
    if (part === toolName) return true;
    if (part.endsWith('*')) {
      const prefix = part.slice(0, -1);
      if (toolName.startsWith(prefix)) return true;
    }
    if (part.startsWith('sheets:') && (toolName.includes('sheet') || toolName.includes('matrix') || toolName.includes('cell'))) {
      return true;
    }
    if (part.startsWith('schedule:') && (toolName.includes('schedule') || toolName.includes('meeting'))) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts a numeric change from parameter inputs (e.g. financial cell updates).
 */
function extractNumericDelta(params = {}) {
  if (typeof params.deltaAmount === 'number') return Math.abs(params.deltaAmount);
  if (typeof params.amount === 'number') return Math.abs(params.amount);
  
  // Check updates array for spreadsheet cells
  if (Array.isArray(params.updates)) {
    let totalDelta = 0;
    for (const update of params.updates) {
      const valStr = String(update.value || update.val || '').replace(/[^0-9.-]+/g, '');
      const num = parseFloat(valStr);
      if (!isNaN(num)) totalDelta += Math.abs(num);
    }
    if (totalDelta > 0) return totalDelta;
  }

  // Check patches array
  if (Array.isArray(params.patches)) {
    let totalDelta = 0;
    for (const patch of params.patches) {
      const valStr = String(patch.value || '').replace(/[^0-9.-]+/g, '');
      const num = parseFloat(valStr);
      if (!isNaN(num)) totalDelta += Math.abs(num);
    }
    if (totalDelta > 0) return totalDelta;
  }

  // Check single cell update
  if (params.value !== undefined) {
    const valStr = String(params.value).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(valStr);
    if (!isNaN(num)) return Math.abs(num);
  }

  return 0;
}

/**
 * Evaluates an action against all active policies to decide autonomy tier.
 *
 * @param {string} toolName - Name of the MCP or workspace tool.
 * @param {object} params - Invocation arguments.
 * @param {object} context - Execution context (user, source app, staged flag).
 * @returns {object} { decision, matchedPolicies, requiresStaging, reason, metrics }
 */
export function evaluateActionAutonomy(toolName, params = {}, context = {}) {
  initializePolicies();

  const matchedPolicies = [];
  let finalDecision = AUTONOMY_DECISION.AUTO_EXECUTE;
  let primaryReason = 'Action cleared under default autonomous execution policy.';
  let requiresStaging = false;

  const numericDelta = extractNumericDelta(params);
  const targetBlockId = params.blockId || params.block?.id || null;
  const recipientCount = Array.isArray(params.participants) ? params.participants.length : (Array.isArray(params.recipients) ? params.recipients.length : 1);

  const activeEnabled = policiesCache.filter(p => p.enabled !== false);

  for (const policy of activeEnabled) {
    if (!matchesActionPattern(toolName, policy.actionPattern)) {
      continue;
    }

    // Rule 1: Numeric threshold (e.g. Budget delta <= $500)
    if (policy.rules?.type === 'numeric_threshold') {
      const maxAllowed = policy.rules.maxAllowedAuto || 500;
      const testedVal = policy.rules.field === 'recipientCount' ? recipientCount : numericDelta;

      if (testedVal > maxAllowed) {
        matchedPolicies.push({
          policyId: policy.id,
          name: policy.name,
          decision: AUTONOMY_DECISION.REQUIRE_STAGING_PR,
          reason: `Value ${testedVal} exceeds auto-execution limit of ${maxAllowed} (${policy.rules.currency || 'items'}).`
        });
        finalDecision = AUTONOMY_DECISION.REQUIRE_STAGING_PR;
        requiresStaging = true;
        primaryReason = `Policy '${policy.name}' intercepted execution: amount ($${testedVal}) exceeds autonomous threshold ($${maxAllowed}).`;
      }
    }

    // Rule 2: Destructive action quarantine
    else if (policy.rules?.type === 'destructive_check') {
      const isDestructive = /^(delete|clear|remove|reset|drop)_/i.test(toolName);
      if (isDestructive && !context.confirmed) {
        matchedPolicies.push({
          policyId: policy.id,
          name: policy.name,
          decision: AUTONOMY_DECISION.REQUIRE_STAGING_PR,
          reason: `Destructive action '${toolName}' quarantined into sandbox staging.`
        });
        finalDecision = AUTONOMY_DECISION.REQUIRE_STAGING_PR;
        requiresStaging = true;
        primaryReason = `Destructive action '${toolName}' quarantined under policy '${policy.name}'.`;
      }
    }

    // Rule 3: Protected AST blocks & clauses
    else if (policy.rules?.type === 'protected_blocks') {
      const protectedIds = policy.rules.protectedBlockIds || [];
      const touchesProtected = targetBlockId && protectedIds.includes(targetBlockId);
      const textMatchesProtected = (params.text || params.targetText || '').includes('clause_4') || (params.text || params.targetText || '').includes('Data Sovereignty');

      if (touchesProtected || textMatchesProtected) {
        matchedPolicies.push({
          policyId: policy.id,
          name: policy.name,
          decision: AUTONOMY_DECISION.REQUIRE_STAGING_PR,
          reason: `Mutation intersects protected block [${targetBlockId || 'protected_clause'}].`
        });
        finalDecision = AUTONOMY_DECISION.REQUIRE_STAGING_PR;
        requiresStaging = true;
        primaryReason = `Protected invariant violated: changes touch protected clause [${targetBlockId || 'clause_4'}].`;
      }
    }
  }

  return {
    decision: finalDecision,
    requiresStaging,
    allowed: finalDecision !== AUTONOMY_DECISION.DENY,
    matchedPolicies,
    reason: primaryReason,
    metrics: {
      numericDelta,
      targetBlockId,
      recipientCount,
      evaluatedPoliciesCount: activeEnabled.length
    }
  };
}
