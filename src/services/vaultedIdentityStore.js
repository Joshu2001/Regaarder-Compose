/**
 * vaultedIdentityStore.js
 * 
 * Phase 6 / Pillar 11: Vaulted Identity State (Headless OAuth & Session Store)
 * 
 * Securely stores and inherits authenticated session cookies, bearer tokens,
 * and OAuth keys per domain without requiring manual user re-entry during
 * autonomous background web execution tasks.
 */

const STORAGE_KEY = 'regaarder_vaulted_identity_v1';

let inMemoryVault = new Map();

const safeLoad = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([k, v]) => inMemoryVault.set(k, v));
      }
    }
  } catch (e) {
    console.warn('[VaultedIdentity] Load fallback:', e);
  }
};

const safeSave = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const obj = Object.fromEntries(inMemoryVault.entries());
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }
  } catch (e) {
    console.warn('[VaultedIdentity] Save fallback:', e);
  }
};

// Initialize from storage on boot
safeLoad();

/**
 * Store authenticated session credentials for a domain.
 */
export function storeVaultedSession(domainOrSession, maybeCredentials = {}) {
  let domain = '';
  let credentials = {};

  if (typeof domainOrSession === 'object' && domainOrSession !== null && domainOrSession.domain) {
    domain = domainOrSession.domain;
    credentials = {
      ...domainOrSession,
      ...(domainOrSession.credentials || {})
    };
  } else {
    domain = domainOrSession;
    credentials = maybeCredentials || {};
  }

  if (!domain || typeof domain !== 'string') throw new Error('Domain is required for vaulted session storage');

  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const now = Date.now();
  let expiresAt = credentials.expiresAt;
  if (!expiresAt && credentials.ttlSeconds !== undefined) {
    expiresAt = new Date(now + credentials.ttlSeconds * 1000).toISOString();
  } else if (!expiresAt) {
    expiresAt = new Date(now + 86400000 * 30).toISOString();
  }

  const rawCreds = credentials.credentials || {
    token: credentials.token,
    apiKey: credentials.apiKey
  };

  const entry = {
    domain: cleanDomain,
    authType: credentials.authType || (credentials.token ? 'bearer' : 'cookie'),
    credentials: rawCreds,
    token: credentials.token || rawCreds.token || null,
    cookies: credentials.cookies || {},
    headers: credentials.headers || {},
    accountAlias: credentials.accountAlias || credentials.userIdentifier || 'authenticated_executive',
    userIdentifier: credentials.userIdentifier || credentials.accountAlias || 'authenticated_executive',
    updatedAt: new Date().toISOString(),
    expiresAt
  };

  inMemoryVault.set(cleanDomain, entry);
  safeSave();

  return {
    success: true,
    domain: cleanDomain,
    stored: true,
    authType: entry.authType,
    updatedAt: entry.updatedAt
  };
}

/**
 * Retrieve credentials for a given domain or URL.
 */
export function getVaultedSession(domainOrUrl) {
  if (!domainOrUrl) return null;
  const clean = domainOrUrl.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  const found = inMemoryVault.get(clean);
  if (!found) return null;

  // Check expiration
  if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
    inMemoryVault.delete(clean);
    safeSave();
    return null;
  }

  return { ...found };
}

/**
 * List all vaulted domains without exposing raw secrets.
 */
export function listVaultedDomains() {
  const list = [];
  inMemoryVault.forEach((val, key) => {
    list.push({
      domain: key,
      authType: val.authType,
      accountAlias: val.accountAlias || val.userIdentifier,
      userIdentifier: val.userIdentifier,
      updatedAt: val.updatedAt,
      expiresAt: val.expiresAt,
      hasToken: Boolean(val.token),
      cookieCount: Object.keys(val.cookies || {}).length
    });
  });
  return list;
}

/**
 * Delete a specific vaulted domain.
 */
export function deleteVaultedSession(domain) {
  if (!domain) return false;
  const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const deleted = inMemoryVault.delete(clean);
  if (deleted) safeSave();
  return deleted;
}

/**
 * Clear all vaulted sessions.
 */
export function clearAllVaultedSessions() {
  inMemoryVault.clear();
  safeSave();
}

/**
 * Reset vault for unit testing.
 */
export function resetVaultedIdentityForTesting() {
  inMemoryVault.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }
}

export const resetVaultedStoreForTesting = resetVaultedIdentityForTesting;

