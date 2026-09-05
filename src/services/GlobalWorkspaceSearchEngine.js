/**
 * GlobalWorkspaceSearchEngine.js
 * 
 * Unified cross-workspace search index, discovery, and AI synthesis engine for Regaarder.
 * Indexes real Documents, Sheets, Presentations/Decks, Tasks, Rooms/Meetings,
 * Notes/Research, People, and live in-file content from the active workspace state.
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

// Pre-populated Quick Action Launchers
export const QUICK_ACTIONS = [
  {
    id: 'action-new-doc',
    type: 'action',
    workspace: 'compose',
    title: 'New Document',
    subtitle: 'Open a blank distraction-free Compose document',
    targetWorkspace: 'compose',
    shortcut: '⌘N',
    actionType: 'new_doc'
  },
  {
    id: 'action-new-sheet',
    type: 'action',
    workspace: 'sheets',
    title: 'New Spreadsheet',
    subtitle: 'Build a financial model or data calculation grid',
    targetWorkspace: 'sheets',
    shortcut: '⌘⇧S',
    actionType: 'new_sheet'
  },
  {
    id: 'action-new-deck',
    type: 'action',
    workspace: 'deck',
    title: 'New Presentation',
    subtitle: 'Design an executive slide deck with AI intelligence',
    targetWorkspace: 'deck',
    shortcut: '⌘⇧P',
    actionType: 'new_deck'
  },
  {
    id: 'action-new-room',
    type: 'action',
    workspace: 'room',
    title: 'Start Room',
    subtitle: 'Host an ambient video call with live transcription',
    targetWorkspace: 'room',
    shortcut: '⌘M',
    actionType: 'new_room'
  },
  {
    id: 'action-new-research',
    type: 'action',
    workspace: 'browser',
    title: 'Open Web Research',
    subtitle: 'Browse live sources and verify citations',
    targetWorkspace: 'browser',
    shortcut: '⌘B',
    actionType: 'open_research'
  },
  {
    id: 'action-new-task',
    type: 'action',
    workspace: 'tasks',
    title: 'Create New Task',
    subtitle: 'Add a project milestone or team action item',
    targetWorkspace: 'tasks',
    shortcut: '⌘T',
    actionType: 'new_task'
  }
];

/**
 * Intelligently resolves workspace type and category based on entity title, type, and active mode.
 */
export function resolveWorkspaceForEntity(title = '', type = '', explicitWorkspace = '') {
  const tLower = (title || '').toLowerCase();
  const typeLower = (type || '').toLowerCase();
  const explicitLower = (explicitWorkspace || '').toLowerCase();

  if (
    explicitLower === 'deck' ||
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
    explicitLower === 'sheets' ||
    explicitLower === 'sheet' ||
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
    explicitLower === 'whiteboard' ||
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
    explicitLower === 'room' ||
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
    explicitLower === 'tasks' ||
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
    explicitLower === 'browser' ||
    typeLower === 'research' ||
    typeLower === 'note' ||
    typeLower === 'research_note' ||
    tLower.includes('research')
  ) {
    return {
      workspace: 'browser',
      type: 'research_note',
      prefix: 'Research'
    };
  }

  if (
    explicitLower === 'people' ||
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
 * Returns only genuine user-created documents, sheets, slides, tasks, rooms, and notes.
 * Filters out all blank, initial template, untitled placeholders, and dummy data.
 */
export function buildWorkspaceIndex(context = {}) {
  const items = [];

  // 1. Real Documents & Active Files
  const docs = context.documents || [];
  const activeDocId = context.activeDocId;
  const currentDocTitle = (context.docTitle || '').trim();
  const currentDocSubtitle = (context.docSubtitle || '').trim();
  const currentDocBodyHtml = (context.docBodyHtml || '').trim();
  const currentProductMode = (context.productMode || '').toLowerCase();
  const currentPlainText = stripHtml(currentDocBodyHtml).trim();

  // Known template / placeholder names
  const placeholderTitles = new Set([
    'untitled document',
    'untitled deck',
    'untitled sheet',
    'untitled',
    'untitled whiteboard',
    'untitled task',
    'beta launch',
    'creator outreach',
    'product hunt launch',
    'paid campaigns'
  ]);

  const isRealTitle = (title) => {
    if (!title || typeof title !== 'string') return false;
    const lower = title.trim().toLowerCase();
    return lower.length > 0 && !placeholderTitles.has(lower) && !lower.startsWith('untitled');
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

  // 1. Index Currently Open Document / Sheet / Deck
  const hasActiveContent = currentPlainText.length > 0 || (currentDocTitle && isRealTitle(currentDocTitle));
  if (activeDocId) {
    if (currentProductMode === 'sheets') {
      const activeSheetTitle = (context.sheetsTitle || currentDocTitle || 'Untitled Sheet').trim();
      const gridText = extractTextFromGrid(context.sheetGrids);
      items.push({
        id: `sheet-active-${activeDocId}`,
        type: 'sheet',
        workspace: 'sheets',
        title: activeSheetTitle,
        subtitle: 'Spreadsheet Calculation Grid',
        location: `Sheets > ${activeSheetTitle}`,
        content: gridText || 'Active spreadsheet calculations and cell data.',
        rawHtml: '',
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: 'Just now',
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          sheetId: context.activeSheetId,
          isCurrent: true
        }
      });
    } else if (currentProductMode === 'deck') {
      const activeDeckTitle = (context.deckTitle || currentDocTitle || 'Untitled Deck').trim();
      const slides = context.deckSlidesData || [];
      const deckText = extractTextFromSlides(slides);
      items.push({
        id: `deck-active-${activeDocId}`,
        type: 'deck',
        workspace: 'deck',
        title: activeDeckTitle,
        subtitle: `Presentation (${slides.length > 0 ? slides.length : 1} Slides)`,
        location: `Deck > ${activeDeckTitle}`,
        content: deckText || 'Active presentation deck.',
        rawHtml: '',
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: 'Just now',
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          slideCount: slides.length,
          isCurrent: true
        }
      });
    } else if (hasActiveContent) {
      const activeRes = resolveWorkspaceForEntity(currentDocTitle || 'Untitled Document', '', currentProductMode);
      const titleToUse = currentDocTitle || 'Untitled Document';
      items.push({
        id: `doc-active-${activeDocId}`,
        type: activeRes.type,
        workspace: activeRes.workspace,
        title: titleToUse,
        subtitle: currentDocSubtitle || `Currently open in ${activeRes.prefix}`,
        location: `${activeRes.prefix} > ${titleToUse}`,
        content: currentPlainText,
        rawHtml: currentDocBodyHtml,
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: 'Just now',
        isCurrent: true,
        metadata: {
          docId: activeDocId,
          isCurrent: true
        }
      });
    }
  }

  // 2. Index All Saved Documents, Workbooks, and Presentation Decks
  docs.forEach((doc, idx) => {
    if (String(doc.id) === String(activeDocId)) return; // skip active to prevent duplicate

    const isSheets = doc.mode === 'sheets' || (doc.sheetsData && doc.sheetsData.length > 0) || (doc.sheetGrids && Object.keys(doc.sheetGrids).length > 0);
    const isDeck = doc.mode === 'deck' || (doc.deckSlidesData && doc.deckSlidesData.length > 0);
    const isWhiteboard = doc.mode === 'whiteboard';

    if (isSheets) {
      const rawTitle = (doc.sheetsTitle || doc.title || '').trim();
      const gridText = extractTextFromGrid(doc.sheetGrids);
      const sheetCount = doc.sheetsData?.length || 1;
      items.push({
        id: `sheet-${doc.id || idx}`,
        type: 'sheet',
        workspace: 'sheets',
        title: rawTitle || `Spreadsheet ${idx + 1}`,
        subtitle: `Spreadsheet (${sheetCount} Sheet${sheetCount > 1 ? 's' : ''})`,
        location: `Sheets > ${rawTitle || `Spreadsheet ${idx + 1}`}`,
        content: gridText || 'Spreadsheet calculation workbook and data models.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: doc.updatedAt || 'Recently saved',
        metadata: {
          docId: doc.id,
          sheetId: doc.activeSheetId || 1,
          sheetCount: sheetCount
        }
      });
    } else if (isDeck) {
      const rawTitle = (doc.deckTitle || doc.title || '').trim();
      const slides = doc.deckSlidesData || [];
      const deckText = extractTextFromSlides(slides);
      const slideCount = slides.length || 1;
      items.push({
        id: `deck-${doc.id || idx}`,
        type: 'deck',
        workspace: 'deck',
        title: rawTitle || `Presentation ${idx + 1}`,
        subtitle: `Presentation (${slideCount} Slide${slideCount > 1 ? 's' : ''})`,
        location: `Deck > ${rawTitle || `Presentation ${idx + 1}`}`,
        content: deckText || 'Presentation slides and speaker notes.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: doc.updatedAt || 'Recently saved',
        metadata: {
          docId: doc.id,
          slideCount: slideCount
        }
      });
    } else if (isWhiteboard) {
      const rawTitle = (doc.title || '').trim();
      items.push({
        id: `whiteboard-${doc.id || idx}`,
        type: 'whiteboard',
        workspace: 'whiteboard',
        title: rawTitle || `Whiteboard ${idx + 1}`,
        subtitle: 'Visual Infinite Canvas',
        location: `Whiteboard > ${rawTitle || `Whiteboard ${idx + 1}`}`,
        content: 'Whiteboard diagrams, sticky notes, and visual mind maps.',
        rawHtml: '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: doc.updatedAt || 'Recently saved',
        metadata: {
          docId: doc.id
        }
      });
    } else {
      const plainText = stripHtml(doc.bodyHtml || doc.content || '').trim();
      const rawTitle = (doc.title || '').trim();
      if (!plainText && (!rawTitle || !isRealTitle(rawTitle))) {
        return; // Skip empty placeholder documents
      }
      const docRes = resolveWorkspaceForEntity(rawTitle || '', doc.type || doc.format || '');
      items.push({
        id: `doc-${doc.id || idx}`,
        type: docRes.type,
        workspace: docRes.workspace,
        title: rawTitle || `${docRes.prefix} ${idx + 1}`,
        subtitle: doc.subtitle || `${docRes.prefix} File`,
        location: `${docRes.prefix} > ${rawTitle || `${docRes.prefix} ${idx + 1}`}`,
        content: plainText,
        rawHtml: doc.bodyHtml || '',
        author: doc.author || 'You (Author)',
        authorRole: 'Editor',
        updatedAt: doc.updatedAt || 'Recently saved',
        metadata: {
          docId: doc.id
        }
      });
    }
  });

  // 4. Real Tasks & Action Items (Only genuine user-created tasks, excluding default placeholder initiatives)
  const tasks = context.tasks || [];
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasks.forEach((t) => {
      const taskTitle = (t.title || t.name || '').trim();
      if (!isRealTitle(taskTitle)) {
        return; // Filter out default/placeholder initiatives (e.g. Beta Launch, Creator Outreach, etc.)
      }
      items.push({
        id: `task-${t.id || taskTitle}`,
        type: 'task',
        workspace: 'tasks',
        title: taskTitle,
        subtitle: `${t.assignee || t.owner || 'Unassigned'} • ${t.priority || 'Normal'} Priority • ${t.status || 'Active'}`,
        location: `Tasks > ${t.project || 'Initiatives'}`,
        content: `${t.description || taskTitle}. Due date: ${t.due || t.timeline || 'Upcoming'}. Status: ${t.status || 'Active'}. Assignee: ${t.assignee || t.owner || 'Team'}.`,
        author: t.assignee || t.owner || 'Assigned',
        authorRole: t.tag || 'Deliverable',
        updatedAt: t.due ? `Due ${t.due}` : t.timeline ? `Due ${t.timeline}` : (t.status || 'Active'),
        metadata: {
          taskId: t.id,
          priority: t.priority,
          status: t.status,
          assignee: t.assignee || t.owner,
          progress: t.progress
        }
      });
    });
  }

  // 5. Real Rooms / Meetings
  const rooms = context.rooms || [];
  if (Array.isArray(rooms) && rooms.length > 0) {
    rooms.forEach((r) => {
      const roomTitle = (r.title || '').trim();
      if (!isRealTitle(roomTitle)) return;
      items.push({
        id: `room-${r.id || roomTitle}`,
        type: 'meeting',
        workspace: 'room',
        title: roomTitle,
        subtitle: r.subtitle || 'Active Meeting Room',
        location: `Room > ${roomTitle}`,
        content: r.transcript || r.content || '',
        author: r.host || 'You',
        authorRole: 'Host',
        updatedAt: r.updatedAt || 'Active',
        metadata: {
          roomId: r.id
        }
      });
    });
  }

  // 6. Real Research Notes
  const researchNotes = context.researchNotes || [];
  if (Array.isArray(researchNotes) && researchNotes.length > 0) {
    researchNotes.forEach((n) => {
      const noteTitle = (n.title || '').trim();
      if (!noteTitle && !n.content) return;
      items.push({
        id: `note-${n.id || noteTitle}`,
        type: 'research_note',
        workspace: 'browser',
        title: noteTitle || 'Research Note',
        subtitle: n.subtitle || 'Web Source',
        location: `Research > ${noteTitle || 'Notes'}`,
        content: n.content || '',
        author: 'You',
        authorRole: 'Researcher',
        updatedAt: n.updatedAt || 'Recently saved',
        metadata: {
          sourceUrl: n.url
        }
      });
    });
  }

  // 7. Real Collaborators
  const people = context.collaborators || context.teamMembers || [];
  if (Array.isArray(people) && people.length > 0) {
    people.forEach((p) => {
      const personName = (p.name || p.title || '').trim();
      if (!personName) return;
      items.push({
        id: `person-${p.id || p.email}`,
        type: 'person',
        workspace: 'people',
        title: personName,
        subtitle: p.role || p.subtitle || 'Team Member',
        role: p.role || 'Member',
        email: p.email || '',
        avatar: p.avatar || '',
        department: p.department || 'Workspace',
        location: `People > ${p.department || 'Team'}`,
        content: `${personName} ${p.role || ''} ${p.email || ''}`
      });
    });
  }

  return items;
}

/**
 * Searches the workspace index with smart term ranking, category filtering,
 * and contextual snippet extraction.
 */
export function queryWorkspace(allEntities, query = '', activeFilter = 'all') {
  const cleanQuery = (query || '').trim().toLowerCase();
  
  // Filter by workspace category if specified
  let filtered = allEntities;
  if (activeFilter !== 'all') {
    filtered = allEntities.filter(item => {
      if (activeFilter === 'compose' || activeFilter === 'docs') return item.workspace === 'compose' || item.type === 'document';
      if (activeFilter === 'sheets') return item.workspace === 'sheets' || item.type === 'sheet';
      if (activeFilter === 'deck' || activeFilter === 'decks') return item.workspace === 'deck' || item.type === 'slide';
      if (activeFilter === 'tasks') return item.workspace === 'tasks' || item.type === 'task';
      if (activeFilter === 'room' || activeFilter === 'rooms') return item.workspace === 'room' || item.type === 'meeting';
      if (activeFilter === 'notes' || activeFilter === 'browser') return item.workspace === 'browser' || item.type === 'research_note';
      if (activeFilter === 'people') return item.workspace === 'people' || item.type === 'person';
      return item.workspace === activeFilter;
    });
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
    const tagsLower = (item.tags || []).join(' ').toLowerCase();
    const formulaLower = (item.metadata?.formula || '').toLowerCase();
    const cellValLower = (item.metadata?.cellValue || '').toLowerCase();

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
    if (tagsLower.includes(cleanQuery)) score += 45;
    if (cellValLower.includes(cleanQuery)) score += 60;
    if (formulaLower.includes(cleanQuery)) score += 50;

    // 3. Multi-token scoring across title and content
    let allTokensFound = true;
    for (const t of tokens) {
      const inTitle = titleLower.includes(t);
      const inSubtitle = subtitleLower.includes(t);
      const inContent = contentLower.includes(t);
      const inAuthor = authorLower.includes(t);
      const inLocation = locationLower.includes(t);

      if (inTitle) score += 30;
      else if (inSubtitle) score += 15;
      else if (inAuthor) score += 20;
      else if (inContent) score += 10;
      else if (inLocation) score += 10;
      else {
        allTokensFound = false;
      }
    }

    // In-content match boost
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
    rooms: { label: 'Rooms & Meetings', workspace: 'room', items: [] },
    people: { label: 'People & Collaborators', workspace: 'people', items: [] },
    notes: { label: 'Research & Notes', workspace: 'browser', items: [] }
  };

  scoredResults.forEach(res => {
    const ws = (res.entity.workspace || '').toLowerCase();
    const type = (res.entity.type || '').toLowerCase();

    if (ws === 'compose' || type === 'document') groups.docs.items.push(res);
    else if (ws === 'sheets' || type === 'sheet') groups.sheets.items.push(res);
    else if (ws === 'deck' || type === 'slide') groups.decks.items.push(res);
    else if (ws === 'tasks' || type === 'task') groups.tasks.items.push(res);
    else if (ws === 'room' || type === 'meeting') groups.rooms.items.push(res);
    else if (ws === 'people' || type === 'person') groups.people.items.push(res);
    else groups.notes.items.push(res);
  });

  return Object.values(groups).filter(g => g.items.length > 0);
}

/**
 * Synthesizes cross-workspace intelligence using actual live indexed data.
 * Routes through callAiWithTools when aiConfig is provided so the LLM can
 * call get_document_structure, get_tasks, get_sheet_data etc. directly.
 * Falls back to onCallAi (plain text) and then local extraction when both are absent.
 */
export async function synthesizeWorkspaceKnowledge({
  query,
  activeFilter = 'all',
  workspaceIndex = [],
  onCallAi = null,
  aiConfig = null,
  customModel = null,
  customProvider = null,
  previousConversation = [],
  personaInstructions = ''
}) {
  const matched = queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 8);

  if (matched.length === 0) {
    return {
      answer: `No records found in your workspace regarding "${query}". Create or import documents, sheets, tasks, or notes to ask questions about your workspace.`,
      sources: []
    };
  }

  // Build grounded context from top matched entities
  const contextBlocks = matched.map((m, idx) => {
    const e = m.entity;
    const bodyExcerpt = (e.content || m.snippet || '').slice(0, 3000);
    return `[DOCUMENT ${idx + 1}: ${e.title} (${e.workspace || e.type})]\n${bodyExcerpt}`;
  });

  const contextData = contextBlocks.join('\n\n---\n\n');

  // Format previous conversation context if follow-up turn
  const convContext = previousConversation?.length > 0
    ? '\n\nPREVIOUS CONVERSATION TURNS:\n' + previousConversation.map(c => `${c.role === 'user' ? 'User' : 'Assistant'}: ${c.text}`).join('\n')
    : '';

  const systemPrompt = personaInstructions
    ? `${personaInstructions}\n\nYou are answering questions based on the user's workspace knowledge base. Provide an authoritative, first-principles synthesis. Analyze relationships, cross-references, and specific factual connections across documents. Format your response using clean executive markdown with bold highlights and bullet points where helpful.`
    : `You are the Regaarder Executive Workspace Intelligence. Analyze the user's workspace documents to answer their question directly, thoroughly, and with executive precision.
Identify cross-references, associations, and factual connections between entities across all provided sources. Format your response with clean executive markdown.`;

  const userPrompt = `USER QUESTION:
${query}${convContext}

WORKSPACE SOURCE MATERIALS:
${contextData}

Synthesize the answer directly based on the sources above. Explain the exact connections and details found in the workspace:`;

  // Helper to verify if returned string is a provider error or unconfigured message
  const isErrorOrEmpty = (str) => {
    if (!str || typeof str !== 'string') return true;
    const lower = str.toLowerCase();
    return lower.includes('empty response') ||
           lower.includes('check your api key') ||
           lower.includes('api key and model settings') ||
           lower.includes('unable to synthesize') ||
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

      const resolvedConfig = aiConfig || getSavedAiConfig();
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
        } catch (callErr) {
          // Fallback to plain string invocation
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

  // ── Tertiary Path: Smart Semantic Keyword Extraction (no LLM required) ─────
  // Search through all matched documents for paragraphs containing query terms
  const terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !['what', 'this', 'that', 'with', 'from', 'your', 'about', 'connection', 'across', 'workspace'].includes(t));
  
  let bestExcerpt = '';
  let bestSource = matched[0]?.entity;

  for (const m of matched) {
    const content = (m.entity.content || m.snippet || '');
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 20);
    
    // Check paragraphs matching multiple terms
    for (const para of paragraphs) {
      const pLower = para.toLowerCase();
      const matchCount = terms.filter(t => pLower.includes(t)).length;
      if (matchCount >= 2 || (matchCount >= 1 && terms.length === 1)) {
        bestExcerpt = para.trim();
        bestSource = m.entity;
        break;
      }
    }
    if (bestExcerpt) break;
  }

  if (!bestExcerpt) {
    const raw = (bestSource?.content || matched[0]?.snippet || '').trim();
    bestExcerpt = raw.slice(0, 350) + (raw.length > 350 ? '…' : '');
  }

  return {
    answer: `Based on **${bestSource?.title || 'Workspace Document'}** (${bestSource?.location || bestSource?.workspace || 'Compose'}):\n\n${bestExcerpt}`,
    sources: matched.map(m => m.entity)
  };
}

