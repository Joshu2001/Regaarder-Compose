/**
 * meneurCommandDeckService.js
 * 
 * Phase 6 / Pillar 11: Meneur Command Deck & Web Context Service
 * 
 * Manages contextual focus enforcement, instant on-page directive capture,
 * tab & context session archiving, and zero-latency cross-substrate synchronization.
 */

import { queueDirective, DIRECTIVE_PRIORITY, DIRECTIVE_TIERS } from './directiveQueueEngine.js';
import { dispatchWorkspaceMutation, WORKSPACE_APP_CHANNELS } from './workspaceStateBus.js';

const FOCUS_STORAGE_KEY = 'meneur_focus_rules_v1';
const ARCHIVES_STORAGE_KEY = 'meneur_tab_archives_v1';

const DEFAULT_DISTRACTING_DOMAINS = [
  'youtube.com',
  'youtube.com/shorts',
  'twitter.com',
  'x.com',
  'reddit.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'news.ycombinator.com'
];

let isFocusModeActiveState = true;
let customBlockedDomains = new Set(DEFAULT_DISTRACTING_DOMAINS);
let tabArchives = [];

const safeLoadDeck = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const focusRaw = window.localStorage.getItem(FOCUS_STORAGE_KEY);
      if (focusRaw) {
        const parsed = JSON.parse(focusRaw);
        customBlockedDomains = new Set(parsed);
      }
      const archRaw = window.localStorage.getItem(ARCHIVES_STORAGE_KEY);
      if (archRaw) {
        tabArchives = JSON.parse(archRaw);
      }
    }
  } catch (e) {
    console.warn('[MeneurDeck] Storage load fallback:', e);
  }
};

const safeSaveDeck = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(Array.from(customBlockedDomains)));
      window.localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(tabArchives));
    }
  } catch (e) {
    console.warn('[MeneurDeck] Storage save fallback:', e);
  }
};

safeLoadDeck();

// ── 1. CONTEXTUAL FOCUS ENFORCEMENT ──────────────────────────────────────────

/**
 * Check if a URL should be blocked during deep-work or focus modes.
 */
export function evaluateSiteFocusBlock(url = '', context = {}) {
  if (!url || !isFocusModeActiveState) {
    return { isBlocked: false, domain: '', reason: 'Focus mode inactive' };
  }

  const clean = url.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  const domain = clean.split('/')[0];

  const matched = Array.from(customBlockedDomains).some(blocked => {
    return clean.includes(blocked.toLowerCase());
  });

  if (matched) {
    return {
      isBlocked: true,
      domain,
      rule: 'contextual_distraction_suppressed',
      reason: 'Suppressed during deep-work block to protect executive momentum'
    };
  }

  return { isBlocked: false, domain, reason: 'Allowed domain' };
}

export function isFocusModeActive() {
  return isFocusModeActiveState;
}

export function toggleFocusMode(forceState) {
  isFocusModeActiveState = typeof forceState === 'boolean' ? forceState : !isFocusModeActiveState;
  return isFocusModeActiveState;
}

export function setFocusModeRule(domainOrObj, isBlocked = true) {
  const domain = typeof domainOrObj === 'object' && domainOrObj !== null ? domainOrObj.domain : domainOrObj;
  const blocked = typeof domainOrObj === 'object' && domainOrObj !== null && domainOrObj.isBlocked !== undefined ? domainOrObj.isBlocked : isBlocked;
  if (!domain) return false;
  const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (blocked) {
    customBlockedDomains.add(clean);
  } else {
    customBlockedDomains.delete(clean);
  }
  safeSaveDeck();
  return true;
}

export function getFocusModeRule() {
  return {
    enabled: isFocusModeActiveState,
    blockedDomains: Array.from(customBlockedDomains)
  };
}

export function getActiveBlockRules() {
  return Array.from(customBlockedDomains);
}

// ── 2. INSTANT DIRECTIVE CAPTURE ─────────────────────────────────────────────

/**
 * Turns highlighted text or active webpage context into an actionable calendar directive.
 */
export function captureWebDirective({
  text = '',
  sourceUrl = '',
  title = '',
  tier = DIRECTIVE_TIERS.USER,
  priority = DIRECTIVE_PRIORITY.P1,
  assignee = 'Marcus Agent',
  blockId = null
}) {
  const cleanSnippet = text.trim();
  const directiveTitle = title.trim() || (cleanSnippet ? cleanSnippet.slice(0, 75) : `Review research from ${sourceUrl}`);

  const directive = queueDirective({
    title: directiveTitle,
    priority: priority || DIRECTIVE_PRIORITY.P1,
    tier: tier || DIRECTIVE_TIERS.USER,
    owner: tier || DIRECTIVE_TIERS.USER,
    assignee: assignee || 'Marcus Agent',
    description: `[Captured from Web] ${sourceUrl}\n\nSnippet:\n"${cleanSnippet}"`,
    metadata: {
      blockId,
      sourceUrl,
      capturedAt: new Date().toISOString()
    }
  });

  dispatchWorkspaceMutation({
    appId: WORKSPACE_APP_CHANNELS.TASKS,
    targetApp: WORKSPACE_APP_CHANNELS.TASKS,
    action: 'WEB_DIRECTIVE_CAPTURED',
    entityId: directive.id,
    delta: {
      directiveId: directive.id,
      title: directiveTitle,
      sourceUrl,
      priority
    },
    source: 'meneur_command_deck'
  });

  return {
    ...directive,
    success: true,
    directive,
    id: directive.id,
    title: directive.title,
    tier: directive.tier,
    capturedText: cleanSnippet,
    sourceUrl
  };
}

// ── 3. WORKSPACE TAB & SESSION ARCHIVING ─────────────────────────────────────

/**
 * Automatically groups and saves active tab sessions linked to specific schedule blocks.
 */
export function archiveTabSession(arg1, arg2, arg3) {
  let tabs = [];
  let label = 'Research Session';
  let scheduleBlockId = null;

  if (Array.isArray(arg1)) {
    tabs = arg1;
    label = typeof arg2 === 'string' ? arg2 : 'Research Session';
    scheduleBlockId = arg3 || null;
  } else if (typeof arg1 === 'string') {
    label = arg1;
    tabs = Array.isArray(arg2) ? arg2 : [];
    scheduleBlockId = arg3 || null;
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    tabs = arg1.tabs || [];
    label = arg1.title || arg1.label || 'Research Session';
    scheduleBlockId = arg1.timeBlockId || arg1.scheduleBlockId || null;
  }

  const validTabs = Array.isArray(tabs) ? tabs.filter(t => t && t.url) : [];
  const archiveId = `arch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
  const cleanLabel = String(label || 'Research Session').trim();

  const archive = {
    id: archiveId,
    title: cleanLabel,
    label: cleanLabel,
    timeBlockId: scheduleBlockId,
    scheduleBlockId,
    createdAt: new Date().toISOString(),
    tabCount: validTabs.length,
    tabs: validTabs.map(t => ({
      id: t.id || Math.random().toString(),
      title: t.title || 'Web Page',
      url: t.url,
      favicon: t.favicon || ''
    }))
  };

  tabArchives.unshift(archive);
  safeSaveDeck();

  return archive;
}

/**
 * Retrieve saved tab archives.
 */
export function listTabArchives() {
  return [...tabArchives];
}

/**
 * Delete a saved tab archive.
 */
export function deleteTabArchive(archiveId) {
  const before = tabArchives.length;
  tabArchives = tabArchives.filter(a => a.id !== archiveId);
  const deleted = tabArchives.length < before;
  if (deleted) safeSaveDeck();
  return deleted;
}

/**
 * Restore an archived tab session.
 */
export function restoreTabSession(archiveId) {
  const found = tabArchives.find(a => a.id === archiveId);
  if (!found) return null;

  dispatchWorkspaceMutation({
    appId: WORKSPACE_APP_CHANNELS.COMPOSE,
    targetApp: WORKSPACE_APP_CHANNELS.COMPOSE,
    action: 'TAB_SESSION_RESTORED',
    entityId: archiveId,
    delta: {
      archiveId,
      tabCount: found.tabCount,
      label: found.label
    },
    source: 'meneur_command_deck'
  });

  return { ...found };
}

/**
 * Reset service state for unit testing.
 */
export function resetMeneurDeckForTesting() {
  isFocusModeActiveState = true;
  customBlockedDomains = new Set(DEFAULT_DISTRACTING_DOMAINS);
  tabArchives = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(FOCUS_STORAGE_KEY);
      window.localStorage.removeItem(ARCHIVES_STORAGE_KEY);
    } catch (_) {}
  }
}

if (typeof window !== 'undefined') {
  window.__REGAARDER_MENEUR_DECK__ = {
    evaluateSiteFocusBlock,
    toggleFocusMode,
    setFocusModeRule,
    getFocusModeRule,
    getActiveBlockRules,
    captureWebDirective,
    archiveTabSession,
    restoreTabSession,
    listTabArchives,
    deleteTabArchive,
    resetMeneurDeckForTesting
  };
}

