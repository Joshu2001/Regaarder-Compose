/**
 * Workspace Store for Regaarder Compose Ecosystem
 * Persists workspaces in localStorage and syncs with Supabase when online.
 */
import { supabaseService } from './supabaseService';

export const WORKSPACES_STORAGE_KEY = 'regaarder_workspaces_v1';
export const ACTIVE_WORKSPACE_ID_KEY = 'rg_active_workspace_id';

export const DEFAULT_WORKSPACES = [
  {
    id: 'ws_default_team',
    name: 'Team Space',
    color: '#7C3AED',
    icon: 'building',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

export const readWorkspaces = () => {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACES;
  try {
    const raw = window.localStorage.getItem(WORKSPACES_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(DEFAULT_WORKSPACES));
      return DEFAULT_WORKSPACES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_WORKSPACES;
  } catch (_) {
    return DEFAULT_WORKSPACES;
  }
};

export const writeWorkspaces = (workspaces) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
    window.dispatchEvent(new CustomEvent('regaarder:workspaces-updated', { detail: workspaces }));
  } catch (_) {}
};

export const getActiveWorkspace = () => {
  const all = readWorkspaces();
  if (typeof window === 'undefined') return all[0];
  try {
    const activeId = window.localStorage.getItem(ACTIVE_WORKSPACE_ID_KEY);
    if (activeId) {
      const found = all.find((w) => String(w.id) === String(activeId));
      if (found) return found;
    }
  } catch (_) {}
  return all[0] || DEFAULT_WORKSPACES[0];
};

export const setActiveWorkspaceId = (workspaceId) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, String(workspaceId));
    window.dispatchEvent(new CustomEvent('regaarder:active-workspace-changed', { detail: workspaceId }));
  } catch (_) {}
};

export const createWorkspaceLocalAndRemote = async ({ name, color = '#7C3AED', icon = 'building', description = '' }) => {
  const currentWorkspaces = readWorkspaces();
  const localId = `ws_${Date.now()}`;
  
  const newWorkspace = {
    id: localId,
    name: name.trim(),
    color,
    icon,
    description,
    createdAt: new Date().toISOString()
  };

  const updated = [...currentWorkspaces, newWorkspace];
  writeWorkspaces(updated);
  setActiveWorkspaceId(newWorkspace.id);

  // Sync to Supabase in the background
  try {
    const remoteData = await supabaseService.createWorkspace(
      newWorkspace.name,
      description,
      { color, icon, localId }
    );
    if (remoteData && remoteData.id) {
      const synced = updated.map((w) =>
        w.id === localId ? { ...w, remoteId: remoteData.id } : w
      );
      writeWorkspaces(synced);
    }
  } catch (err) {
    // Network or permission fallback; local storage remains valid
    console.warn('[WorkspaceStore] Supabase remote sync skipped or failed:', err?.message || err);
  }

  return newWorkspace;
};

export const syncWorkspacesFromRemote = async () => {
  try {
    const remote = await supabaseService.getWorkspaces();
    if (Array.isArray(remote) && remote.length > 0) {
      const current = readWorkspaces();
      const currentNames = new Set(current.map((w) => w.name.toLowerCase()));
      
      const newFromRemote = remote
        .filter((r) => r.name && !currentNames.has(r.name.toLowerCase()))
        .map((r) => ({
          id: `ws_remote_${r.id}`,
          remoteId: r.id,
          name: r.name,
          color: r.settings?.color || '#7C3AED',
          icon: r.settings?.icon || 'building',
          description: r.description || '',
          createdAt: r.created_at || new Date().toISOString()
        }));

      if (newFromRemote.length > 0) {
        const merged = [...current, ...newFromRemote];
        writeWorkspaces(merged);
        return merged;
      }
    }
  } catch (_) {}
  return readWorkspaces();
};
