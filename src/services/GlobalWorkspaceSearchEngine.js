/**
 * GlobalWorkspaceSearchEngine.js
 * 
 * Unified cross-workspace search index, discovery, and AI synthesis engine for Regaarder.
 * Indexes real Documents, Sheets, Presentations/Decks, Tasks, Rooms/Meetings,
 * Notes/Room Notes, Relay Messages, Whiteboards, Comments, Chats, Schedule, and People.
 */

// Helper to strip HTML tags for plain text indexing
export function stripHtml(html = '') {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate contextual snippet around matched terms
export function extractSnippet(text = '', query = '', snippetLength = 140) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!query) {
    return clean.length > snippetLength ? clean.slice(0, snippetLength) + '…' : clean;
  }

  const lowerText = clean.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIdx = lowerText.indexOf(lowerQuery);

  if (matchIdx === -1) {
    return clean.length > snippetLength ? clean.slice(0, snippetLength) + '…' : clean;
  }

  const half = Math.floor(snippetLength / 2);
  let start = Math.max(0, matchIdx - half);
  let end = Math.min(clean.length, matchIdx + lowerQuery.length + half);

  // Adjust to word boundaries if possible
  if (start > 0) {
    const spaceIdx = clean.indexOf(' ', start);
    if (spaceIdx !== -1 && spaceIdx < matchIdx) {
      start = spaceIdx + 1;
    }
  }
  if (end < clean.length) {
    const spaceIdx = clean.lastIndexOf(' ', end);
    if (spaceIdx !== -1 && spaceIdx > matchIdx + lowerQuery.length) {
      end = spaceIdx;
    }
  }

  const snippet = clean.slice(start, end).trim();
  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return `${prefix}${snippet}${suffix}`;
}

// Helper to reliably format temporal metadata for searchable index & AI reasoning
export function formatTemporalMetadata(rawDate) {
  let d = new Date();
  if (rawDate) {
    if (typeof rawDate === 'number' && !isNaN(rawDate)) {
      d = new Date(rawDate);
    } else if (typeof rawDate === 'string' && rawDate.trim()) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
  }
  const iso = d.toISOString();
  const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { iso, formattedDate, formattedTime, fullText: `${formattedDate} at ${formattedTime}` };
}

// Pre-populated Quick Action Launchers
export const QUICK_ACTIONS = [
  { id: 'action-new-doc', type: 'action', workspace: 'compose', title: 'New Document', subtitle: 'Open a blank distraction-free Compose document', targetWorkspace: 'compose', shortcut: '⌘N', actionType: 'new_doc' },
  { id: 'action-new-sheet', type: 'action', workspace: 'sheets', title: 'New Spreadsheet', subtitle: 'Build a financial model or data calculation grid', targetWorkspace: 'sheets', shortcut: '⌘⇧S', actionType: 'new_sheet' },
  { id: 'action-new-deck', type: 'action', workspace: 'deck', title: 'New Presentation', subtitle: 'Design an executive slide deck with AI intelligence', targetWorkspace: 'deck', shortcut: '⌘⇧P', actionType: 'new_deck' },
  { id: 'action-new-room', type: 'action', workspace: 'room', title: 'Add New Meeting', subtitle: 'Host an ambient video call with live transcription', targetWorkspace: 'room', shortcut: '⌘M', actionType: 'new_meeting' },
  { id: 'action-new-message', type: 'action', workspace: 'relay', title: 'New Message', subtitle: 'Send a message or start a conversation in Relay', targetWorkspace: 'dm', shortcut: '⌘⇧M', actionType: 'new_message' },
  { id: 'action-new-task', type: 'action', workspace: 'tasks', title: 'Create New Task', subtitle: 'Add a project milestone or team action item', targetWorkspace: 'tasks', shortcut: '⌘T', actionType: 'new_task' }
];

/**
 * Intelligently resolves workspace type and category based on entity title, type, and active mode.
 */
export function resolveWorkspaceForEntity(title = '', type = '', explicitWorkspace = '') {
  const tLower = (title || '').toLowerCase();
  const typeLower = (type || '').toLowerCase();
  const explicitLower = (explicitWorkspace || '').toLowerCase();

  if (explicitLower === 'compose' || explicitLower === 'docs' || explicitLower === 'document' || explicitLower === 'documents' || explicitLower === 'doc' || explicitLower === 'docx' || explicitLower === 'pdf') {
    return {
      workspace: 'compose',
      type: 'document',
      prefix: 'Compose'
    };
  }

  if (explicitLower === 'deck' || explicitLower === 'decks' || explicitLower === 'presentation' || explicitLower === 'presentations' || explicitLower === 'slide' || explicitLower === 'slides' || explicitLower === 'ppt' || explicitLower === 'pptx') {
    return {
      workspace: 'deck',
      type: 'deck',
      prefix: 'Deck'
    };
  }

  if (explicitLower === 'sheets' || explicitLower === 'sheet' || explicitLower === 'spreadsheet' || explicitLower === 'spreadsheets' || explicitLower === 'workbook' || explicitLower === 'excel') {
    return {
      workspace: 'sheets',
      type: 'sheet',
      prefix: 'Sheets'
    };
  }

  if (explicitLower === 'whiteboard') {
    return {
      workspace: 'whiteboard',
      type: 'whiteboard',
      prefix: 'Whiteboard'
    };
  }

  if (explicitLower === 'room') {
    return {
      workspace: 'room',
      type: 'meeting',
      prefix: 'Room'
    };
  }

  if (explicitLower === 'notes') {
    return {
      workspace: 'notes',
      type: 'room_note',
      prefix: 'Notes'
    };
  }

  if (explicitLower === 'relay' || explicitLower === 'dm' || explicitLower === 'message') {
    return {
      workspace: 'relay',
      type: 'message',
      prefix: 'Relay'
    };
  }

  if (explicitLower === 'tasks') {
    return {
      workspace: 'tasks',
      type: 'task',
      prefix: 'Tasks'
    };
  }

  if (explicitLower === 'comments' || explicitLower === 'comment') {
    return {
      workspace: 'comments',
      type: 'comment',
      prefix: 'Comments'
    };
  }

  if (explicitLower === 'chat' || explicitLower === 'chats' || explicitLower === 'assistant') {
    return {
      workspace: 'chat',
      type: 'chat',
      prefix: 'Chats'
    };
  }

  if (explicitLower === 'schedule' || explicitLower === 'calendar') {
    return {
      workspace: 'schedule',
      type: 'schedule_event',
      prefix: 'Schedule'
    };
  }

  if (explicitLower === 'browser-history') {
    return {
      workspace: 'browser-history',
      type: 'browser_history',
      prefix: 'Browser History'
    };
  }

  if (explicitLower === 'browser' || explicitLower === 'research') {
    return {
      workspace: 'browser',
      type: 'research_note',
      prefix: 'Research'
    };
  }

  if (explicitLower === 'people') {
    return {
      workspace: 'people',
      type: 'person',
      prefix: 'People'
    };
  }

  if (
    typeLower === 'deck' ||
    typeLower === 'slide' ||
    typeLower === 'slides' ||
    tLower.includes('deck') ||
    tLower.includes('presentation') ||
    tLower.includes('slides')
  ) {
    return {
      workspace: 'deck',
      type: 'deck',
      prefix: 'Deck'
    };
  }

  if (
    typeLower === 'sheet' ||
    typeLower === 'sheets' ||
    tLower.includes('sheet') ||
    tLower.includes('spreadsheet') ||
    tLower.includes('revenue model') ||
    tLower.includes('financial model')
  ) {
    return {
      workspace: 'sheets',
      type: 'sheet',
      prefix: 'Sheets'
    };
  }

  if (
    typeLower === 'whiteboard' ||
    tLower.includes('whiteboard')
  ) {
    return {
      workspace: 'whiteboard',
      type: 'whiteboard',
      prefix: 'Whiteboard'
    };
  }

  if (
    typeLower === 'meeting' ||
    typeLower === 'room' ||
    tLower.includes('room') ||
    tLower.includes('meeting') ||
    tLower.includes('sync')
  ) {
    return {
      workspace: 'room',
      type: 'meeting',
      prefix: 'Room'
    };
  }

  if (
    typeLower === 'room_note' ||
    typeLower === 'meeting_note' ||
    tLower.includes('room note')
  ) {
    return {
      workspace: 'notes',
      type: 'room_note',
      prefix: 'Notes'
    };
  }

  if (
    typeLower === 'task' ||
    tLower.includes('task') ||
    tLower.includes('initiative')
  ) {
    return {
      workspace: 'tasks',
      type: 'task',
      prefix: 'Tasks'
    };
  }

  if (
    typeLower === 'message' ||
    typeLower === 'relay' ||
    tLower.includes('message')
  ) {
    return {
      workspace: 'relay',
      type: 'message',
      prefix: 'Relay'
    };
  }

  if (
    typeLower === 'person'
  ) {
    return {
      workspace: 'people',
      type: 'person',
      prefix: 'People'
    };
  }

  return {
    workspace: 'compose',
    type: 'document',
    prefix: 'Compose'
  };
}

/**
 * Builds a unified index of real workspace entities strictly from live app state.
 * Returns only genuine user-created documents, sheets, slides, tasks, rooms, room notes,
 * relay messages, whiteboards, comments, chats, schedule, and people.
 * Filters out all blank, initial template, untitled placeholders, and dummy/stale data.
 */
export function buildWorkspaceIndex(context = {}) {
  const items = [];

  // Only known demo/stale records are excluded. Untitled artifacts are real files.
  const placeholderTitles = new Set([
    'beta launch',
    'creator outreach',
    'product hunt launch',
    'paid campaigns'
  ]);

  const isStaleOrDummyDoc = (title = '') => {
    const t = String(title).toLowerCase().trim();
    if (!t) return true;
    if (placeholderTitles.has(t)) return true;
    if (t.includes('woodgyna') || t.includes('lettre de motivation') || t.startsWith('cv de')) return true;
    return false;
  };

  const isRealTitle = (title) => {
    if (!title || typeof title !== 'string') return false;
    const lower = title.trim().toLowerCase();
    return lower.length > 0 && !isStaleOrDummyDoc(lower);
  };

  // Extract searchable text tokens from spreadsheet grids
  const extractTextFromGrid = (grids) => {
    if (!grids || typeof grids !== 'object') return '';
    const tokens = [];
    for (const gridId of Object.keys(grids)) {
      const g = grids[gridId];
      if (g && Array.isArray(g.cells)) {
        for (const row of g.cells) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              if (cell !== undefined && cell !== null && String(cell).trim()) {
                tokens.push(String(cell).trim());
              }
            }
          }
        }
      }
    }
    return tokens.slice(0, 300).join(' ');
  };

  // Extract searchable text from presentation slides
  const extractTextFromSlides = (slides) => {
    if (!Array.isArray(slides)) return '';
    return slides
      .map((s, idx) => `Slide ${idx + 1}: ${s.title || ''} ${s.subtitle || ''} ${s.content || ''}`)
      .filter(Boolean)
      .join('. ');
  };

  const activeDocId = context.activeDocId;
  const currentDocTitle = (context.docTitle || '').trim();
  const currentDocSubtitle = (context.docSubtitle || '').trim();
  const currentDocBodyHtml = (context.docBodyHtml || '').trim();
  const currentProductMode = (context.productMode || '').toLowerCase();
  const currentPlainText = stripHtml(currentDocBodyHtml).trim();

  // 1. All created documents, including blank and currently open artifacts.
  const sourceDocs = Array.isArray(context.documents) ? context.documents.filter(Boolean) : [];
  const openDocs = sourceDocs.map((doc) => {
    if (String(doc.id) !== String(activeDocId)) return doc;
    return {
      ...doc,
      title: currentProductMode === 'sheets' ? (context.sheetsTitle || doc.sheetsTitle || doc.title) : currentProductMode === 'deck' ? (context.deckTitle || doc.deckTitle || doc.title) : (currentDocTitle || doc.title),
      subtitle: currentDocSubtitle || doc.subtitle,
      bodyHtml: currentDocBodyHtml || doc.bodyHtml,
      sheetsTitle: context.sheetsTitle || doc.sheetsTitle,
      sheetsData: context.sheetsData || doc.sheetsData,
      sheetGrids: context.sheetGrids || doc.sheetGrids,
      activeSheetId: context.activeSheetId || doc.activeSheetId,
      deckTitle: context.deckTitle || doc.deckTitle,
      deckSlidesData: context.deckSlidesData || doc.deckSlidesData,
      activeDeckSlideId: context.activeDeckSlideId || doc.activeDeckSlideId,
      updatedAt: context.updatedAt || doc.updatedAt,
      createdAt: doc.createdAt || context.createdAt
    };
  });

  const untitledCounts = { document: 0, sheet: 0, deck: 0, whiteboard: 0 };
  const nextUntitledTitle = (kind) => {
    untitledCounts[kind] += 1;
    const labels = {
      document: 'Untitled Document',
      sheet: 'Untitled Sheet',
      deck: 'Untitled Deck',
      whiteboard: 'Untitled Whiteboard'
    };
    return `${labels[kind]} ${untitledCounts[kind]}`;
  };

  // 1a. Index Currently Open Document / Sheet / Deck
  const activeSourceDoc = openDocs.find((doc) => String(doc.id) === String(activeDocId));
  if (false && activeDocId) {
    const temporal = formatTemporalMetadata(activeSourceDoc?.updatedAt || activeSourceDoc?.createdAt || context.updatedAt || context.createdAt);
    const createdAt = activeSourceDoc?.createdAt || context.createdAt || temporal.iso;
    if (currentProductMode === 'sheets') {
      const activeSheetRawTitle = (context.sheetsTitle || activeSourceDoc?.sheetsTitle || currentDocTitle || activeSourceDoc?.title || '').trim();
      const activeSheetTitle = isRealTitle(activeSheetRawTitle) ? activeSheetRawTitle : nextUntitledTitle('sheet');
      const gridText = extractTextFromGrid(context.sheetGrids);
      items.push({
        id: `sheet-active-${activeDocId}`,
        type: 'sheet',
        resourceType: 'sheet',
        workspace: 'sheets',
        title: activeSheetTitle,
        subtitle: 'Spreadsheet Calculation Grid',
        location: `Sheets > ${activeSheetTitle}`,
        content: gridText || 'Active spreadsheet calculations and cell data.',
        rawHtml: '',
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          sheetId: context.activeSheetId,
          deepLink: `sheets://${activeDocId}`,
          isCurrent: true,
          createdAt,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'sheet_calculation'
        }
      });
    } else if (currentProductMode === 'deck') {
      const activeDeckRawTitle = (context.deckTitle || activeSourceDoc?.deckTitle || currentDocTitle || activeSourceDoc?.title || '').trim();
      const activeDeckTitle = isRealTitle(activeDeckRawTitle) ? activeDeckRawTitle : nextUntitledTitle('deck');
      const slides = context.deckSlidesData || [];
      const deckText = extractTextFromSlides(slides);
      items.push({
        id: `deck-active-${context.activeDeckSlideId || activeDocId}`,
        type: 'deck',
        resourceType: 'deck',
        workspace: 'deck',
        title: activeDeckTitle,
        subtitle: `Presentation (${slides.length > 0 ? slides.length : 1} Slides)`,
        location: `Deck > ${activeDeckTitle}`,
        content: deckText || 'Active presentation deck.',
        rawHtml: '',
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          slideCount: slides.length,
          deepLink: `deck://${activeDocId}`,
          isCurrent: true,
          createdAt,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'presentation'
        }
      });
    } else {
      let titleToUse = currentDocTitle || activeSourceDoc?.title || '';
      if (!isRealTitle(titleToUse)) titleToUse = nextUntitledTitle('document');

      const activeRes = resolveWorkspaceForEntity(titleToUse, '', currentProductMode || 'compose');
      items.push({
        id: `doc-active-${activeDocId}`,
        type: activeRes.type,
        resourceType: 'document',
        workspace: activeRes.workspace,
        title: titleToUse,
        subtitle: currentDocSubtitle || `Currently open in ${activeRes.prefix}`,
        location: `${activeRes.prefix} > ${titleToUse}`,
        content: currentPlainText || 'Active document workspace.',
        rawHtml: currentDocBodyHtml,
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          deepLink: `compose://${activeDocId}`,
          isCurrent: true,
          createdAt,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'document_edit'
        }
      });
    }
  }

  // 1b. Index Other Real Saved Documents & Workbooks in context.documents
  openDocs.forEach((doc, idx) => {
    const isSheets = doc.mode === 'sheets';
    const isDeck = doc.mode === 'deck';
    const isWhiteboard = doc.mode === 'whiteboard'
      || (doc.mode === 'compose' && (
        /^untitled\s+whiteboard(?:\s+\d+)?$/i.test(String(doc.title || '').trim())
        || (Array.isArray(doc.whiteboardWidgets) && doc.whiteboardWidgets.length > 0)
        || (Array.isArray(doc.whiteboardStrokes) && doc.whiteboardStrokes.length > 0)
        || (Array.isArray(doc.whiteboardShapes) && doc.whiteboardShapes.length > 0)
      ));
    const temporal = formatTemporalMetadata(doc.updatedAt || doc.savedAt || doc.createdAt);

    if (isSheets) {
      let rawTitle = (doc.sheetsTitle || doc.title || '').trim();
      const gridText = extractTextFromGrid(doc.sheetGrids);
      const sheetCount = doc.sheetsData?.length || 1;

      if (!rawTitle || isStaleOrDummyDoc(rawTitle)) {
        if (gridText && gridText.length > 3) {
          const firstWord = gridText.split(/\s+/).slice(0, 4).join(' ');
          rawTitle = `Sheet: ${firstWord}`;
        } else {
          rawTitle = nextUntitledTitle('sheet');
        }
      }

      items.push({
        id: `sheet-${doc.id || idx}`,
        type: 'sheet',
        resourceType: 'sheet',
        workspace: 'sheets',
        editorTarget: 'sheets',
        title: rawTitle,
        subtitle: `Spreadsheet (${sheetCount} Sheet${sheetCount > 1 ? 's' : ''})`,
        location: `Sheets > ${rawTitle}`,
        content: gridText || 'Spreadsheet calculation workbook and data models.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        metadata: {
          docId: doc.id,
          sheetId: doc.activeSheetId || 1,
          sheetCount,
          deepLink: `sheets://${doc.id}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'sheet_calculation'
        }
      });
    } else if (isDeck) {
      let rawTitle = (doc.deckTitle || doc.title || '').trim();
      const slides = doc.deckSlidesData || [];
      const deckText = extractTextFromSlides(slides);
      const slideCount = slides.length || 1;

      if (!rawTitle || isStaleOrDummyDoc(rawTitle)) {
        const firstSlideTitle = slides.find(s => s.title && s.title.trim())?.title?.trim();
        if (firstSlideTitle) {
          rawTitle = firstSlideTitle;
        } else {
          rawTitle = nextUntitledTitle('deck');
        }
      }

      items.push({
        id: `deck-${doc.id || idx}`,
        type: 'deck',
        resourceType: 'deck',
        workspace: 'deck',
        editorTarget: 'deck',
        title: rawTitle,
        subtitle: `Presentation (${slideCount} Slide${slideCount > 1 ? 's' : ''})`,
        location: `Deck > ${rawTitle}`,
        content: deckText || 'Presentation slides and speaker notes.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        metadata: {
          docId: doc.id,
          slideCount,
          deepLink: `deck://${doc.id}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'presentation'
        }
      });
    } else if (isWhiteboard) {
      const rawTitle = (doc.title || '').trim() || nextUntitledTitle('whiteboard');
      items.push({
        id: `whiteboard-${doc.id || idx}`,
        type: 'whiteboard',
        resourceType: 'whiteboard',
        workspace: 'whiteboard',
        editorTarget: 'whiteboard',
        title: rawTitle || `Whiteboard ${idx + 1}`,
        subtitle: 'Visual Infinite Canvas',
        location: `Whiteboard > ${rawTitle || `Whiteboard ${idx + 1}`}`,
        content: 'Whiteboard diagrams, sticky notes, and visual mind maps.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        metadata: {
          docId: doc.id,
          deepLink: `whiteboard://${doc.id}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'whiteboard'
        }
      });
    } else {
      const plainText = stripHtml(doc.bodyHtml || doc.content || doc.docBodyHtml || '').trim();
      let rawTitle = (doc.title || doc.docTitle || '').trim();

      if (!isRealTitle(rawTitle) && plainText) {
        const firstLine = plainText.split(/\n+/)[0]?.trim();
        if (firstLine && firstLine.length > 2 && firstLine.length < 90 && !isStaleOrDummyDoc(firstLine)) {
          rawTitle = firstLine;
        }
      }

      if (!rawTitle || isStaleOrDummyDoc(rawTitle)) rawTitle = nextUntitledTitle('document');

      const effectiveTitle = rawTitle;
      const docRes = {
        workspace: 'compose',
        type: 'document',
        prefix: 'Compose'
      };
      items.push({
        id: `doc-${doc.id || idx}`,
        type: docRes.type,
        resourceType: 'document',
        workspace: docRes.workspace,
        editorTarget: 'compose',
        title: effectiveTitle,
        subtitle: doc.subtitle || `${docRes.prefix} File`,
        location: `${docRes.prefix} > ${effectiveTitle}`,
        content: plainText || 'Document file.',
        rawHtml: doc.bodyHtml || doc.docBodyHtml || '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        metadata: {
          docId: doc.id,
          deepLink: `compose://${doc.id}`,
          docSnapshot: doc,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'document_edit'
        }
      });
    }
  });

  // 2. Real Tasks & Action Items
  const tasks = context.tasks || [];
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasks.forEach((t) => {
      const taskTitle = (t.title || t.name || '').trim();
      if (!isRealTitle(taskTitle)) return;
      const temporal = formatTemporalMetadata(t.updatedAt || t.due || t.createdAt);
      items.push({
        id: `task-${t.id || taskTitle}`,
        type: 'task',
        resourceType: 'task',
        workspace: 'tasks',
        title: taskTitle,
        subtitle: `${t.assignee || t.owner || 'Unassigned'} • ${t.priority || 'Normal'} Priority • ${t.status || 'Active'}`,
        location: `Tasks > ${t.project || 'Initiatives'}`,
        content: `${t.description || taskTitle}. Due date: ${t.due || t.timeline || 'Upcoming'}. Status: ${t.status || 'Active'}. Assignee: ${t.assignee || t.owner || 'Team'}.`,
        author: t.assignee || t.owner || 'Assigned',
        authorRole: t.tag || 'Deliverable',
        updatedAt: t.due ? `Due ${t.due}` : temporal.fullText,
        metadata: {
          taskId: t.id,
          priority: t.priority,
          status: t.status,
          assignee: t.assignee || t.owner,
          progress: t.progress,
          deepLink: `tasks://${t.id}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'task_status'
        }
      });
    });
  }

  // 3. Real Rooms / Meetings
  const rooms = context.rooms || (typeof window !== 'undefined' && window.__REGAARDER_ROOMS__) || [];
  if (Array.isArray(rooms) && rooms.length > 0) {
    rooms.forEach((r) => {
      const roomTitle = (r.title || '').trim();
      if (!isRealTitle(roomTitle)) return;
      const roomTranscript = (r.transcript || r.content || '').trim();
      const temporal = formatTemporalMetadata(r.updatedAt || r.startedAt || r.createdAt);
      items.push({
        id: `room-${r.id || roomTitle}`,
        type: 'meeting',
        resourceType: 'meeting',
        workspace: 'room',
        title: roomTitle,
        subtitle: r.subtitle || 'Active Meeting Room',
        location: `Room > ${roomTitle}`,
        content: roomTranscript || 'Meeting room session.',
        author: r.host || 'You',
        authorRole: 'Host',
        updatedAt: r.status === 'active' ? 'Active now' : temporal.fullText,
        metadata: {
          roomId: r.id,
          deepLink: `room://${r.id || roomTitle}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'meeting'
        }
      });

      if (roomTranscript) {
        items.push({
          id: `room-note-${r.id || roomTitle}`,
          type: 'room_note',
          resourceType: 'room_note',
          workspace: 'notes',
          title: `${roomTitle} Notes`,
          subtitle: 'Room notes and meeting transcript summary',
          location: `Room Notes > ${roomTitle}`,
          content: roomTranscript,
          author: r.host || 'You',
          authorRole: 'Host',
          updatedAt: temporal.fullText,
          metadata: {
            roomId: r.id,
            sourceRoomTitle: roomTitle,
            deepLink: `room://${r.id || roomTitle}/notes`,
            createdAt: temporal.iso,
            modifiedAt: temporal.iso,
            activityAt: temporal.iso,
            formattedDate: temporal.formattedDate,
            formattedTime: temporal.formattedTime,
            activityType: 'room_note'
          }
        });
      }
    });
  }

  // 4. Notes: Room Notes ONLY (notes created inside Room)
  const roomNotes = [];
  if (Array.isArray(context.roomNotes)) roomNotes.push(...context.roomNotes);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawRoomNotes = localStorage.getItem('regaarder_room_notes_v1');
      if (rawRoomNotes) {
        const parsed = JSON.parse(rawRoomNotes);
        if (Array.isArray(parsed)) roomNotes.push(...parsed);
      }
    } catch (_) {}
  }
  if (roomNotes.length > 0) {
    const seenNotes = new Set();
    roomNotes.forEach((note, index) => {
      const noteTitle = (note.title || note.name || '').trim();
      const content = (note.content || note.text || note.summary || '').trim();
      const roomTitle = note.roomTitle || note.sourceRoomTitle || note.meetingTitle || 'Meeting';
      if (!noteTitle && !content) return;
      const noteKey = String(note.id || `${roomTitle}-${index}`);
      if (seenNotes.has(noteKey)) return;
      seenNotes.add(noteKey);

      const temporal = formatTemporalMetadata(note.updatedAt || note.activityAt || note.createdAt);
      items.push({
        id: `room-note-${note.id || index}`,
        type: 'room_note',
        resourceType: 'room_note',
        workspace: 'notes',
        title: noteTitle || `${roomTitle} Notes`,
        subtitle: 'Room meeting note',
        location: `Room Notes > ${roomTitle}`,
        content: content || 'Room discussion notes and action items.',
        author: note.author || 'You',
        authorRole: 'Contributor',
        updatedAt: temporal.fullText,
        metadata: {
          roomId: note.roomId,
          sourceRoomTitle: roomTitle,
          deepLink: `room://notes/${note.id || index}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'room_note'
        }
      });
    });
  }

  // 5. Relay: Messages ONLY (workspace messaging layer)
  const relayThreads = [];
  if (Array.isArray(context.relayMessages)) relayThreads.push(...context.relayMessages);
  if (Array.isArray(context.directMessages)) relayThreads.push(...context.directMessages);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedDm = JSON.parse(localStorage.getItem('regaarder_executive_dm_conversations_v1') || '[]');
      if (Array.isArray(storedDm)) relayThreads.push(...storedDm);
    } catch (_) {}
  }
  if (relayThreads.length > 0) {
    const seenRelay = new Set();
    relayThreads.forEach((conv, idx) => {
      const contactName = conv.contactName || conv.name || conv.title || conv.recipient || `Conversation ${idx + 1}`;
      const convId = conv.id || conv.contactId || `dm-${idx}`;
      if (seenRelay.has(String(convId))) return;
      seenRelay.add(String(convId));

      const messages = Array.isArray(conv.messages) ? conv.messages : [];
      const msgText = messages.map(m => `${m.sender || m.author || 'Member'}: ${m.text || m.content || ''}`).join('\n');
      const content = [conv.lastMessage || conv.preview || '', msgText].filter(Boolean).join('\n').trim();
      if (!content && !conv.contactName) return;

      const temporal = formatTemporalMetadata(conv.updatedAt || conv.timestamp || (messages[messages.length - 1]?.timestamp));
      items.push({
        id: `relay-${convId}`,
        type: 'message',
        resourceType: 'message',
        workspace: 'relay',
        title: contactName,
        subtitle: conv.role ? `${conv.role} • Direct Message` : 'Relay Direct Message',
        location: `Relay > ${contactName}`,
        content: content || 'Direct message conversation.',
        author: contactName,
        authorRole: 'Messaging',
        updatedAt: temporal.fullText,
        metadata: {
          contactId: conv.contactId || convId,
          deepLink: `relay://${conv.contactId || convId}`,
          messageCount: messages.length,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'message'
        }
      });
    });
  }

  // 6. Whiteboards: first-class indexed resource
  const whiteboardRecords = [];
  if (Array.isArray(context.whiteboards)) whiteboardRecords.push(...context.whiteboards);
  if (Array.isArray(context.whiteboardWidgets) && context.whiteboardWidgets.length > 0) {
    whiteboardRecords.push({
      id: 'whiteboard-live',
      title: context.whiteboardTitle || 'Whiteboard',
      content: context.whiteboardWidgets.map(w => w.title || w.text || w.body || '').filter(Boolean).join('\n'),
      updatedAt: 'Just now'
    });
  }
  if (whiteboardRecords.length > 0) {
    const seenBoards = new Set();
    whiteboardRecords.forEach((board, idx) => {
      const boardTitle = (board.title || board.name || '').trim() || `Whiteboard ${idx + 1}`;
      const boardId = board.id || boardTitle || `wb-${idx}`;
      if (seenBoards.has(String(boardId))) return;
      seenBoards.add(String(boardId));

      const boardContent = [board.content || '', board.summary || '', board.description || ''].filter(Boolean).join('\n');
      const temporal = formatTemporalMetadata(board.updatedAt || board.createdAt);
      items.push({
        id: `whiteboard-${boardId}`,
        type: 'whiteboard',
        resourceType: 'whiteboard',
        workspace: 'whiteboard',
        title: boardTitle,
        subtitle: board.subtitle || 'Visual collaboration canvas',
        location: `Whiteboard > ${boardTitle}`,
        content: boardContent || 'Whiteboard diagrams, sticky notes, and ideas.',
        author: board.author || 'You',
        authorRole: 'Editor',
        updatedAt: temporal.fullText,
        metadata: {
          whiteboardId: boardId,
          deepLink: `whiteboard://${boardId}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'whiteboard'
        }
      });
    });
  }

  // 7. Comments: Workspace-wide aggregation across all applications
  const commentRecords = [];
  if (Array.isArray(context.comments)) commentRecords.push(...context.comments);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawComments = localStorage.getItem('regaarder_workspace_comments_v1');
      if (rawComments) {
        const parsedComments = JSON.parse(rawComments);
        if (Array.isArray(parsedComments)) commentRecords.push(...parsedComments);
      }
    } catch (_) {}
  }
  if (commentRecords.length > 0) {
    const seenComments = new Set();
    commentRecords.forEach((comment, idx) => {
      const text = (comment.text || comment.content || comment.body || '').trim();
      if (!text) return;
      const commentId = comment.id || `comment-${idx}`;
      if (seenComments.has(String(commentId))) return;
      seenComments.add(String(commentId));

      const targetType = (comment.targetType || comment.app || comment.workspace || 'workspace').toLowerCase();
      const targetName = comment.targetTitle || comment.title || comment.entityTitle || `${targetType.toUpperCase()} item`;
      const temporal = formatTemporalMetadata(comment.updatedAt || comment.createdAt || comment.timestamp);

      items.push({
        id: `comment-${commentId}`,
        type: 'comment',
        resourceType: 'comment',
        workspace: 'comments',
        title: `Comment on ${targetName}`,
        subtitle: `${targetType.toUpperCase()} comment by ${comment.author || 'You'}`,
        location: `Comments > ${targetName}`,
        content: text,
        author: comment.author || 'You',
        authorRole: 'Commenter',
        updatedAt: temporal.fullText,
        metadata: {
          commentId,
          targetType,
          targetId: comment.targetId || comment.docId,
          targetTitle: targetName,
          deepLink: `comments://${targetType}/${comment.targetId || comment.docId || ''}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'comment'
        }
      });
    });
  }

  // 8. Chats: Assistant / sidebar conversation history
  const chatRecords = [];
  const collectChatHistory = (source) => {
    if (!source) return;
    if (Array.isArray(source)) {
      chatRecords.push(...source.filter(Boolean));
      return;
    }
    if (typeof source === 'object') {
      chatRecords.push(...Object.values(source).filter(Boolean));
    }
  };
  collectChatHistory(context.chatSessions);
  collectChatHistory(context.aiChatSessions);
  collectChatHistory(context.chatHistory);
  collectChatHistory(context.chatThreads);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedTabs = JSON.parse(localStorage.getItem('rc.ai_chat_tabs') || '[]');
      const storedSessions = JSON.parse(localStorage.getItem('rc.ai_chat_sessions') || '[]');
      collectChatHistory(storedTabs);
      collectChatHistory(storedSessions);
    } catch (_) {}
  }
  if (chatRecords.length > 0) {
    const seenChats = new Set();
    chatRecords.forEach((chat, idx) => {
      const title = chat.title || chat.name || chat.topic || `Chat ${idx + 1}`;
      const chatId = chat.id || title || `chat-${idx}`;
      if (seenChats.has(String(chatId))) return;
      seenChats.add(String(chatId));

      const messages = Array.isArray(chat.messages) ? chat.messages : (Array.isArray(chat.chatMessages) ? chat.chatMessages : []);
      const messageText = messages.map((msg) => `${msg.author || msg.sender || msg.role || 'User'}: ${msg.text || msg.content || ''}`).join('\n');
      const content = [chat.summary || chat.lastMsg || '', messageText, chat.preview || ''].filter(Boolean).join('\n');
      if (!content && !title) return;

      const temporal = formatTemporalMetadata(chat.updatedAt || chat.timestamp);
      items.push({
        id: `chat-${chatId}`,
        type: 'chat',
        resourceType: 'chat',
        workspace: 'chat',
        title,
        subtitle: chat.isAi ? 'AI assistant history' : 'Assistant conversation',
        location: `Chats > ${title}`,
        content: content || 'Workspace chat history and assistant conversation.',
        author: chat.author || 'Assistant',
        authorRole: 'AI Assistant',
        updatedAt: temporal.fullText,
        metadata: {
          chatId,
          deepLink: `chat://${chatId}`,
          messageCount: messages.length,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'assistant_chat'
        }
      });
    });
  }

  // 9. Schedule: Events & Meetings
  const scheduleRecords = [];
  if (Array.isArray(context.scheduleAgendaItems)) scheduleRecords.push(...context.scheduleAgendaItems);
  if (Array.isArray(context.upcomingEvents)) scheduleRecords.push(...context.upcomingEvents);
  if (Array.isArray(context.schedule)) scheduleRecords.push(...context.schedule);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedAgenda = JSON.parse(localStorage.getItem('regaarder_intent_scheduler_events_v1') || '[]');
      if (Array.isArray(storedAgenda)) scheduleRecords.push(...storedAgenda);
    } catch (_) {}
  }
  if (scheduleRecords.length > 0) {
    const seenEvents = new Set();
    scheduleRecords.forEach((event, idx) => {
      const title = (event.title || event.name || event.summary || '').trim();
      const summary = (event.summary || event.description || event.details || '').trim();
      if (!title && !summary) return;
      const eventId = event.id || title || `event-${idx}`;
      if (seenEvents.has(String(eventId))) return;
      seenEvents.add(String(eventId));

      const temporal = formatTemporalMetadata(event.start || event.date || event.updatedAt);
      items.push({
        id: `schedule-${eventId}`,
        type: 'schedule_event',
        resourceType: 'schedule_event',
        workspace: 'schedule',
        title: title || `Schedule Event ${idx + 1}`,
        subtitle: event.location || event.category || 'Planned meeting or event',
        location: `Schedule > ${title || 'Event'}`,
        content: `${summary || title} ${event.date || event.start || event.dueDate || ''}`.trim(),
        author: event.organizer || event.host || 'You',
        authorRole: 'Organizer',
        updatedAt: temporal.fullText,
        metadata: {
          eventId,
          deepLink: `schedule://${eventId}`,
          start: event.start || event.dueDate || event.date,
          end: event.end || event.endTime,
          location: event.location,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'schedule_event'
        }
      });
    });
  }

  // 10. Browser Research Notes & Saved Captures (exact deep-link metadata for browser entries)
  const researchNoteSources = [];
  if (Array.isArray(context.researchNotes)) researchNoteSources.push(...context.researchNotes);
  if (Array.isArray(context.savedResearch)) researchNoteSources.push(...context.savedResearch);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedResearchItems = JSON.parse(localStorage.getItem('regaarder_saved_research_v1') || '[]');
      if (Array.isArray(savedResearchItems)) researchNoteSources.push(...savedResearchItems);
    } catch (_error) {}
  }

  if (researchNoteSources.length > 0) {
    const seenResearch = new Set();
    researchNoteSources.forEach((entry, idx) => {
      const noteTitle = (entry.title || entry.name || entry.label || entry.sourceTitle || entry.url || `Research Note ${idx + 1}`).trim();
      const noteUrl = entry.url || entry.sourceUrl || entry.link || '';
      const noteText = [entry.summary, entry.text, entry.content, entry.snippet, entry.notes, entry.selectionText, entry.targetText, entry.anchorText, entry.caption].filter(Boolean).join('\n').trim();
      const targetText = String(entry.selectionText || entry.targetText || entry.anchorText || entry.snippet || '').replace(/\s+/g, ' ').trim();
      const noteKey = String(entry.id || `${noteUrl || noteTitle}-${idx}`);
      if (seenResearch.has(noteKey)) return;
      seenResearch.add(noteKey);

      const temporal = formatTemporalMetadata(entry.updatedAt || entry.savedAt || entry.createdAt || entry.timestamp);
      const exactTargetSegment = targetText ? encodeURIComponent(targetText.slice(0, 180)) : '';
      const deepLink = noteUrl
        ? `${noteUrl}${exactTargetSegment ? `${noteUrl.includes('?') ? '&' : '?'}highlight=${exactTargetSegment}` : ''}`
        : `browser://research/${encodeURIComponent(noteKey)}`;

      items.push({
        id: `research-note-${noteKey}`,
        type: 'research_note',
        resourceType: 'research_note',
        workspace: 'browser',
        title: noteTitle || 'Research Note',
        subtitle: noteUrl ? noteUrl.replace(/^https?:\/\//i, '') : 'Saved research capture',
        location: `Research > ${noteTitle || 'Note'}`,
        content: noteText || noteUrl || 'Research note saved from the browser.',
        rawHtml: '',
        author: entry.author || 'You',
        authorRole: 'Researcher',
        updatedAt: temporal.fullText,
        metadata: {
          noteId: entry.id || noteKey,
          url: noteUrl,
          sourceUrl: noteUrl,
          sourceTitle: entry.sourceTitle || noteTitle,
          title: noteTitle,
          query: entry.query || entry.searchQuery || '',
          targetText,
          selectionText: entry.selectionText || targetText,
          anchorText: entry.anchorText || targetText,
          deepLink,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'research_note'
        }
      });
    });
  }

  // 11. Browser History (Independent research activity)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const tabs = JSON.parse(localStorage.getItem('regaarder_research_tabs_v2') || '[]');
      const sessions = JSON.parse(localStorage.getItem('regaarder_browser_tab_sessions') || '{}');
      if (Array.isArray(tabs)) {
        tabs.forEach((tab) => {
          const messages = sessions[tab.id] || sessions[tab.url] || [];
          const messageText = messages.map((message) => `${message.role || message.sender || 'User'}: ${message.text || message.content || ''}`).join('\n');
          const content = [tab.title, tab.url, tab.query, tab.extractedText, messageText].filter(Boolean).join('\n').trim();
          if (!content) return;
          const firstSearchMessage = messages.find((message) => message?.sender === 'user' || message?.role === 'user');
          const temporal = formatTemporalMetadata(tab.firstSearchedAt || firstSearchMessage?.createdAt || tab.createdAt || tab.updatedAt);
          items.push({
            id: `browser-history-${tab.id || tab.url}`,
            type: 'browser_history',
            resourceType: 'browser_history',
            workspace: 'browser-history',
            title: tab.title || tab.url || 'Browser History',
            subtitle: tab.url || 'Browser research and AI chat',
            location: `Browser History > ${tab.title || tab.url}`,
            content,
            author: 'You',
            authorRole: 'Researcher',
            updatedAt: temporal.fullText,
            metadata: {
              browserTabId: tab.id,
              url: tab.url,
              deepLink: tab.url || `browser-history://${tab.id || tab.url}`,
              query: tab.query || '',
              messageCount: messages.length,
              createdAt: temporal.iso,
              modifiedAt: temporal.iso,
              activityAt: temporal.iso,
              formattedDate: temporal.formattedDate,
              formattedTime: temporal.formattedTime,
              activityType: 'browser_history'
            }
          });
        });
      }
    } catch (_error) {}
  }

  // 12. Collaborators / People
  const people = context.collaborators || context.teamMembers || [];
  if (Array.isArray(people) && people.length > 0) {
    people.forEach((p) => {
      const personName = (p.name || p.title || '').trim();
      if (!personName) return;
      const temporal = formatTemporalMetadata(p.updatedAt || p.createdAt);
      items.push({
        id: `person-${p.id || p.email}`,
        type: 'person',
        resourceType: 'person',
        workspace: 'people',
        title: personName,
        subtitle: p.role || p.subtitle || 'Team Member',
        role: p.role || 'Member',
        email: p.email || '',
        avatar: p.avatar || '',
        department: p.department || 'Workspace',
        location: `People > ${p.department || 'Team'}`,
        content: `${personName} ${p.role || ''} ${p.email || ''}`,
        updatedAt: temporal.fullText,
        metadata: {
          deepLink: `people://${p.id || personName}`,
          createdAt: temporal.iso,
          modifiedAt: temporal.iso,
          activityAt: temporal.iso,
          formattedDate: temporal.formattedDate,
          formattedTime: temporal.formattedTime,
          activityType: 'person'
        }
      });
    });
  }

  return items;
}

/**
 * Normalize filter aliases so every category tab behaves the same way.
 */
function normalizeFilterKey(filter = '') {
  const key = String(filter || '').trim().toLowerCase();
  const compactKey = key.replace(/[\s_-]+/g, '');
  const aliases = {
    docs: 'compose',
    doc: 'compose',
    document: 'compose',
    documents: 'compose',
    docx: 'compose',
    pdf: 'compose',
    txt: 'compose',
    text: 'compose',
    markdown: 'compose',
    deck: 'deck',
    decks: 'deck',
    presentation: 'deck',
    presentations: 'deck',
    slides: 'deck',
    slide: 'deck',
    ppt: 'deck',
    pptx: 'deck',
    sheet: 'sheets',
    sheets: 'sheets',
    worksheet: 'sheets',
    worksheets: 'sheets',
    spreadsheet: 'sheets',
    spreadsheets: 'sheets',
    workbook: 'sheets',
    workbooks: 'sheets',
    excel: 'sheets',
    xlsx: 'sheets',
    xls: 'sheets',
    csv: 'sheets',
    room: 'room',
    rooms: 'room',
    meeting: 'room',
    meetings: 'room',
    notes: 'notes',
    note: 'notes',
    roomnote: 'notes',
    roomnotes: 'notes',
    meetingnote: 'notes',
    meetingnotes: 'notes',
    whiteboards: 'whiteboard',
    whiteboard: 'whiteboard',
    chats: 'chat',
    chat: 'chat',
    assistant: 'chat',
    calendar: 'schedule',
    schedule: 'schedule',
    browserhistories: 'browser-history',
    'browser-history': 'browser-history',
    browserhistory: 'browser-history',
    browser: 'browser',
    research: 'browser',
    researches: 'browser',
    researchnote: 'browser',
    researchnotes: 'browser',
    people: 'people',
    collaborator: 'people',
    collaborators: 'people',
    history: 'browser-history',
    histories: 'browser-history'
  };

  return aliases[compactKey] || aliases[key] || key;
}

function itemMatchesWorkspaceFilter(item, activeFilter) {
  if (!item) return false;
  const filterKey = normalizeFilterKey(activeFilter);
  if (!filterKey || filterKey === 'all') return true;

  const primaryType = normalizeFilterKey(item.editorTarget || item.mode || item.resourceType || item.type || item.workspace);
  const strictArtifactFilters = new Set(['compose', 'sheets', 'deck', 'whiteboard']);
  if (strictArtifactFilters.has(filterKey)) {
    return primaryType === filterKey;
  }

  const rawValues = [
    item.workspace,
    item.type,
    item.resourceType,
    item.targetWorkspace,
    item.category,
    item.workspaceType,
    item.productMode,
    item.mode
  ];

  const normalizedValues = rawValues
    .filter(Boolean)
    .map(value => normalizeFilterKey(String(value)))
    .filter(Boolean);

  const hasAnyValue = (values) => normalizedValues.some(v => values.includes(v));

  switch (filterKey) {
    case 'compose':
      return hasAnyValue(['compose', 'document', 'doc', 'docs', 'docx', 'pdf', 'markdown', 'text']);
    case 'sheets':
      return hasAnyValue(['sheets', 'sheet', 'spreadsheet', 'workbook', 'excel', 'worksheet', 'xlsx', 'xls', 'csv']);
    case 'deck':
      return hasAnyValue(['deck', 'slide', 'presentation', 'ppt', 'pptx']);
    case 'tasks':
      return hasAnyValue(['tasks', 'task', 'initiative']);
    case 'room':
      return hasAnyValue(['room', 'meeting']);
    case 'notes':
      return hasAnyValue(['notes', 'room_note', 'meeting_note']) || (normalizedValues.includes('browser') && hasAnyValue(['research_note']));
    case 'relay':
      return hasAnyValue(['relay', 'message']);
    case 'whiteboard':
      return hasAnyValue(['whiteboard']);
    case 'comments':
      return hasAnyValue(['comments', 'comment']);
    case 'chat':
      return hasAnyValue(['chat']);
    case 'schedule':
      return hasAnyValue(['schedule', 'schedule_event']);
    case 'browser':
      return hasAnyValue(['browser', 'research_note', 'researchnote']);
    case 'browser-history':
      return hasAnyValue(['browser-history', 'browser_history', 'history']);
    case 'people':
      return hasAnyValue(['people', 'person']);
    default:
      return normalizedValues.includes(filterKey);
  }
}

/**
 * Searches the workspace index with smart term ranking, category filtering,
 * temporal query token scoring, and contextual snippet extraction.
 */
export function queryWorkspace(allEntities, query = '', activeFilter = 'all') {
  const cleanQuery = (query || '').trim().toLowerCase();

  // Filter by workspace category if specified
  let filtered = allEntities;
  if (activeFilter !== 'all') {
    filtered = allEntities.filter(item => itemMatchesWorkspaceFilter(item, activeFilter));
  }

  // If no search query, return default recent/relevant ordered list
  if (!cleanQuery) {
    return filtered.map(item => ({
      entity: item,
      relevanceScore: item.isCurrent ? 100 : 80,
      snippet: extractSnippet(item.content, '', 130),
      matchType: 'recent'
    }));
  }

  // Query tokens for multi-term matching
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const item of filtered) {
    const titleLower = (item.title || '').toLowerCase();
    const subtitleLower = (item.subtitle || '').toLowerCase();
    const contentLower = (item.content || '').toLowerCase();
    const authorLower = (item.author || '').toLowerCase();
    const locationLower = (item.location || '').toLowerCase();
    const meta = item.metadata || {};
    const dateLower = (meta.formattedDate || '').toLowerCase();
    const timeLower = (meta.formattedTime || '').toLowerCase();
    const actTypeLower = (meta.activityType || '').toLowerCase();
    const updatedLower = (item.updatedAt || '').toLowerCase();

    let score = 0;
    let matchType = 'content';

    // 1. Exact Title Match
    if (titleLower === cleanQuery) {
      score += 150;
      matchType = 'exact_title';
    } else if (titleLower.startsWith(cleanQuery)) {
      score += 100;
      matchType = 'title_prefix';
    } else if (titleLower.includes(cleanQuery)) {
      score += 80;
      matchType = 'title';
    }

    // 2. Subtitle / Location / Author matches
    if (subtitleLower.includes(cleanQuery)) score += 40;
    if (authorLower.includes(cleanQuery)) score += 50;
    if (locationLower.includes(cleanQuery)) score += 30;

    // 3. Multi-token scoring across title, content, and temporal fields
    let allTokensFound = true;
    for (const t of tokens) {
      const inTitle = titleLower.includes(t);
      const inSubtitle = subtitleLower.includes(t);
      const inContent = contentLower.includes(t);
      const inAuthor = authorLower.includes(t);
      const inLocation = locationLower.includes(t);
      const inDate = dateLower.includes(t);
      const inTime = timeLower.includes(t);
      const inActType = actTypeLower.includes(t);
      const inUpdated = updatedLower.includes(t);

      if (inTitle) score += 30;
      else if (inSubtitle) score += 15;
      else if (inAuthor) score += 20;
      else if (inContent) score += 10;
      else if (inLocation) score += 10;
      else if (inDate || inTime || inUpdated) score += 35; // boost temporal token matches
      else if (inActType) score += 20;
      else {
        allTokensFound = false;
      }
    }

    if (contentLower.includes(cleanQuery)) {
      score += 25;
    }

    if (allTokensFound && tokens.length > 1) {
      score += 40;
    }

    if (score > 0) {
      scored.push({
        entity: item,
        relevanceScore: score,
        snippet: extractSnippet(item.content, cleanQuery, 140),
        matchType
      });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored;
}

// Group results by category
export function groupResultsByCategory(scoredResults) {
  const groups = {
    docs: { label: 'Documents', workspace: 'compose', items: [] },
    sheets: { label: 'Spreadsheets & Data', workspace: 'sheets', items: [] },
    decks: { label: 'Presentations & Slides', workspace: 'deck', items: [] },
    tasks: { label: 'Tasks & Initiatives', workspace: 'tasks', items: [] },
    relay: { label: 'Relay Messages', workspace: 'relay', items: [] },
    rooms: { label: 'Rooms & Meetings', workspace: 'room', items: [] },
    notes: { label: 'Room Notes', workspace: 'notes', items: [] },
    whiteboards: { label: 'Whiteboards', workspace: 'whiteboard', items: [] },
    comments: { label: 'Comments', workspace: 'comments', items: [] },
    chats: { label: 'Chats', workspace: 'chat', items: [] },
    schedule: { label: 'Schedule', workspace: 'schedule', items: [] },
    people: { label: 'People & Collaborators', workspace: 'people', items: [] },
    browserHistory: { label: 'Browser History', workspace: 'browser-history', items: [] },
    research: { label: 'Research Notes', workspace: 'browser', items: [] }
  };

  scoredResults.forEach(res => {
    const entity = res.entity || {};

    if (itemMatchesWorkspaceFilter(entity, 'browser-history')) {
      groups.browserHistory.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'compose')) {
      groups.docs.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'sheets')) {
      groups.sheets.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'deck')) {
      groups.decks.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'tasks')) {
      groups.tasks.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'relay')) {
      groups.relay.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'notes')) {
      groups.notes.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'whiteboard')) {
      groups.whiteboards.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'comments')) {
      groups.comments.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'chat')) {
      groups.chats.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'schedule')) {
      groups.schedule.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'room')) {
      groups.rooms.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'people')) {
      groups.people.items.push(res);
    } else if (itemMatchesWorkspaceFilter(entity, 'browser')) {
      groups.research.items.push(res);
    } else {
      groups.research.items.push(res);
    }
  });

  return Object.values(groups).filter(g => g.items.length > 0);
}

/**
 * Synthesizes cross-workspace intelligence using actual live indexed data.
 * Injects rich temporal metadata (created, modified, activity dates and times)
 * so AI can answer questions about dates, timelines, and past actions accurately.
 */
export async function synthesizeWorkspaceKnowledge({
  query,
  activeFilter = 'all',
  workspaceIndex = [],
  onProgress = null,
  onCallAi = null,
  aiConfig = null,
  customModel = null,
  customProvider = null,
  previousConversation = [],
  personaInstructions = ''
}) {
  onProgress?.({ step: 1, label: 'Scanning workspace metadata' });
  const matched = (workspaceIndex && workspaceIndex.length > 0)
    ? queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 8)
    : [];
  const hasBrandGuidelines = Boolean(personaInstructions && personaInstructions.includes('Brand Guidelines:') && personaInstructions.split('Brand Guidelines:')[1]?.trim()?.length > 5);

  if (matched.length === 0 && !hasBrandGuidelines) {
    return {
      answer: `No records found in your workspace regarding "${query}". Create or import documents, sheets, tasks, or notes to ask questions about your workspace.`,
      sources: []
    };
  }

  // Build grounded context with full temporal metadata for LLM reasoning
  onProgress?.({ step: 2, label: 'Extracting document context' });
  let contextBlocks = matched.map((m, idx) => {
    const e = m.entity;
    const bodyExcerpt = (e.content || m.snippet || '').slice(0, 3000);
    const meta = e.metadata || {};
    const createdStr = meta.createdAt ? `Created: ${meta.createdAt} (${meta.formattedDate || ''} ${meta.formattedTime || ''})` : '';
    const modifiedStr = meta.modifiedAt ? `Last Modified: ${meta.modifiedAt}` : '';
    const activityStr = meta.activityAt ? `Activity Date/Time: ${meta.activityAt} (${meta.formattedDate || ''} ${meta.formattedTime || ''})` : '';
    const actTypeStr = meta.activityType ? `Activity Type: ${meta.activityType}` : '';
    const temporalInfo = [createdStr, modifiedStr, activityStr, actTypeStr].filter(Boolean).join(' | ');

    return `[RESOURCE ${idx + 1}: "${e.title}" | Application: ${e.workspace || e.type} | Type: ${e.resourceType || e.type} | Location: ${e.location || ''}]
${temporalInfo ? `[TEMPORAL METADATA: ${temporalInfo}]` : ''}
${bodyExcerpt}`;
  });

  if (contextBlocks.length === 0 && hasBrandGuidelines) {
    const brandExcerpt = personaInstructions.split('Brand Guidelines:')[1]?.trim() || '';
    contextBlocks = [`[RESOURCE 1: "Brand Guidelines & Workspace Memory" | Application: Memory | Type: Guidelines]\n${brandExcerpt}`];
  }

  const contextData = contextBlocks.join('\n\n---\n\n');

  // Format previous conversation context if follow-up turn
  const convContext = previousConversation?.length > 0
    ? '\n\nPREVIOUS CONVERSATION TURNS:\n' + previousConversation.map(c => `${c.role === 'user' ? 'User' : 'Assistant'}: ${c.text}`).join('\n')
    : '';

  const systemPrompt = personaInstructions
    ? `${personaInstructions}

You are answering questions based on the user's workspace knowledge base. You have full access to temporal metadata (exact creation date, modification date, activity timestamp, and event types). When the user asks temporal questions (such as "What did I work on yesterday at 3 PM?", "Show me the document I edited on September 7", "What did the AI do around 10:30 this morning?"), accurately reason over and cite these timestamps and dates in your response. Format your response using clean executive markdown with bold highlights and bullet points where helpful.`
    : `You are the Regaarder Executive Workspace Intelligence. Analyze the user's workspace documents to answer their question directly, thoroughly, and with executive precision.
You have full access to temporal metadata (exact creation date, modification date, activity timestamp, and event types). Accurately reason over and cite these timestamps and dates when answering questions about past activities, edits, meetings, or schedules. Format your response with clean executive markdown.`;

  const userPrompt = `USER QUESTION:
${query}${convContext}

WORKSPACE SOURCE MATERIALS (WITH TIMESTAMPS & DATES):
${contextData}

Synthesize the answer directly based on the sources above. Explicitly account for timestamps and dates if the question refers to time, days, or recency:`;

  onProgress?.({ step: 3, label: 'Generating answer' });

  // Helper to verify if returned string is a provider error or unconfigured message
  const isErrorOrEmpty = (str) => {
    if (!str || typeof str !== 'string') return true;
    const lower = str.toLowerCase();
    return lower.includes('empty response') ||
           lower.includes('check your api key') ||
           lower.includes('api key and model settings') ||
           lower.includes('quota exceeded') ||
           lower.includes('invalid api key');
  };

  // Helper to check if configuration has usable credentials or active local endpoint
  const hasUsableConfig = (cfg) => {
    if (!cfg) return false;
    const p = (cfg.provider || '').toLowerCase();
    if (p === 'ollama' || p === 'local' || cfg.isLocal || cfg.endpoint) return true;
    if (p === 'gemini' && (cfg.geminiApiKey || cfg.apiKey)) return true;
    if (p === 'claude' && (cfg.claudeApiKey || cfg.apiKey)) return true;
    if (p === 'openai' && (cfg.openaiApiKey || cfg.apiKey)) return true;
    return false;
  };

  // ── Primary Path: callAiWithTools (live tool-calling harness) ──────────────
  if (aiConfig && hasUsableConfig(aiConfig)) {
    try {
      const { callAiWithTools } = await import('./docsToolExecutor.js');
      const { getSavedAiConfig } = await import('./orbAiService.js');

      const baseConfig = aiConfig || getSavedAiConfig();
      const resolvedConfig = {
        ...baseConfig,
        ...(customModel ? { model: customModel } : {}),
        ...(customProvider ? { provider: customProvider } : {})
      };
      if (hasUsableConfig(resolvedConfig)) {
        const toolPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const result = await callAiWithTools(toolPrompt, resolvedConfig, 'all', {}, { maxTurns: 3 });

        if (result?.answer && !isErrorOrEmpty(result.answer)) {
          return {
            answer: result.answer,
            sources: matched.map(m => m.entity),
            toolsExecuted: result.toolsExecuted || []
          };
        }
      }
    } catch (err) {
      console.warn('[synthesizeWorkspaceKnowledge] callAiWithTools failed, falling back:', err);
    }
  }

  // ── Secondary Path: onCallAi bridge (routes to default LLM / local model) ──
  if (onCallAi) {
    try {
      let response = null;
      if (typeof onCallAi === 'function') {
        try {
          const aiResult = await onCallAi({
            userPrompt,
            systemPrompt,
            customModel,
            customProvider
          });
          response = typeof aiResult === 'string' ? aiResult : (aiResult?.text || aiResult?.content || '');
        } catch (_callErr) {
          const legacyRes = await onCallAi(`${systemPrompt}\n\n${userPrompt}`);
          response = typeof legacyRes === 'string' ? legacyRes : (legacyRes?.text || legacyRes?.content || '');
        }
      }

      if (response && response.trim() && !isErrorOrEmpty(response)) {
        return {
          answer: response.trim(),
          sources: matched.map(m => m.entity)
        };
      }
    } catch (err) {
      console.warn('[synthesizeWorkspaceKnowledge] onCallAi failed, falling back to local extraction:', err);
    }
  }

  // ── Secondary-B Path: Direct Ollama Loopback at 127.0.0.1:11434 / /api/ollama ──
  const localCandidates = ['http://127.0.0.1:11434', '/api/ollama', 'http://localhost:11434'];
  const targetOllamaModel = (customModel && !customModel.includes('gemini') && !customModel.includes('claude')) ? customModel : 'gemma3:1b';
  for (const ep of localCandidates) {
    try {
      // 1. Try /api/chat first (standard for conversational models like gemma3:1b)
      const chatRes = await fetch(`${ep}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetOllamaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false
        })
      });
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        const chatText = (chatData?.message?.content || '').trim();
        if (chatText && !isErrorOrEmpty(chatText)) {
          return {
            answer: chatText,
            sources: matched.map(m => m.entity)
          };
        }
      }

      // 2. Fallback to /api/generate
      const directRes = await fetch(`${ep}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetOllamaModel,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false
        })
      });
      if (directRes.ok) {
        const directData = await directRes.json();
        const genText = (directData?.response || '').trim();
        if (genText && !isErrorOrEmpty(genText)) {
          return {
            answer: genText,
            sources: matched.map(m => m.entity)
          };
        }
      }
    } catch (_) {}
  }

  // ── Tertiary Path: Smart Semantic Keyword Extraction & Multi-Source Synthesis (no LLM required) ─────
  const terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !['what', 'this', 'that', 'with', 'from', 'your', 'about', 'connection', 'across', 'workspace', 'tell', 'show'].includes(t));
  const extractedExcerpts = [];

  for (const m of matched) {
    const docTitle = m.entity.title || 'Untitled';
    const docLoc = m.entity.location || m.entity.workspace || 'Workspace';
    const content = (m.entity.content || m.snippet || '').trim();
    if (!content) continue;

    const paragraphs = content.split(/\n+/).map(p => p.trim()).filter(p => p.length > 15);
    const matchedParas = [];

    for (const para of paragraphs) {
      const pLower = para.toLowerCase();
      const matchCount = terms.filter(t => pLower.includes(t)).length;
      if (terms.length === 0 || matchCount >= 1) {
        matchedParas.push({ text: para, matchCount });
      }
    }

    if (matchedParas.length > 0) {
      matchedParas.sort((a, b) => b.matchCount - a.matchCount);
      const topSnippets = matchedParas.slice(0, 2).map(p => p.text);
      extractedExcerpts.push({
        title: docTitle,
        location: docLoc,
        text: topSnippets.join('\n\n')
      });
    } else if (content.length > 0) {
      extractedExcerpts.push({
        title: docTitle,
        location: docLoc,
        text: content.slice(0, 320) + (content.length > 320 ? '…' : '')
      });
    }
  }

  const hasUsableAiBackend = Boolean(
    (customModel && String(customModel).trim()) ||
    (aiConfig && hasUsableConfig(aiConfig))
  );

  if (extractedExcerpts.length > 0) {
    if (!hasUsableAiBackend) {
      return {
        answer: `Ask Memory is selected, but no usable AI model is connected right now. Pick a model in the header, start Ollama or LM Studio, or add a valid Gemini/Claude API key in Settings before asking again.`,
        sources: matched.map(m => m.entity)
      };
    }

    const synthesisSections = extractedExcerpts.map((ex, i) => 
      `### ${i + 1}. **${ex.title}** *(${ex.location})*\n${ex.text}`
    ).join('\n\n');

    const synthesisSummary = `Found **${extractedExcerpts.length} relevant workspace ${extractedExcerpts.length === 1 ? 'source' : 'sources'}** regarding "${query}":\n\n${synthesisSections}`;

    return {
      answer: synthesisSummary,
      sources: matched.map(m => m.entity)
    };
  }

  const primarySource = matched[0]?.entity;
  const rawFallback = (primarySource?.content || matched[0]?.snippet || '').trim();

  if (!hasUsableAiBackend) {
    return {
      answer: `I couldn’t generate a direct answer because Ask Memory has no active model connection. Choose a model in the Ask Memory header, connect local Ollama/LM Studio, or enable a valid Gemini/Claude key in Settings.`,
      sources: matched.map(m => m.entity)
    };
  }

  if (!rawFallback) {
    return {
      answer: `I found a likely match, but there isn’t enough source content to answer this question directly. Try a more specific prompt or add the relevant document to your workspace.`,
      sources: matched.map(m => m.entity)
    };
  }

  return {
    answer: `Based on **${primarySource?.title || 'Workspace Resource'}** (${primarySource?.location || primarySource?.workspace || 'Workspace'}):\n\n${rawFallback.slice(0, 450)}${rawFallback.length > 450 ? '…' : ''}`,
    sources: matched.map(m => m.entity)
  };
}
