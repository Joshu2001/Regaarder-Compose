/**
 * localSyncService.js
 *
 * Renderer-side service that bridges Regaarder's localStorage document store
 * to the local filesystem via the Electron IPC localSync:* channel family.
 *
 * ~/Regaarder/
 *   Documents/    → .rgdoc  (compose)
 *   Sheets/       → .rgsht  (sheets)
 *   Decks/        → .rgdck  (deck)
 *   Whiteboards/  → .rgwbd  (whiteboard)
 *
 * All write operations are fire-and-forget from the caller's perspective.
 * Errors are swallowed internally and logged to the console so they can
 * never interrupt the primary localStorage save path.
 */

const SYNC_FORMAT_VERSION = 1;

/** Subdirectory and file-extension mapping per document mode. */
const MODE_MAP = {
  compose:    { subdir: 'Documents',   ext: '.rgdoc' },
  sheets:     { subdir: 'Sheets',      ext: '.rgsht' },
  deck:       { subdir: 'Decks',       ext: '.rgdck' },
  whiteboard: { subdir: 'Whiteboards', ext: '.rgwbd' },
};

// Active watcher teardown reference (returned by startWatch).
let _watcherTeardown = null;

// Inbound change callbacks registered by consumers.
const _inboundCallbacks = new Set();

// ─────────────────────────────────────────────────────────────────────────────
// Availability Guard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when the Electron localSync IPC bridge is present.
 * Gracefully degrades in pure browser / test contexts.
 */
export const isLocalSyncAvailable = () =>
  typeof window !== 'undefined' &&
  typeof window.electronAPI?.localSync?.writeFile === 'function';

// ─────────────────────────────────────────────────────────────────────────────
// Filename Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives a stable, filesystem-safe filename from a document.
 * Uses the document's `id` as the base so renames don't create orphan files.
 * The human-readable title is stored inside the JSON body, not in the filename.
 *
 * @param {object} doc
 * @returns {string}  e.g. "abc-123.rgdoc"
 */
const resolveFilename = (doc) => {
  const { ext } = MODE_MAP[doc.mode] || MODE_MAP.compose;
  // Sanitize id: strip characters that are illegal in Windows/macOS/Linux paths.
  const safeId = String(doc.id || 'unknown')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .slice(0, 200);
  return `${safeId}${ext}`;
};

/**
 * Derives the subdirectory for a given document mode.
 *
 * @param {object} doc
 * @returns {string}  e.g. "Documents"
 */
const resolveSubdir = (doc) =>
  (MODE_MAP[doc.mode] || MODE_MAP.compose).subdir;

// ─────────────────────────────────────────────────────────────────────────────
// Serialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serializes a workspace document to the canonical Regaarder file format.
 * Keeps all fields intact so the file is a complete, round-trippable snapshot.
 *
 * @param {object} doc
 * @returns {string}  Pretty-printed JSON
 */
const serializeDocument = (doc) => {
  const payload = {
    _regaarder: {
      version: SYNC_FORMAT_VERSION,
      app: 'Regaarder Compose',
      exportedAt: new Date().toISOString(),
    },
    ...doc,
  };
  return JSON.stringify(payload, null, 2);
};

// ─────────────────────────────────────────────────────────────────────────────
// Initialization & Teardown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bootstraps local sync on app launch:
 *  1. Ensures ~/Regaarder/{Documents,Sheets,Decks,Whiteboards}/ exist.
 *  2. Starts an fs.watch watcher for inbound change detection.
 *
 * Safe to call multiple times — idempotent.
 */
export const initLocalSync = async () => {
  if (!isLocalSyncAvailable()) {
    console.info('[LocalSync] Electron IPC bridge not available — local sync inactive.');
    return;
  }

  try {
    const dirsResult = await window.electronAPI.localSync.ensureDirs();
    if (dirsResult?.success) {
      console.info(`[LocalSync] Sync root ready: ${dirsResult.root}`);
    } else {
      console.warn('[LocalSync] ensureDirs warning:', dirsResult?.error);
    }
  } catch (err) {
    console.warn('[LocalSync] Could not ensure local directories:', err);
  }

  await _startWatcher();
};

/**
 * Tears down the file watcher and removes all IPC listeners.
 * Called on app unmount.
 */
export const teardownLocalSync = async () => {
  if (!isLocalSyncAvailable()) return;

  if (typeof _watcherTeardown === 'function') {
    _watcherTeardown();
    _watcherTeardown = null;
  }

  try {
    await window.electronAPI.localSync.stopWatch();
  } catch (_) {
    // Watcher may already be stopped.
  }

  window.electronAPI.localSync.offFileChanged?.();
  _inboundCallbacks.clear();
};

// ─────────────────────────────────────────────────────────────────────────────
// File Watcher (private)
// ─────────────────────────────────────────────────────────────────────────────

const _startWatcher = async () => {
  if (!isLocalSyncAvailable()) return;

  try {
    // Register the renderer-side listener for events pushed from the main process.
    const teardown = window.electronAPI.localSync.onFileChanged((event) => {
      console.info(`[LocalSync] Inbound file change: ${event.eventType} → ${event.filePath}`);
      _inboundCallbacks.forEach((cb) => {
        try { cb(event); } catch (_) {}
      });
    });
    _watcherTeardown = typeof teardown === 'function' ? teardown : null;

    // Tell the main process to activate the native fs.watch.
    await window.electronAPI.localSync.startWatch();
    console.info('[LocalSync] File watcher active.');
  } catch (err) {
    console.warn('[LocalSync] Could not start file watcher:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Public Write API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Writes a single document to its canonical local file path.
 * Fire-and-forget — never throws to the caller.
 *
 * @param {object} doc  Normalized workspace document object.
 */
export const writeDocumentToLocal = (doc) => {
  if (!isLocalSyncAvailable() || !doc?.id) return;

  const subdir = resolveSubdir(doc);
  const filename = resolveFilename(doc);
  const content = serializeDocument(doc);

  window.electronAPI.localSync
    .writeFile({ subdir, filename, content })
    .then((result) => {
      if (!result?.success) {
        console.warn(`[LocalSync] Write failed for ${filename}:`, result?.error);
      }
    })
    .catch((err) => {
      console.warn(`[LocalSync] IPC error writing ${filename}:`, err);
    });
};

/**
 * Deletes a document's local file when it is removed from the workspace.
 * Fire-and-forget — never throws to the caller.
 *
 * @param {object} doc  The document being deleted.
 */
export const deleteDocumentFromLocal = (doc) => {
  if (!isLocalSyncAvailable() || !doc?.id) return;

  const subdir = resolveSubdir(doc);
  const filename = resolveFilename(doc);

  window.electronAPI.localSync
    .deleteFile({ subdir, filename })
    .then((result) => {
      // ENOENT means the file was never written — treat as success.
      if (!result?.success && result?.error !== 'ENOENT') {
        console.warn(`[LocalSync] Delete failed for ${filename}:`, result?.error);
      }
    })
    .catch((err) => {
      console.warn(`[LocalSync] IPC error deleting ${filename}:`, err);
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Public Read & Utility API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the absolute path of the Regaarder sync root (~/Regaarder).
 *
 * @returns {Promise<string|null>}
 */
export const getLocalSyncRoot = async () => {
  if (!isLocalSyncAvailable()) return null;
  try {
    const result = await window.electronAPI.localSync.getRoot();
    return result?.root ?? null;
  } catch (_) {
    return null;
  }
};

/**
 * Lists files in a given sync subdirectory.
 *
 * @param {'Documents'|'Sheets'|'Decks'|'Whiteboards'} subdir
 * @returns {Promise<Array<{ name: string, mtime: string, size: number }>>}
 */
export const listLocalDir = async (subdir) => {
  if (!isLocalSyncAvailable()) return [];
  try {
    const result = await window.electronAPI.localSync.listDir(subdir);
    return result?.entries ?? [];
  } catch (_) {
    return [];
  }
};

/**
 * Registers a callback for inbound file change events from the OS watcher.
 * Useful for future reconciliation UI (e.g., "File updated externally" banner).
 *
 * @param {function({ eventType: string, filePath: string }): void} callback
 * @returns {function}  Teardown function to remove the callback.
 */
export const onInboundFileChange = (callback) => {
  _inboundCallbacks.add(callback);
  return () => _inboundCallbacks.delete(callback);
};
