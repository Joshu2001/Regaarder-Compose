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
 */
export function buildWorkspaceIndex(context = {}) {
  const items = [];

  // 1. Documents & Active Files
  const docs = context.documents || [];
  const activeDocId = context.activeDocId;
  const currentDocTitle = context.docTitle || '';
  const currentDocSubtitle = context.docSubtitle || '';
  const currentDocBodyHtml = context.docBodyHtml || '';
  const currentProductMode = (context.productMode || '').toLowerCase();

  // Add currently open document / deck / sheet if non-empty or initialized
  if (currentDocTitle || currentDocBodyHtml || activeDocId) {
    const activeRes = resolveWorkspaceForEntity(currentDocTitle || 'Untitled Document', '', currentProductMode);
    items.push({
      id: `doc-active-${activeDocId || 'current'}`,
      type: activeRes.type,
      workspace: activeRes.workspace,
      title: currentDocTitle || `Untitled ${activeRes.prefix === 'Deck' ? 'Deck' : activeRes.prefix === 'Sheets' ? 'Sheet' : 'Document'}`,
      subtitle: currentDocSubtitle || `Currently open in ${activeRes.prefix}`,
      location: `${activeRes.prefix} > ${currentDocTitle || 'Untitled Document'}`,
      content: stripHtml(currentDocBodyHtml),
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

  // Add other saved documents in the user's document list
  docs.forEach((doc, idx) => {
    if (doc.id === activeDocId) return; // avoid duplicate with active document
    const plainText = stripHtml(doc.bodyHtml || doc.content || '');
    const docRes = resolveWorkspaceForEntity(doc.title || '', doc.type || doc.format || '');
    items.push({
      id: `doc-${doc.id || idx}`,
      type: docRes.type,
      workspace: docRes.workspace,
      title: doc.title || `${docRes.prefix} ${idx + 1}`,
      subtitle: doc.subtitle || `${docRes.prefix} File`,
      location: `${docRes.prefix} > ${doc.title || `${docRes.prefix} ${idx + 1}`}`,
      content: plainText,
      rawHtml: doc.bodyHtml || '',
      author: doc.author || 'You (Author)',
      authorRole: 'Editor',
      updatedAt: doc.updatedAt || 'Recently saved',
      metadata: {
        docId: doc.id
      }
    });
  });

  // 2. Real Spreadsheets
  if (context.sheetsTitle && currentProductMode === 'sheets') {
    const sheetTitle = context.sheetsTitle;
    const exists = items.some(i => i.title === sheetTitle && i.workspace === 'sheets');
    if (!exists) {
      items.push({
        id: `sheet-active-${context.activeSheetId || 'current'}`,
        type: 'sheet',
        workspace: 'sheets',
        title: sheetTitle,
        subtitle: 'Spreadsheet Calculation Grid',
        location: `Sheets > ${sheetTitle}`,
        content: 'Active spreadsheet calculations and cell data.',
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: 'Just now',
        isCurrent: true,
        metadata: {
          sheetId: context.activeSheetId
        }
      });
    }
  }

  // 3. Real Presentations & Slides
  if (context.deckTitle && currentProductMode === 'deck') {
    const deckTitle = context.deckTitle;
    const exists = items.some(i => i.title === deckTitle && i.workspace === 'deck');
    if (!exists) {
      const slides = context.deckSlidesData || [];
      items.push({
        id: `deck-active-${context.activeDeckSlideId || 'current'}`,
        type: 'deck',
        workspace: 'deck',
        title: deckTitle,
        subtitle: `Presentation (${slides.length > 0 ? slides.length : 1} Slides)`,
        location: `Deck > ${deckTitle}`,
        content: slides.map((s, idx) => `Slide ${idx + 1}: ${s.title || ''} ${s.content || ''}`).join('. '),
        author: 'You (Author)',
        authorRole: 'Editor',
        updatedAt: 'Just now',
        isCurrent: true,
        metadata: {
          slideCount: slides.length
        }
      });
    }
  }

  // 4. Real Tasks & Action Items
  const tasks = context.tasks || [];
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasks.forEach((t) => {
      items.push({
        id: `task-${t.id || t.title}`,
        type: 'task',
        workspace: 'tasks',
        title: t.title || 'Untitled Task',
        subtitle: `${t.assignee || 'Unassigned'} • ${t.priority || 'Normal'} Priority • ${t.status || 'Active'}`,
        location: `Tasks > ${t.project || 'Initiatives'}`,
        content: `${t.description || t.title}. Due date: ${t.due || 'Upcoming'}. Status: ${t.status || 'Active'}. Assignee: ${t.assignee || 'Team'}.`,
        author: t.assignee || 'Assigned',
        authorRole: t.tag || 'Deliverable',
        updatedAt: t.due ? `Due ${t.due}` : 'Active',
        metadata: {
          taskId: t.id,
          priority: t.priority,
          status: t.status,
          assignee: t.assignee,
          progress: t.progress
        }
      });
    });
  }

  // 5. Real Rooms / Meetings
  const rooms = context.rooms || [];
  if (Array.isArray(rooms) && rooms.length > 0) {
    rooms.forEach((r) => {
      items.push({
        id: `room-${r.id || r.title}`,
        type: 'meeting',
        workspace: 'room',
        title: r.title || 'Room Meeting',
        subtitle: r.subtitle || 'Active Meeting Room',
        location: `Room > ${r.title || 'Meeting'}`,
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
      items.push({
        id: `note-${n.id || n.title}`,
        type: 'research_note',
        workspace: 'browser',
        title: n.title || 'Research Note',
        subtitle: n.subtitle || 'Web Source',
        location: `Research > ${n.title || 'Notes'}`,
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
      items.push({
        id: `person-${p.id || p.email}`,
        type: 'person',
        workspace: 'people',
        title: p.name || p.title || 'Collaborator',
        subtitle: p.role || p.subtitle || 'Team Member',
        role: p.role || 'Member',
        email: p.email || '',
        avatar: p.avatar || '',
        department: p.department || 'Workspace',
        location: `People > ${p.department || 'Team'}`,
        content: `${p.name || ''} ${p.role || ''} ${p.email || ''}`
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
  aiConfig = null
}) {
  const matched = queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 8);

  if (matched.length === 0) {
    return {
      answer: `No records found in your workspace regarding "${query}". Create or import documents, sheets, tasks, or notes to ask questions about your workspace.`,
      sources: []
    };
  }

  // ── Primary Path: callAiWithTools (live tool-calling harness) ──────────────
  if (aiConfig) {
    try {
      const { callAiWithTools } = await import('./docsToolExecutor.js');
      const { getSavedAiConfig } = await import('./orbAiService.js');

      const resolvedConfig = aiConfig || getSavedAiConfig();
      const contextSummary = matched.map((m, i) =>
        `[${i + 1}] "${m.entity.title}" (${m.entity.location}): ${m.entity.content?.slice(0, 200) || ''}`
      ).join('\n\n');

      const prompt = `You have access to workspace tools. The user asked: "${query}"\n\nPre-indexed context from the search engine (use tools to get live/updated data if needed):\n${contextSummary}\n\nProvide a direct, concise executive summary answering the user's question based on the workspace data.`;

      const result = await callAiWithTools(prompt, resolvedConfig, 'all', {}, { maxTurns: 3 });

      if (result?.answer) {
        return {
          answer: result.answer,
          sources: matched.map(m => m.entity),
          toolsExecuted: result.toolsExecuted || []
        };
      }
    } catch (err) {
      console.warn('[synthesizeWorkspaceKnowledge] callAiWithTools failed, falling back:', err);
    }
  }

  // ── Secondary Path: onCallAi plain text callback (legacy) ─────────────────
  if (onCallAi) {
    try {
      const contextData = matched.map((m, idx) =>
        `[Source ${idx + 1}] Title: ${m.entity.title} (${m.entity.location})\nContent: ${m.entity.content}`
      ).join('\n\n');

      const prompt = `You are the Regaarder Executive Workspace Assistant. Answer the user's question concisely based ONLY on the following workspace data. If the answer cannot be determined from the data, say so politely.\n\nWORKSPACE DATA:\n${contextData}\n\nUSER QUESTION: ${query}\n\nProvide a direct, concise executive summary:`;
      const response = await onCallAi(prompt);
      if (response) {
        return {
          answer: response.trim(),
          sources: matched.map(m => m.entity)
        };
      }
    } catch (err) {
      console.warn('[synthesizeWorkspaceKnowledge] onCallAi failed, falling back to local extraction:', err);
    }
  }

  // ── Tertiary Path: Local snippet extraction (no LLM required) ─────────────
  const topMatch = matched[0];
  return {
    answer: `Based on **${topMatch.entity.title}** (${topMatch.entity.location}):\n${topMatch.snippet || topMatch.entity.content.slice(0, 200) + '…'}`,
    sources: matched.map(m => m.entity)
  };
}

