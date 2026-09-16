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
 * Uses the sanitized title + document id so the file is immediately recognizable
 * to the user in Windows Explorer (e.g. "Project_Roadmap_abc-123.rgdoc").
 *
 * @param {object} doc
 * @returns {string}  e.g. "Project_Roadmap_abc-123.rgdoc"
 */
export const resolveFilename = (doc) => {
  const { ext } = MODE_MAP[doc.mode] || MODE_MAP.compose;
  const rawTitle = String(doc.title || doc.sheetsTitle || doc.deckTitle || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .slice(0, 80);
  
  const cleanTitle = rawTitle || 'Untitled Document';
  return `${cleanTitle}${ext}`;
};

/**
 * Derives the subdirectory for a given document mode.
 *
 * @param {object} doc
 * @returns {string}  e.g. "Documents"
 */
export const resolveSubdir = (doc) =>
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

  // Ensure current stored documents are written to disk upon app launch and clean up legacy suffixed files
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage?.getItem('regaarder_documents_v1') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((d) => writeDocumentToLocal(d));

        // Asynchronously clean up old suffixed files in the sync directories
        (async () => {
          try {
            const subdirs = ['Documents', 'Sheets', 'Decks', 'Whiteboards'];
            for (const subdir of subdirs) {
              const entries = await listLocalDir(subdir);
              for (const entry of entries) {
                // Match legacy files that had timestamps or legacy-document in filename
                if (/_\d{10,}\.(rgdoc|rgsht|rgdck|rgwbd)$/.test(entry.name) || /legacy-document/i.test(entry.name)) {
                  try {
                    await window.electronAPI.localSync.deleteFile({
                      subdir,
                      filename: entry.name,
                    });
                  } catch (_) {}
                }
              }
            }
          } catch (_) {}
        })();
      }
    }
  } catch (_) {}

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

// Tracks the last written { subdir, filename } per document id to remove obsolete files on rename/mode change
const _lastWrittenPaths = new Map();
// Per-document promise queue to guarantee sequential file operations without delete/write race conditions
const _docWriteQueues = new Map();

/**
 * Enqueues an async operation for a specific document to guarantee strict ordering.
 *
 * @param {string} docKey
 * @param {() => Promise<any>} task
 * @returns {Promise<any>}
 */
const _enqueueDocOperation = (docKey, task) => {
  const previousPromise = _docWriteQueues.get(docKey) || Promise.resolve();
  const nextPromise = previousPromise
    .catch(() => {}) // never fail chain
    .then(() => task());
  _docWriteQueues.set(docKey, nextPromise);
  nextPromise.finally(() => {
    if (_docWriteQueues.get(docKey) === nextPromise) {
      _docWriteQueues.delete(docKey);
    }
  });
  return nextPromise;
};

/**
 * Writes a single document to its canonical local file path.
 * Fire-and-forget — never throws to the caller.
 * Automatically cleans up any previously written file for this document if its title or mode changed.
 *
 * @param {object} doc  Normalized workspace document object.
 */
export const writeDocumentToLocal = (doc) => {
  if (!isLocalSyncAvailable() || !doc?.id) return;

  const subdir = resolveSubdir(doc);
  const filename = resolveFilename(doc);
  const content = serializeDocument(doc);
  const docKey = String(doc.id);

  _enqueueDocOperation(docKey, async () => {
    const previous = _lastWrittenPaths.get(docKey);
    if (previous && (previous.subdir !== subdir || previous.filename !== filename)) {
      try {
        await window.electronAPI.localSync.deleteFile({
          subdir: previous.subdir,
          filename: previous.filename,
        });
      } catch (err) {
        console.warn(`[LocalSync] Failed to cleanup old file ${previous.filename}:`, err);
      }
    }

    _lastWrittenPaths.set(docKey, { subdir, filename });

    try {
      const result = await window.electronAPI.localSync.writeFile({
        subdir,
        filename,
        content,
      });
      if (!result?.success) {
        console.warn(`[LocalSync] Write failed for ${filename}:`, result?.error);
      }
    } catch (err) {
      console.warn(`[LocalSync] IPC error writing ${filename}:`, err);
    }
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

  const docKey = String(doc.id);
  const tracked = _lastWrittenPaths.get(docKey);
  const subdir = tracked?.subdir || resolveSubdir(doc);
  const filename = tracked?.filename || resolveFilename(doc);
  _lastWrittenPaths.delete(docKey);

  _enqueueDocOperation(docKey, async () => {
    try {
      const result = await window.electronAPI.localSync.deleteFile({
        subdir,
        filename,
      });
      if (!result?.success && result?.error !== 'ENOENT') {
        console.warn(`[LocalSync] Delete failed for ${filename}:`, result?.error);
      }
    } catch (err) {
      console.warn(`[LocalSync] IPC error deleting ${filename}:`, err);
    }
  });
};

/**
 * Synchronizes an entire list of workspace documents directly to their local disk files.
 * Useful on editor flush, explicit save (Ctrl+S), or workspace load.
 *
 * @param {Array<object>} docs
 */
export const syncAllDocumentsToDisk = (docs = []) => {
  if (!Array.isArray(docs) || !isLocalSyncAvailable()) return;
  docs.filter(Boolean).forEach((doc) => writeDocumentToLocal(doc));
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

/**
 * Opens the Regaarder storage folder directly in the OS file explorer.
 *
 * @param {string} [subpath] Optional subfolder or specific path
 * @returns {Promise<boolean>}
 */
export const openLocalRegaarderFolder = async (subpath) => {
  if (typeof window === 'undefined' || !window.electronAPI) return false;
  try {
    const target = subpath || (await getLocalSyncRoot());
    if (typeof window.electronAPI.openFolder === 'function') {
      const res = await window.electronAPI.openFolder(target);
      return Boolean(res?.success);
    }
    if (typeof window.electronAPI.showItemInFolder === 'function') {
      const res = await window.electronAPI.showItemInFolder(target);
      return Boolean(res?.success);
    }
  } catch (err) {
    console.warn('[LocalSync] Failed to open local folder:', err);
  }
  return false;
};

/**
 * Reveals a document file in the native system file explorer (e.g. Windows Explorer),
 * selecting/highlighting the specific file.
 * Automatically ensures the file is flushed to disk before revealing.
 *
 * @param {object} doc Normalized document object or recent file item.
 * @returns {Promise<boolean>}
 */
export const revealDocumentInLocalFolder = async (doc) => {
  if (typeof window === 'undefined' || !window.electronAPI || !doc) return false;

  try {
    // Normalise doc object
    const actualDoc = doc.doc || doc;
    const root = await getLocalSyncRoot();
    if (!root) return false;

    // Determine subdir and filename
    const subdir = resolveSubdir(actualDoc);
    const filename = resolveFilename(actualDoc);

    // If local sync is available and doc has content/id, ensure latest copy exists on disk
    if (isLocalSyncAvailable() && actualDoc.id) {
      writeDocumentToLocal(actualDoc);
    }

    // Build the full platform-appropriate path
    const isWindows = root.includes('\\') || navigator.userAgent.includes('Windows');
    const separator = isWindows ? '\\' : '/';
    const fullPath = [root, subdir, filename].join(separator);

    if (typeof window.electronAPI.showItemInFolder === 'function') {
      const res = await window.electronAPI.showItemInFolder(fullPath);
      if (res?.success) return true;
    }

    // Fallback to opening folder if file show fails
    const folderPath = [root, subdir].join(separator);
    return await openLocalRegaarderFolder(folderPath);
  } catch (err) {
    console.warn('[LocalSync] Failed to reveal document in folder:', err);
    return false;
  }
};

/**
 * Reads and parses a local file from disk.
 *
 * @param {string} filePath
 * @returns {Promise<object|null>}
 */
export const readLocalFile = async (filePath) => {
  if (!isLocalSyncAvailable() || !filePath) return null;
  try {
    const result = await window.electronAPI.localSync.readFile({ filePath });
    if (result?.success && result.content) {
      return parseRegaarderFile(result.content, filePath);
    }
  } catch (err) {
    console.warn('[LocalSync] Error reading local file:', err);
  }
  return null;
};

/**
 * Parses raw file content into a normalized document payload.
 * Supports .rgdoc, .cmp, .rgsht, .rgdck, and .rgwbd JSON files.
 *
 * @param {string} content
 * @param {string} [sourcePath]
 * @returns {object|null}
 */
export const parseRegaarderFile = (content, sourcePath = '') => {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') return null;

    // Detect mode from extension or stored mode
    const ext = sourcePath ? sourcePath.slice(sourcePath.lastIndexOf('.')).toLowerCase() : '';
    let mode = parsed.mode;
    if (!mode) {
      if (ext === '.rgsht' || parsed.sheetsData || parsed.sheetGrids) mode = 'sheets';
      else if (ext === '.rgdck' || parsed.slides || parsed.deckSlidesData) mode = 'deck';
      else if (ext === '.rgwbd' || parsed.whiteboardWidgets || parsed.whiteboardShapes) mode = 'whiteboard';
      else mode = 'compose';
    }

    return {
      ...parsed,
      mode,
      localFilePath: sourcePath || parsed.localFilePath,
    };
  } catch (err) {
    console.warn('[LocalSync] Failed to parse Regaarder file:', err);
    return null;
  }
};
