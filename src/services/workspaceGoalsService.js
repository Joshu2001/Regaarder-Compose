// Persistent Workspace Goals & Milestones Manager for Regaarder Workspace
const STORAGE_KEY = 'rc.workspaceGoals_v1';
const MILESTONES_STORAGE_KEY = 'rc.workspaceMilestones_v1';

/**
 * Universal Desired Outcome Goals
 * Broad, strategic, and applicable to founders, executives, researchers, freelancers, teams, and individuals.
 */
export const UNIVERSAL_GOAL_DEFINITIONS = [
  {
    id: 'business_efficiency',
    title: 'Run my business more efficiently',
    description: 'Reduce operational friction and spend less time on repetitive work.',
    suggestedMilestones: [
      'Consolidate company information',
      'Standardize recurring workflows',
      'Reduce repetitive administrative work',
      'Establish weekly operating reviews'
    ]
  },
  {
    id: 'business_growth',
    title: 'Grow my business',
    description: 'Focus resources, projects, and teams around growth.',
    suggestedMilestones: [
      'Define core growth metrics and levers',
      'Align cross-functional projects to revenue goals',
      'Accelerate customer acquisition velocity'
    ]
  },
  {
    id: 'launch_new',
    title: 'Launch something new',
    description: 'Move an idea from planning to execution.',
    suggestedMilestones: [
      'Clarify project concept and target audience',
      'Draft launch roadmap and MVP deliverables',
      'Complete pre-launch review and deployment'
    ]
  },
  {
    id: 'organize_work',
    title: 'Organize my work',
    description: 'Spend less time searching and more time getting things done.',
    suggestedMilestones: [
      'Centralize scattered documents and spreadsheets',
      'Establish unified task and project structure',
      'Create high-level weekly priority view'
    ]
  },
  {
    id: 'team_collaboration',
    title: 'Improve team collaboration',
    description: 'Keep everyone aligned around the same information and priorities.',
    suggestedMilestones: [
      'Establish shared workspace knowledge hub',
      'Streamline real-time meeting and discussion notes',
      'Align team on current sprint commitments'
    ]
  },
  {
    id: 'better_decisions',
    title: 'Make better decisions',
    description: 'Bring the right information and context together when it matters.',
    suggestedMilestones: [
      'Synthesize past discussions and decision logs',
      'Track key operational performance data',
      'Surface relevant context automatically when drafting'
    ]
  }
];

export function getWorkspaceGoals() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

export function saveWorkspaceGoals(goals) {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = Array.isArray(goals) ? goals.filter(g => typeof g === 'string' && g.trim().length > 0) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('regaarder-workspace-goals-updated', { detail: sanitized }));
  } catch (_e) {}
}

export function addWorkspaceGoal(goal) {
  if (!goal || !goal.trim()) return getWorkspaceGoals();
  const current = getWorkspaceGoals();
  const trimmed = goal.trim();
  if (!current.includes(trimmed)) {
    const updated = [...current, trimmed];
    saveWorkspaceGoals(updated);
    return updated;
  }
  return current;
}

export function removeWorkspaceGoal(goalToRemove) {
  const current = getWorkspaceGoals();
  const updated = current.filter(g => g !== goalToRemove);
  saveWorkspaceGoals(updated);
  return updated;
}

export function getWorkspaceMilestones() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MILESTONES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

export function saveWorkspaceMilestones(milestones) {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = Array.isArray(milestones) ? milestones.filter(m => typeof m === 'string' && m.trim().length > 0) : [];
    localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('regaarder-workspace-milestones-updated', { detail: sanitized }));
  } catch (_e) {}
}

/**
 * Generate 3-4 strategic milestone checkpoints for custom natural language goals using the LLM engine.
 * Adheres strictly to Goal -> Milestone -> Task hierarchy (milestones, not micro-tasks).
 * Includes intelligent deterministic fallback so it always succeeds even if offline or without API key.
 */
export async function generateAiMilestonesForGoals(customGoals = []) {
  if (!Array.isArray(customGoals) || customGoals.length === 0) return [];

  const goalsSummary = customGoals.join('; ');

  try {
    const { executeAiTurn, getActiveAiConfig } = await import('./llmProviderService.js');
    const aiConfig = getActiveAiConfig();

    const systemPrompt = `You are the Senior Strategic Architect for Regaarder Workspace.
The user has established one or more high-level workspace outcome goals: "${goalsSummary}".
Your task is to generate exactly 3-4 strategic, measurable Milestone Checkpoints for these goals.

CRITICAL ARCHITECTURAL DIRECTIVE:
Follow the hierarchy: Goal -> Milestone -> Task.
- A Milestone is an executive checkpoint or measurable outcome (e.g. "Finalize core customer journey and MVP feature scope", "Complete end-to-end billing and auth validation", "Conduct beta onboarding review with initial cohort").
- Do NOT output micro-tasks (like "write CSS", "click button", "draft meeting invite").
- Return ONLY a valid JSON array of 3 to 4 string titles. No markdown formatting, no explanations, no wrapping code blocks.
Example output format:
["Finalize core customer journey & MVP scope", "Standardize billing & auth pipeline", "Complete beta rollout & feedback review"]`;

    const response = await executeAiTurn(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 3-4 executive milestone checkpoints for: "${goalsSummary}"` }
      ],
      [],
      aiConfig
    );

    if (response && response.type === 'text' && response.content) {
      const cleaned = response.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => String(p).trim()).filter(Boolean).slice(0, 4);
      }
    }
  } catch (_err) {
    // Graceful fallback to heuristic milestone synthesis
  }

  // Smart heuristic fallback based on intent semantics
  return generateHeuristicMilestones(goalsSummary);
}

function generateHeuristicMilestones(summaryText) {
  const lower = summaryText.toLowerCase();
  if (lower.includes('saas') || lower.includes('launch') || lower.includes('product') || lower.includes('app')) {
    return [
      'Finalize core product journey & MVP scope freeze',
      'Complete end-to-end billing, auth, and data pipeline',
      'Execute private beta onboarding review with initial cohort',
      'Complete pre-launch infrastructure & security audit'
    ];
  }
  if (lower.includes('business') || lower.includes('client') || lower.includes('revenue') || lower.includes('grow')) {
    return [
      'Define core growth levers and customer acquisition model',
      'Standardize recurring client onboarding and deliverables',
      'Establish unified operational dashboard and weekly review rhythm'
    ];
  }
  if (lower.includes('document') || lower.includes('organize') || lower.includes('team') || lower.includes('waste')) {
    return [
      'Consolidate scattered documents, sheets, and active workstreams',
      'Standardize operational workflows and team knowledge hub',
      'Automate repetitive status reporting and sync cycles'
    ];
  }
  return [
    'Establish initial workspace baseline and deliverable context',
    'Define measurable operational milestone checkpoints',
    'Review progress and complete initial milestone phase'
  ];
}
