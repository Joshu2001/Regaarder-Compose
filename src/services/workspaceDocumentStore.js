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
      || Array.isArray(document?.whiteboardWidgets)
      || Array.isArray(document?.whiteboardStrokes)
      || Array.isArray(document?.whiteboardShapes)
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
  const label = MODE_LABELS[mode] || MODE_LABELS.compose;
  return !String(title || '').trim() || new RegExp(`^${label}$`, 'i').test(String(title).trim());
};

export const normalizeWorkspaceDocuments = (documents = []) => {
  const source = Array.isArray(documents) ? documents.filter(Boolean) : [];
  const normalized = [];

  source.forEach((document, index) => {
    const mode = isLegacyWhiteboardRecord(document)
      ? 'whiteboard'
      : normalizeWorkspaceDocumentMode(document.mode);
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
  } catch (_) {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
  return normalized;
};
