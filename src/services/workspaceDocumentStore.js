import {
  writeDocumentToLocal,
  deleteDocumentFromLocal,
} from './localSyncService';

export const WORKSPACE_DOCUMENTS_STORAGE_KEY = 'regaarder_documents_v1';
export const WORKSPACE_DOCUMENT_MODES = ['compose', 'sheets', 'deck', 'whiteboard'];

const MODE_LABELS = {
  compose: 'Untitled Document',
  sheets: 'Untitled Sheet',
  deck: 'Untitled Deck',
  whiteboard: 'Untitled Whiteboard',
};

const isValidIsoDate = (value) => {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

export const normalizeWorkspaceDocumentMode = (mode) => (
  WORKSPACE_DOCUMENT_MODES.includes(mode) ? mode : 'compose'
);

const isLegacyWhiteboardRecord = (document) => {
  const title = String(document?.title || '').trim();
  return document?.mode === 'compose'
    && (
      /^untitled\s+whiteboard(?:\s+\d+)?$/i.test(title)
      || /^whiteboard\s+\d+$/i.test(title)
      || (Array.isArray(document?.whiteboardWidgets) && document.whiteboardWidgets.length > 0)
      || (Array.isArray(document?.whiteboardStrokes) && document.whiteboardStrokes.length > 0)
      || (Array.isArray(document?.whiteboardShapes) && document.whiteboardShapes.length > 0)
    );
};

const nextUntitledTitle = (mode, documents) => {
  const label = MODE_LABELS[mode] || MODE_LABELS.compose;
  const usedNumbers = documents
    .filter((document) => normalizeWorkspaceDocumentMode(document.mode) === mode)
    .map((document) => String(document.title || '').match(new RegExp(`^${label}\\s+(\\d+)$`, 'i')))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  return `${label} ${Math.max(0, ...usedNumbers) + 1}`;
};

const hasGeneratedTitle = (title, mode) => {
  const trimmed = String(title || '').trim();
  if (!trimmed) return true;
  const label = MODE_LABELS[mode] || MODE_LABELS.compose;
  if (new RegExp(`^${label}(?:\\s+\\d+)?$`, 'i').test(trimmed)) return true;
  // If a document in whiteboard, sheet, or deck mode has another mode's generic title (e.g. Untitled Document on whiteboard)
  if (/^untitled\s+(?:document|sheet|deck|whiteboard)(?:\s+\d+)?$/i.test(trimmed)) return true;
  return false;
};

export const normalizeWorkspaceDocuments = (documents = []) => {
  const source = Array.isArray(documents) ? documents.filter(Boolean) : [];
  const normalized = [];

  source.forEach((document, index) => {
    let mode = normalizeWorkspaceDocumentMode(document.mode);
    if (isLegacyWhiteboardRecord(document)) {
      mode = 'whiteboard';
    } else if (
      mode === 'whiteboard'
      && (!Array.isArray(document.whiteboardWidgets) || document.whiteboardWidgets.length === 0)
      && (!Array.isArray(document.whiteboardStrokes) || document.whiteboardStrokes.length === 0)
      && (!Array.isArray(document.whiteboardShapes) || document.whiteboardShapes.length === 0)
      && (
        !document.title
        || /^untitled\s+document/i.test(String(document.title).trim())
        || document.bodyHtml
      )
    ) {
      // Auto-heal documents that were falsely flipped to whiteboard by legacy empty array checks
      mode = 'compose';
    }
    const createdAt = isValidIsoDate(document.createdAt)
      ? document.createdAt
      : isValidIsoDate(document.updatedAt) ? document.updatedAt : new Date().toISOString();
    const updatedAt = isValidIsoDate(document.updatedAt) ? document.updatedAt : createdAt;
    const id = document.id !== undefined && document.id !== null && String(document.id).trim()
      ? document.id
      : `legacy-document-${index}-${createdAt}`;
    const titleField = mode === 'sheets' ? (document.sheetsTitle || document.title) : mode === 'deck' ? (document.deckTitle || document.title) : document.title;
    const title = hasGeneratedTitle(titleField, mode) ? nextUntitledTitle(mode, normalized) : String(titleField).trim();

    normalized.push({
      ...document,
      id,
      mode,
      type: mode,
      title,
      ...(mode === 'sheets' ? { sheetsTitle: title } : {}),
      ...(mode === 'deck' ? { deckTitle: title } : {}),
      createdAt,
      updatedAt,
      isDraft: Boolean(document.isDraft ?? document.isBlank),
    });
  });

  return normalized;
};

export const readWorkspaceDocuments = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WORKSPACE_DOCUMENTS_STORAGE_KEY);
    return normalizeWorkspaceDocuments(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return [];
  }
};

export const writeWorkspaceDocuments = (documents) => {
  const normalized = normalizeWorkspaceDocuments(documents);
  if (typeof window === 'undefined') return normalized;
  try {
    window.localStorage.setItem(WORKSPACE_DOCUMENTS_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('workspace-storage-update', {
      detail: { key: WORKSPACE_DOCUMENTS_STORAGE_KEY, documents: normalized },
    }));

    // Mirror every document to the local filesystem via the Electron IPC bridge.
    // This is fire-and-forget — failures are logged inside localSyncService and
    // never interrupt the primary localStorage persistence path.
    normalized.forEach((doc) => writeDocumentToLocal(doc));
  } catch (_) {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
  return normalized;
};

/**
 * Removes a single document from the workspace by id.
 * Deletes from localStorage AND from the local filesystem.
 *
 * @param {string} id  Document id to remove.
 * @returns {object[]}  The remaining normalized documents.
 */
export const deleteWorkspaceDocument = (id) => {
  const current = readWorkspaceDocuments();
  const target = current.find((doc) => doc.id === id);
  const remaining = current.filter((doc) => doc.id !== id);

  // Remove from the local filesystem before updating localStorage so that
  // any in-flight watcher events are for a file that still exists.
  if (target) {
    deleteDocumentFromLocal(target);
  }

  return writeWorkspaceDocuments(remaining);
};
