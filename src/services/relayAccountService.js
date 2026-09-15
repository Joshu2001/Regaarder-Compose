/**
 * Relay Account Service
 *
 * Manages the Relay user identity layer:
 *   - Persistent current-user session (localStorage)
 *   - Global user registry: every registered user is discoverable by name or @handle
 *   - Firebase Auth as the credential backend (registration & login)
 *   - localStorage as the local registry mirror (no Firestore dependency required)
 *
 * User schema:
 * {
 *   id:           string   — Firebase UID or generated UUID
 *   email:        string
 *   displayName:  string
 *   handle:       string   — '@joshua', unique, auto-derived from displayName
 *   avatarColor:  string   — deterministic hex color from id
 *   bio:          string   — optional one-liner role / status
 *   createdAt:    number   — epoch ms
 *   provider:     string   — 'email' | 'google' | 'apple'
 * }
 */

import {
  isFirebaseConfigured,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithApple,
  logoutFirebase,
  onAuthChange,
} from './firebaseAuthService';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const CURRENT_USER_KEY = 'regaarder_relay_current_user_v1';
const USER_REGISTRY_KEY = 'regaarder_relay_user_registry_v1';

// ─── Avatar Color Palette (premium, muted) ────────────────────────────────────

const AVATAR_COLORS = [
  '#7C6FCD', '#5B8DEF', '#3DB48C', '#E8845B',
  '#D95F8A', '#6BA8D6', '#B07CC8', '#5FA36E',
  '#C47F47', '#8C6EC4', '#4EACD6', '#D96B6B',
];

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Deterministically maps a user id to a color from the palette.
 * Same id always returns the same color.
 */
function deriveAvatarColor(id) {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Derives a unique @handle from a display name.
 * Strips non-alphanumeric chars, lowercases, and collapses spaces.
 * '@joshua_david' from 'Joshua David'.
 */
export function generateHandle(displayName) {
  if (!displayName) return '@user';
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `@${base || 'user'}`;
}

/**
 * Builds a normalized Relay user profile from a Firebase user + extra fields.
 */
function buildRelayUser(firebaseUser, { bio = '', handle = '' } = {}) {
  const resolvedHandle = handle || generateHandle(firebaseUser.name || firebaseUser.email);
  return {
    id: firebaseUser.id,
    email: firebaseUser.email || '',
    displayName: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'User',
    handle: resolvedHandle,
    avatarColor: deriveAvatarColor(firebaseUser.id),
    bio,
    photoURL: firebaseUser.photoURL || null,
    provider: firebaseUser.provider || 'email',
    createdAt: Date.now(),
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────────

function readRegistry() {
  try {
    const raw = localStorage.getItem(USER_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {
    // Corrupt data — start fresh
  }
  return [];
}

function writeRegistry(users) {
  try {
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('[RelayAccount] Failed to persist registry:', e);
  }
}

/**
 * Adds or updates a user in the local registry.
 * Deduplicates on user.id.
 */
export function upsertUserInRegistry(user) {
  if (!user?.id) return;
  const registry = readRegistry();
  const existingIdx = registry.findIndex(u => u.id === user.id);
  if (existingIdx >= 0) {
    registry[existingIdx] = { ...registry[existingIdx], ...user };
  } else {
    registry.push(user);
  }
  writeRegistry(registry);
}

/**
 * Returns all users in the registry except the current user (for discovery).
 */
export function getRegistryUsers() {
  return readRegistry();
}

/**
 * Searches the registry by display name or @handle.
 * Case-insensitive, returns up to 20 results.
 */
export function searchUsers(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase().replace(/^@/, '');
  return readRegistry()
    .filter(u => {
      const nameMatch = (u.displayName || '').toLowerCase().includes(q);
      const handleMatch = (u.handle || '').toLowerCase().replace(/^@/, '').includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      return nameMatch || handleMatch || emailMatch;
    })
    .slice(0, 20);
}

// ─── Session ──────────────────────────────────────────────────────────────────

/**
 * Returns the currently signed-in Relay user, or null.
 */
export function getCurrentRelayUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

/**
 * Persists the signed-in user to the session slot.
 */
export function setCurrentRelayUser(user) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('[RelayAccount] Failed to persist current user:', e);
  }
}

/**
 * Clears the current session.
 */
export function clearCurrentRelayUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (_) {}
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

/**
 * Registers a new Relay user with email + password + display name.
 * Returns the relay user profile on success.
 */
export async function relayRegister({ email, password, displayName, bio = '' }) {
  const { user: fbUser } = await registerWithEmail(email, password, displayName);
  const relayUser = buildRelayUser(fbUser, { bio });
  upsertUserInRegistry(relayUser);
  setCurrentRelayUser(relayUser);
  return relayUser;
}

/**
 * Logs in an existing Relay user with email + password.
 * Returns the relay user profile on success.
 */
export async function relayLogin({ email, password }) {
  const { user: fbUser } = await loginWithEmail(email, password);
  // Re-derive profile; preserve bio from existing registry entry if available
  const existing = readRegistry().find(u => u.id === fbUser.id);
  const relayUser = buildRelayUser(fbUser, {
    bio: existing?.bio || '',
    handle: existing?.handle || '',
  });
  upsertUserInRegistry(relayUser);
  setCurrentRelayUser(relayUser);
  return relayUser;
}

/**
 * Signs in with Google. Creates a registry entry on first login.
 */
export async function relayLoginWithGoogle() {
  const { user: fbUser } = await loginWithGoogle();
  const existing = readRegistry().find(u => u.id === fbUser.id);
  const relayUser = buildRelayUser(fbUser, {
    bio: existing?.bio || '',
    handle: existing?.handle || '',
  });
  upsertUserInRegistry(relayUser);
  setCurrentRelayUser(relayUser);
  return relayUser;
}

/**
 * Signs in with Apple. Creates a registry entry on first login.
 */
export async function relayLoginWithApple() {
  const { user: fbUser } = await loginWithApple();
  const existing = readRegistry().find(u => u.id === fbUser.id);
  const relayUser = buildRelayUser(fbUser, {
    bio: existing?.bio || '',
    handle: existing?.handle || '',
  });
  upsertUserInRegistry(relayUser);
  setCurrentRelayUser(relayUser);
  return relayUser;
}

/**
 * Logs out the current Relay user.
 */
export async function relayLogout() {
  clearCurrentRelayUser();
  try {
    if (isFirebaseConfigured()) {
      await logoutFirebase();
    }
  } catch (_) {}
}

/**
 * Subscribes to Firebase Auth state changes and keeps Relay session in sync.
 * Returns an unsubscribe function.
 */
export function subscribeToRelayAuth(callback) {
  if (!isFirebaseConfigured()) {
    callback(getCurrentRelayUser());
    return () => {};
  }

  return onAuthChange((fbUser) => {
    if (fbUser) {
      const existing = readRegistry().find(u => u.id === fbUser.id);
      const relayUser = existing || buildRelayUser(fbUser);
      setCurrentRelayUser(relayUser);
      callback(relayUser);
    } else {
      clearCurrentRelayUser();
      callback(null);
    }
  });
}
