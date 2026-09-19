/**
 * Project Store for Regaarder Compose Ecosystem
 * Persists projects in localStorage and provides helpers to link documents and tasks to projects.
 */

export const WORKSPACE_PROJECTS_STORAGE_KEY = 'regaarder_projects_v1';

const LEGACY_SAMPLE_IDS = new Set([
  "proj_copenhagen_trip",
  "proj_branding_meet",
  "proj_deck_prediction"
]);

/**
 * Phase IDs that were seeded by DEFAULT_ROADMAP_PHASES before the empty-state system was
 * introduced. Any project whose entire phases array consists exclusively of these IDs was
 * auto-populated — not hand-authored — and should be migrated to an empty phases list so
 * the proper empty-state UI renders on first load.
 */
const LEGACY_PLACEHOLDER_PHASE_IDS = new Set([
  "phase-research",
  "phase-design",
  "phase-dev",
  "phase-testing",
  "phase-launch"
]);

export const readWorkspaceProjects = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WORKSPACE_PROJECTS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(WORKSPACE_PROJECTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge legacy hardcoded demo projects so user only sees their own created projects
    const userOnly = parsed.filter((p) => p && !LEGACY_SAMPLE_IDS.has(p.id));

    // One-time migration: strip projects whose phases array consists entirely of the
    // legacy auto-seeded placeholder IDs — these were never user-authored phases.
    let needsSave = userOnly.length !== parsed.length;
    const migrated = userOnly.map((p) => {
      if (
        Array.isArray(p.phases) &&
        p.phases.length > 0 &&
        p.phases.every((ph) => LEGACY_PLACEHOLDER_PHASE_IDS.has(ph.id))
      ) {
        needsSave = true;
        return { ...p, phases: [] };
      }
      return p;
    });

    if (needsSave) {
      window.localStorage.setItem(WORKSPACE_PROJECTS_STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch (_) {
    return [];
  }
};

export const writeWorkspaceProjects = (projects) => {
  if (typeof window === 'undefined') return projects;
  try {
    window.localStorage.setItem(WORKSPACE_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent('workspace-projects-update', {
      detail: { projects },
    }));
  } catch (_) {
    // ignore in private browsing
  }
  return projects;
};

export const DEFAULT_ROADMAP_PHASES = [
  {
    id: "phase-research",
    label: "Research",
    status: "completed",
    startDate: "2026-09-01",
    endDate: "2026-09-08",
    description: "Scope user requirements, competitor analysis, and technical feasibility.",
    milestones: [
      { id: "m-res-1", title: "Synthesize target user pain points & requirements", completed: true, dueDate: "2026-09-04" },
      { id: "m-res-2", title: "Complete architecture feasibility review", completed: true, dueDate: "2026-09-08" }
    ]
  },
  {
    id: "phase-design",
    label: "Design",
    status: "in-progress",
    startDate: "2026-09-09",
    endDate: "2026-09-18",
    description: "Design UI/UX layouts, wireframes, component systems, and design reviews.",
    milestones: [
      { id: "m-des-1", title: "Finalize Apple-inspired component hierarchy", completed: true, dueDate: "2026-09-13" },
      { id: "m-des-2", title: "Produce interactive prototype & client walkthrough", completed: false, dueDate: "2026-09-18" }
    ]
  },
  {
    id: "phase-dev",
    label: "Development",
    status: "upcoming",
    startDate: "2026-09-19",
    endDate: "2026-10-05",
    description: "Full-stack code implementation, state management, and ecosystem integration.",
    milestones: [
      { id: "m-dev-1", title: "Implement modular roadmap state & views", completed: false, dueDate: "2026-09-25", dependencies: ["m-des-2"] },
      { id: "m-dev-2", title: "Connect AI synthesis & Relay sharing pipelines", completed: false, dueDate: "2026-10-05" }
    ]
  },
  {
    id: "phase-testing",
    label: "Testing",
    status: "upcoming",
    startDate: "2026-10-06",
    endDate: "2026-10-15",
    description: "Rigorous unit testing, QA smoke tests, performance audits, and polish.",
    milestones: [
      { id: "m-tst-1", title: "Cross-platform regression & accessibility check", completed: false, dueDate: "2026-10-10" },
      { id: "m-tst-2", title: "End-to-end user journey validation", completed: false, dueDate: "2026-10-15" }
    ]
  },
  {
    id: "phase-launch",
    label: "Launch",
    status: "upcoming",
    startDate: "2026-10-16",
    endDate: "2026-10-22",
    description: "Production deployment, release communication, and user enablement.",
    milestones: [
      { id: "m-lnc-1", title: "Deploy release build to production cluster", completed: false, dueDate: "2026-10-18" },
      { id: "m-lnc-2", title: "Publish release changelog and team briefing", completed: false, dueDate: "2026-10-22" }
    ]
  }
];

export const createProject = ({
  name,
  description = "",
  customInstructions = "",
  color = "#7C3AED",
  icon = "folder",
  phases = null,
  goals = null,
  members = null
}) => {
  const current = readWorkspaceProjects();
  const newProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    description: description.trim(),
    customInstructions: customInstructions.trim(),
    color: color || "#7C3AED",
    icon: icon || "folder",
    phases: Array.isArray(phases) ? phases : (phases || []),
    goals: goals || [
      { id: `goal_${Date.now()}_1`, text: "Define core scope and product requirements", completed: false },
      { id: `goal_${Date.now()}_2`, text: "Create draft designs and interactive prototypes", completed: false },
      { id: `goal_${Date.now()}_3`, text: "Prepare delivery assets and launch review", completed: false }
    ],
    members: members || [
      { id: "user_owner", name: "You", email: "you@regaarder.com", role: "owner", avatarColor: color || "#7C3AED" }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  };
  const updated = [newProject, ...current];
  writeWorkspaceProjects(updated);
  return newProject;
};

export const updateProject = (id, updates) => {
  const current = readWorkspaceProjects();
  const updated = current.map((p) => {
    if (p.id === id) {
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  writeWorkspaceProjects(updated);
  return updated;
};

export const deleteProject = (id) => {
  const current = readWorkspaceProjects();
  const updated = current.filter((p) => p.id !== id);
  writeWorkspaceProjects(updated);
  return updated;
};
