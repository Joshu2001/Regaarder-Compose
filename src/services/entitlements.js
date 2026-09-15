/**
 * Regaarder Centralized Entitlement & Pricing Engine
 * Single source of truth for workspace capabilities, tier limits, and pricing metadata.
 */

export const PLAN_IDS = {
  FREE: 'free',
  PRO_ANNUAL: 'pro_annual',      // Primary consumer offer (\/yr -> \/mo)
  PRO_MONTHLY: 'pro_monthly',    // Secondary recurring option (\/mo)
  PRO_THREE_YEAR: 'pro_3year',   // Upfront early-adopter deal (\ one-time)
  FOUNDER_LIFETIME: 'founder_lifetime', // Upfront launch offer (\ one-time)
  TEAM: 'team',                  // \/user/mo annual or \/user/mo monthly
  ENTERPRISE: 'enterprise',      // Custom
};

export const PLANS = {
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: 'Free',
    headline: 'Everyday Productivity',
    description: 'Unlimited local documents, core office creation tools, and essential workspace assistance.',
    priceDisplay: '$0',
    billingPeriod: 'forever',
    badge: null,
    isPrimary: false,
    ctaText: 'Current Plan',
  },
  [PLAN_IDS.PRO_ANNUAL]: {
    id: PLAN_IDS.PRO_ANNUAL,
    name: 'Pro Annual',
    headline: 'Your Intelligent Work Partner',
    description: 'Turn your workspace into an intelligent collaborator with deep reasoning and automated workflows.',
    priceDisplay: '$10',
    priceSubtext: 'billed annually at $120/year',
    billingPeriod: '/ month',
    rawAnnualTotal: 120,
    badge: 'Recommended • Best Value',
    isPrimary: true,
    ctaText: 'Upgrade to Pro Annual',
  },
  [PLAN_IDS.PRO_MONTHLY]: {
    id: PLAN_IDS.PRO_MONTHLY,
    name: 'Pro Monthly',
    headline: 'Flexible Intelligence',
    description: 'Full Pro intelligence billed month-to-month with complete freedom to cancel anytime.',
    priceDisplay: '$15',
    priceSubtext: 'billed monthly',
    billingPeriod: '/ month',
    badge: null,
    isPrimary: false,
    ctaText: 'Upgrade to Pro Monthly',
  },
  [PLAN_IDS.PRO_THREE_YEAR]: {
    id: PLAN_IDS.PRO_THREE_YEAR,
    name: 'Founder 3-Year',
    headline: '3 Years of Pro Intelligence',
    description: 'Lock in 36 months of full Pro capabilities at an upfront rate of ~$6.92/month.',
    priceDisplay: '$249',
    priceSubtext: 'one-time payment (~$6.92/mo)',
    billingPeriod: 'one-time',
    badge: 'Save 45%',
    isPrimary: false,
    ctaText: 'Get 3-Year Access',
  },
  [PLAN_IDS.FOUNDER_LIFETIME]: {
    id: PLAN_IDS.FOUNDER_LIFETIME,
    name: 'Founder Lifetime',
    headline: 'Lifetime Launch Edition',
    description: 'Lifetime Pro access with Founder badge, priority compute, and early preview builds.',
    priceDisplay: '$499',
    priceSubtext: 'one-time payment • limited launch offer',
    billingPeriod: 'one-time',
    badge: 'Founder Edition',
    isPrimary: false,
    ctaText: 'Claim Lifetime Access',
  },
  [PLAN_IDS.TEAM]: {
    id: PLAN_IDS.TEAM,
    name: 'Team & Org',
    headline: 'Collaborative Team Intelligence',
    description: 'Shared Memora context, team agents, shared workspaces, and administrative governance.',
    priceDisplay: '$20',
    priceSubtext: 'per user / month (billed annually, or $25 monthly)',
    billingPeriod: '/ user / mo',
    badge: 'Collaboration',
    isPrimary: false,
    ctaText: 'Upgrade to Team',
  },
  [PLAN_IDS.ENTERPRISE]: {
    id: PLAN_IDS.ENTERPRISE,
    name: 'Enterprise',
    headline: 'Dedicated Controls & Custom Scale',
    description: 'Dedicated cloud infrastructure, custom compliance, tailored SLA, and account support.',
    priceDisplay: 'Custom',
    priceSubtext: 'tailored deployment & licensing',
    billingPeriod: 'contact sales',
    badge: 'Enterprise',
    isPrimary: false,
    ctaText: 'Contact Enterprise Sales',
  },
};

/**
 * Granular capability matrix defining exact access across tiers.
 * Capability keys are systematically queried across the app.
 */
export const CAPABILITIES = {
  // Core Product Suites (Always genuinely useful on Free)
  coreWorkspaces: {
    [PLAN_IDS.FREE]: true,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  localFiles: {
    [PLAN_IDS.FREE]: true,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  basicSearch: {
    [PLAN_IDS.FREE]: true,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  basicSharing: {
    [PLAN_IDS.FREE]: true,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },

  // Intelligence & AI Tier
  aiQuotaTier: {
    [PLAN_IDS.FREE]: 'limited',          // Free daily quota
    [PLAN_IDS.PRO_ANNUAL]: 'advanced',   // High daily reasoning budget
    [PLAN_IDS.PRO_MONTHLY]: 'advanced',
    [PLAN_IDS.PRO_THREE_YEAR]: 'advanced',
    [PLAN_IDS.FOUNDER_LIFETIME]: 'founder_priority',
    [PLAN_IDS.TEAM]: 'team_shared_pool',
    [PLAN_IDS.ENTERPRISE]: 'custom_unmetered',
  },
  orbReasoning: {
    [PLAN_IDS.FREE]: 'basic',            // Standard spotlight & quick lookups
    [PLAN_IDS.PRO_ANNUAL]: 'deep',       // Multi-turn contextual reasoning
    [PLAN_IDS.PRO_MONTHLY]: 'deep',
    [PLAN_IDS.PRO_THREE_YEAR]: 'deep',
    [PLAN_IDS.FOUNDER_LIFETIME]: 'deep',
    [PLAN_IDS.TEAM]: 'deep_team',
    [PLAN_IDS.ENTERPRISE]: 'custom_fine_tuned',
  },
  memoraContextDepth: {
    [PLAN_IDS.FREE]: 'recent_context',  // Limited session context
    [PLAN_IDS.PRO_ANNUAL]: 'deep_memory',// Extended cross-session indexing
    [PLAN_IDS.PRO_MONTHLY]: 'deep_memory',
    [PLAN_IDS.PRO_THREE_YEAR]: 'deep_memory',
    [PLAN_IDS.FOUNDER_LIFETIME]: 'deep_memory',
    [PLAN_IDS.TEAM]: 'shared_team_brain',
    [PLAN_IDS.ENTERPRISE]: 'enterprise_vector_db',
  },
  aiWorkflows: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  browserResearchIntelligence: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  crossWorkspaceReasoning: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  advancedGeneration: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: true,
    [PLAN_IDS.PRO_MONTHLY]: true,
    [PLAN_IDS.PRO_THREE_YEAR]: true,
    [PLAN_IDS.FOUNDER_LIFETIME]: true,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  versionHistoryDays: {
    [PLAN_IDS.FREE]: 7,
    [PLAN_IDS.PRO_ANNUAL]: 90,
    [PLAN_IDS.PRO_MONTHLY]: 30,
    [PLAN_IDS.PRO_THREE_YEAR]: 365,
    [PLAN_IDS.FOUNDER_LIFETIME]: -1, // Unlimited
    [PLAN_IDS.TEAM]: -1,
    [PLAN_IDS.ENTERPRISE]: -1,
  },

  // Team & Collaboration Extensions
  teamWorkspaces: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: false,
    [PLAN_IDS.PRO_MONTHLY]: false,
    [PLAN_IDS.PRO_THREE_YEAR]: false,
    [PLAN_IDS.FOUNDER_LIFETIME]: false,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  teamGovernance: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: false,
    [PLAN_IDS.PRO_MONTHLY]: false,
    [PLAN_IDS.PRO_THREE_YEAR]: false,
    [PLAN_IDS.FOUNDER_LIFETIME]: false,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },
  sharedMemora: {
    [PLAN_IDS.FREE]: false,
    [PLAN_IDS.PRO_ANNUAL]: false,
    [PLAN_IDS.PRO_MONTHLY]: false,
    [PLAN_IDS.PRO_THREE_YEAR]: false,
    [PLAN_IDS.FOUNDER_LIFETIME]: false,
    [PLAN_IDS.TEAM]: true,
    [PLAN_IDS.ENTERPRISE]: true,
  },

  // Future Cloud Capabilities (Extensible slots ready for activation)
  cloudSyncStorageLimitGb: {
    [PLAN_IDS.FREE]: 1,
    [PLAN_IDS.PRO_ANNUAL]: 100,
    [PLAN_IDS.PRO_MONTHLY]: 50,
    [PLAN_IDS.PRO_THREE_YEAR]: 250,
    [PLAN_IDS.FOUNDER_LIFETIME]: 500,
    [PLAN_IDS.TEAM]: 1000,
    [PLAN_IDS.ENTERPRISE]: 5000,
  }
};

/**
 * Concrete usage quotas for product-level limits (Free vs Pro).
 * Centralized here so exact quotas can be adjusted anytime without touching UI or features.
 */
export const PLAN_QUOTAS = {
  [PLAN_IDS.FREE]: {
    dailyAiGenerations: 25,
    orbDeepReasoningSessionsPerDay: 5,
    memoraContextDocumentsLimit: 3,
    versionHistoryDays: 7,
    cloudSyncLimitGb: 1,
    aiQuotaDisplay: '25 AI responses / day',
    orbReasoningDisplay: '5 deep reasoning sessions / day',
    memoraContextDisplay: '3 recent active documents context',
    versionHistoryDisplay: '7-day revision history',
  },
  [PLAN_IDS.PRO_ANNUAL]: {
    dailyAiGenerations: -1, // Unlimited high-capacity
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: 90,
    cloudSyncLimitGb: 100,
    aiQuotaDisplay: 'High-priority unlimited AI generation',
    orbReasoningDisplay: 'Unlimited multi-step Orb reasoning',
    memoraContextDisplay: 'Deep cross-workspace Memora context',
    versionHistoryDisplay: '90-day revision history',
  },
  [PLAN_IDS.PRO_MONTHLY]: {
    dailyAiGenerations: -1,
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: 30,
    cloudSyncLimitGb: 50,
    aiQuotaDisplay: 'High-priority unlimited AI generation',
    orbReasoningDisplay: 'Unlimited multi-step Orb reasoning',
    memoraContextDisplay: 'Deep cross-workspace Memora context',
    versionHistoryDisplay: '30-day revision history',
  },
  [PLAN_IDS.PRO_THREE_YEAR]: {
    dailyAiGenerations: -1,
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: 365,
    cloudSyncLimitGb: 250,
    aiQuotaDisplay: 'High-priority unlimited AI generation',
    orbReasoningDisplay: 'Unlimited multi-step Orb reasoning',
    memoraContextDisplay: 'Deep cross-workspace Memora context',
    versionHistoryDisplay: '1-year revision history',
  },
  [PLAN_IDS.FOUNDER_LIFETIME]: {
    dailyAiGenerations: -1,
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: -1, // Permanent
    cloudSyncLimitGb: 500,
    aiQuotaDisplay: 'Founder priority unlimited compute',
    orbReasoningDisplay: 'Unlimited multi-step Orb reasoning',
    memoraContextDisplay: 'Deep permanent Memora intelligence',
    versionHistoryDisplay: 'Unlimited permanent history',
  },
  [PLAN_IDS.TEAM]: {
    dailyAiGenerations: -1,
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: -1,
    cloudSyncLimitGb: 1000,
    aiQuotaDisplay: 'Team pooled high-speed compute',
    orbReasoningDisplay: 'Team shared Orb reasoning',
    memoraContextDisplay: 'Shared organizational Memora brain',
    versionHistoryDisplay: 'Unlimited team revision history',
  },
  [PLAN_IDS.ENTERPRISE]: {
    dailyAiGenerations: -1,
    orbDeepReasoningSessionsPerDay: -1,
    memoraContextDocumentsLimit: -1,
    versionHistoryDays: -1,
    cloudSyncLimitGb: 5000,
    aiQuotaDisplay: 'Dedicated unmetered compute',
    orbReasoningDisplay: 'Custom fine-tuned Orb models',
    memoraContextDisplay: 'Private enterprise vector vault',
    versionHistoryDisplay: 'Unlimited enterprise audit history',
  },
};

const STORAGE_KEY = 'regaarder_workspace_plan';

/**
 * Get active plan for the current environment/user
 */
export function getActivePlan() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && PLANS[saved]) {
      return saved;
    }
  } catch (err) {
    // Fallback to Free if localStorage is restricted
  }
  return PLAN_IDS.FREE;
}

/**
 * Set active plan (e.g. following successful checkout or upgrade trigger)
 */
export function setActivePlan(planId) {
  if (!PLANS[planId]) {
    console.warn('[Entitlements] Unknown planId: ' + planId + '. Falling back to FREE.');
    planId = PLAN_IDS.FREE;
  }
  try {
    localStorage.setItem(STORAGE_KEY, planId);
    window.dispatchEvent(new CustomEvent('regaarder-plan-changed', { detail: { planId } }));
  } catch (err) {
    console.warn('[Entitlements] Could not persist plan to localStorage', err);
  }
  return planId;
}

/**
 * Check if a plan grants a specific capability
 */
export function hasCapability(planId, capabilityKey) {
  const cap = CAPABILITIES[capabilityKey];
  if (!cap) {
    console.warn('[Entitlements] Unregistered capability key: ' + capabilityKey);
    return false;
  }
  const val = cap[planId];
  return Boolean(val);
}

/**
 * Retrieve all capabilities for a given plan
 */
export function getPlanCapabilities(planId) {
  const effectivePlan = PLANS[planId] ? planId : PLAN_IDS.FREE;
  const result = {};
  for (const [key, tierMap] of Object.entries(CAPABILITIES)) {
    result[key] = tierMap[effectivePlan];
  }
  return result;
}

/**
 * Retrieve concrete quotas for a given plan
 */
export function getPlanQuotas(planId) {
  const effectivePlan = PLANS[planId] ? planId : PLAN_IDS.FREE;
  return PLAN_QUOTAS[effectivePlan] || PLAN_QUOTAS[PLAN_IDS.FREE];
}

/**
 * Check whether a plan is Pro tier or higher
 */
export function isProPlan(planId) {
  return [
    PLAN_IDS.PRO_ANNUAL,
    PLAN_IDS.PRO_MONTHLY,
    PLAN_IDS.PRO_THREE_YEAR,
    PLAN_IDS.FOUNDER_LIFETIME,
    PLAN_IDS.TEAM,
    PLAN_IDS.ENTERPRISE
  ].includes(planId);
}
