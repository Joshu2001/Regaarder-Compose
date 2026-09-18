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
    if (userOnly.length !== parsed.length) {
      window.localStorage.setItem(WORKSPACE_PROJECTS_STORAGE_KEY, JSON.stringify(userOnly));
    }
    return userOnly;
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

export const createProject = ({ name, description = "", customInstructions = "", color = "#7C3AED", icon = "folder" }) => {
  const current = readWorkspaceProjects();
  const newProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    description: description.trim(),
    customInstructions: customInstructions.trim(),
    color,
    icon,
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
