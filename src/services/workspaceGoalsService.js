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
