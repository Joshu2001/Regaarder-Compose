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

export const AUTONOMY_TIERS = {
  DRAFT_ONLY: {
    id: 'DRAFT_ONLY',
    label: 'Draft Only',
    shortLabel: 'Drafts only',
    description: 'All tool mutations and updates must be staged into an isolated PR sandbox for manual director sign-off.',
    defaultThreshold: 0,
    level: 1
  },
  DEFAULT_PERMISSIONS: {
    id: 'DEFAULT_PERMISSIONS',
    label: 'Default Permissions',
    shortLabel: 'Default permissions',
    description: 'Safe edits & reading auto-execute. Mutations over budget limit or destructive commands require staging review.',
    defaultThreshold: 500,
    level: 2
  },
  HIGH_AUTONOMY: {
    id: 'HIGH_AUTONOMY',
    label: 'High Autonomy',
    shortLabel: 'Auto-exec < $2.5k',
    description: 'Expands autonomous clearance up to $2,500 budget delta. Non-destructive actions execute directly.',
    defaultThreshold: 2500,
    level: 3
  },
  FULL_AUTONOMOUS: {
    id: 'FULL_AUTONOMOUS',
    label: 'Full Autonomous',
    shortLabel: 'Unrestricted',
    description: 'Direct autonomous execution across all tools and mutations without routing to staging.',
    defaultThreshold: Infinity,
    level: 4
  }
};

const STORAGE_KEY_POLICIES = 'regaarder_action_policies_v1';
const STORAGE_KEY_ACTIVE_TIER = 'regaarder_autonomy_tier_v1';
const STORAGE_KEY_CUSTOM_THRESHOLD = 'regaarder_autonomy_threshold_v1';
const policyListeners = new Set();
const tierListeners = new Set();
let policiesCache = null;
let currentTierCache = null;
let customThresholdCache = null;

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

function initializeTier() {
  if (currentTierCache) return;
  const storedTier = safeStorageGet(STORAGE_KEY_ACTIVE_TIER, 'DEFAULT_PERMISSIONS');
  currentTierCache = AUTONOMY_TIERS[storedTier] ? storedTier : 'DEFAULT_PERMISSIONS';
  const storedThreshold = safeStorageGet(STORAGE_KEY_CUSTOM_THRESHOLD, null);
  customThresholdCache = storedThreshold !== null ? Number(storedThreshold) : null;
}

function notifyTierSubscribers() {
  const current = getCurrentAutonomyTier();
  tierListeners.forEach(listener => {
    try {
      listener(current);
    } catch (err) {
      console.error('[ActionPolicyEngine] Tier listener notification error:', err);
    }
  });
}

/**
 * Returns current autonomy tier object with active threshold.
 */
export function getCurrentAutonomyTier() {
  initializeTier();
  const tierDef = AUTONOMY_TIERS[currentTierCache] || AUTONOMY_TIERS.DEFAULT_PERMISSIONS;
  const threshold = customThresholdCache !== null ? customThresholdCache : tierDef.defaultThreshold;
  return {
    ...tierDef,
    activeThreshold: threshold
  };
}

/**
 * Update current autonomy tier and optional custom threshold.
 */
export function setAutonomyTier(tierKey, customThreshold = null) {
  initializeTier();
  if (!AUTONOMY_TIERS[tierKey]) {
    tierKey = 'DEFAULT_PERMISSIONS';
  }
  currentTierCache = tierKey;
  safeStorageSet(STORAGE_KEY_ACTIVE_TIER, tierKey);

  if (customThreshold !== null && !isNaN(customThreshold)) {
    customThresholdCache = Math.max(0, Number(customThreshold));
    safeStorageSet(STORAGE_KEY_CUSTOM_THRESHOLD, customThresholdCache);
  } else {
    customThresholdCache = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_CUSTOM_THRESHOLD);
    }
  }

  notifyTierSubscribers();
  return getCurrentAutonomyTier();
}

/**
 * Subscribe to autonomy tier changes.
 */
export function subscribeToAutonomyTier(listener) {
  initializeTier();
  tierListeners.add(listener);
  listener(getCurrentAutonomyTier());
  return () => tierListeners.delete(listener);
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
  const currentTier = getCurrentAutonomyTier();

  // Tier 1 Override: DRAFT_ONLY routes all mutating actions to Staging PR
  const isReadAction = /^(get_|read_|query_|list_|fetch_|search_|validate_|solve_)/i.test(toolName);
  if (currentTier.id === 'DRAFT_ONLY' && !isReadAction) {
    return {
      decision: AUTONOMY_DECISION.REQUIRE_STAGING_PR,
      requiresStaging: true,
      allowed: true,
      matchedPolicies: [{
        policyId: 'tier_draft_only',
        name: 'Draft Only Policy',
        decision: AUTONOMY_DECISION.REQUIRE_STAGING_PR,
        reason: 'Workspace is locked in Draft Only mode. All mutations require director review.'
      }],
      reason: 'Draft Only mode: All mutations must be reviewed and signed off in Staging Sandbox.',
      metrics: {
        numericDelta: extractNumericDelta(params),
        targetBlockId: params.blockId || params.block?.id || null,
        recipientCount: 1,
        activeTier: currentTier.id
      }
    };
  }

  // Tier 4 Override: FULL_AUTONOMOUS bypasses staging checks unless explicitly denied
  if (currentTier.id === 'FULL_AUTONOMOUS') {
    return {
      decision: AUTONOMY_DECISION.AUTO_EXECUTE,
      requiresStaging: false,
      allowed: true,
      matchedPolicies: [],
      reason: 'Action cleared under Full Autonomous permissions tier.',
      metrics: {
        numericDelta: extractNumericDelta(params),
        targetBlockId: params.blockId || params.block?.id || null,
        recipientCount: 1,
        activeTier: currentTier.id
      }
    };
  }

  const matchedPolicies = [];
  let finalDecision = AUTONOMY_DECISION.AUTO_EXECUTE;
  let primaryReason = `Action cleared under ${currentTier.label} tier.`;
  let requiresStaging = false;

  const numericDelta = extractNumericDelta(params);
  const targetBlockId = params.blockId || params.block?.id || null;
  const recipientCount = Array.isArray(params.participants) ? params.participants.length : (Array.isArray(params.recipients) ? params.recipients.length : 1);

  const activeEnabled = policiesCache.filter(p => p.enabled !== false);

  for (const policy of activeEnabled) {
    if (!matchesActionPattern(toolName, policy.actionPattern)) {
      continue;
    }

    // Rule 1: Numeric threshold (incorporate currentTier.activeThreshold if set)
    if (policy.rules?.type === 'numeric_threshold') {
      const tierThreshold = currentTier.activeThreshold !== undefined ? currentTier.activeThreshold : null;
      const maxAllowed = (tierThreshold !== null && policy.category === 'finance') ? tierThreshold : (policy.rules.maxAllowedAuto || 500);
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
