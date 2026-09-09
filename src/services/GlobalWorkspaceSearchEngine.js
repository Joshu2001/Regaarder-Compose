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
    explicitLower === 'notes' ||
    typeLower === 'meeting_note' ||
    typeLower === 'room_note' ||
    tLower.includes('room note') ||
    tLower.includes('meeting notes')
  ) {
    return {
      workspace: 'room',
      type: 'meeting_note',
      prefix: 'Room'
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
    explicitLower === 'browser-history' ||
    typeLower === 'browser_history'
  ) {
    return {
      workspace: 'browser-history',
      type: 'browser_history',
      prefix: 'Browser History'
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

  // Add currently open document / deck / sheet ONLY if it has real user content or custom title
  const hasActiveContent = currentPlainText.length > 0 || (currentDocTitle && isRealTitle(currentDocTitle));
  if (hasActiveContent && activeDocId) {
    const activeRes = resolveWorkspaceForEntity(currentDocTitle || 'Untitled Document', '', currentProductMode);
    const titleToUse = currentDocTitle || `${activeRes.prefix === 'Deck' ? 'Deck' : activeRes.prefix === 'Sheets' ? 'Sheet' : 'Document'}`;
    items.push({
      id: `doc-active-${activeDocId || 'current'}`,
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

  // Add other saved documents ONLY if they have real content or a real custom title
  docs.forEach((doc, idx) => {
    if (doc.id === activeDocId) return; // avoid duplicate with active document
    const plainText = stripHtml(doc.bodyHtml || doc.content || '').trim();
    const rawTitle = (doc.title || '').trim();
    if (!plainText && (!rawTitle || !isRealTitle(rawTitle))) {
      return; // Skip empty / placeholder documents
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
  });

  // 2. Real Spreadsheets
  if (context.sheetsTitle && currentProductMode === 'sheets') {
    const sheetTitle = context.sheetsTitle.trim();
    if (isRealTitle(sheetTitle) || context.hasImportedData || (context.sheetGrids && Object.keys(context.sheetGrids).length > 0)) {
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
  }

  // 3. Real Presentations & Slides
  if (context.deckTitle && currentProductMode === 'deck') {
    const deckTitle = context.deckTitle.trim();
    if (isRealTitle(deckTitle)) {
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
  }

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
      const roomTranscript = (r.transcript || r.content || '').trim();
      items.push({
        id: `room-${r.id || roomTitle}`,
        type: 'meeting',
        workspace: 'room',
        title: roomTitle,
        subtitle: r.subtitle || 'Active Meeting Room',
        location: `Room > ${roomTitle}`,
        content: roomTranscript,
        author: r.host || 'You',
        authorRole: 'Host',
        updatedAt: r.updatedAt || 'Active',
        resourceType: 'meeting',
        metadata: {
          roomId: r.id,
          deepLink: `room://${r.id || roomTitle}`,
          createdAt: r.createdAt || r.updatedAt || new Date().toISOString(),
          modifiedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
          activityAt: r.updatedAt || r.createdAt || new Date().toISOString(),
          activityType: 'meeting'
        }
      });

      if (roomTranscript) {
        items.push({
          id: `room-note-${r.id || roomTitle}`,
          type: 'meeting_note',
          workspace: 'room',
          title: `${roomTitle} Notes`,
          subtitle: 'Room notes and meeting transcript summary',
          location: `Room Notes > ${roomTitle}`,
          content: roomTranscript,
          author: r.host || 'You',
          authorRole: 'Host',
          updatedAt: r.updatedAt || 'Active',
          resourceType: 'meeting_note',
          metadata: {
            roomId: r.id,
            sourceRoomTitle: roomTitle,
            deepLink: `room://${r.id || roomTitle}/notes`,
            createdAt: r.createdAt || r.updatedAt || new Date().toISOString(),
            modifiedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
            activityAt: r.updatedAt || r.createdAt || new Date().toISOString(),
            activityType: 'meeting_note'
          }
        });
      }
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
        resourceType: 'research_note',
        metadata: {
          sourceUrl: n.url,
          deepLink: n.url || `browser://${n.id || noteTitle}`,
          createdAt: n.createdAt || n.updatedAt || new Date().toISOString(),
          modifiedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
          activityAt: n.updatedAt || n.createdAt || new Date().toISOString(),
          activityType: 'research_note'
        }
      });
    });
  }

  // Browser History: independent from notes and workspace content
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
          items.push({
            id: `browser-history-${tab.id || tab.url}`,
            type: 'browser_history',
            workspace: 'browser-history',
            title: tab.title || tab.url || 'Browser History',
            subtitle: tab.url || 'Browser research and AI chat',
            location: `Browser History > ${tab.title || tab.url}`,
            content,
            author: 'You',
            authorRole: 'Researcher',
            updatedAt: tab.updatedAt || 'Recently visited',
            resourceType: 'browser_history',
            metadata: {
              browserTabId: tab.id,
              url: tab.url,
              query: tab.query || '',
              messageCount: messages.length,
              deepLink: tab.url || `browser-history://${tab.id || tab.url}`,
              createdAt: tab.createdAt || tab.updatedAt || new Date().toISOString(),
              modifiedAt: tab.updatedAt || tab.createdAt || new Date().toISOString(),
              activityAt: tab.updatedAt || tab.createdAt || new Date().toISOString(),
              activityType: 'browser_history'
            }
          });
        });
      }
    } catch (_) {}
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
        content: `${personName} ${p.role || ''} ${p.email || ''}`,
        resourceType: 'person',
        metadata: {
          deepLink: `people://${p.id || personName}`,
          createdAt: p.createdAt || new Date().toISOString(),
          modifiedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
          activityAt: p.updatedAt || p.createdAt || new Date().toISOString(),
          activityType: 'person'
        }
      });
    });
  }

  const whiteboards = context.whiteboards || context.whiteboardWidgets ? [{ title: 'Whiteboard', id: 'whiteboard-current' }] : [];
  if (Array.isArray(whiteboards) && whiteboards.length > 0) {
    whiteboards.forEach((w, idx) => {
      const title = (w.title || w.name || `Whiteboard ${idx + 1}`).trim();
      items.push({
        id: `whiteboard-${w.id || idx}`,
        type: 'whiteboard',
        workspace: 'whiteboard',
        title,
        subtitle: 'Visual board and collaboration canvas',
        location: `Whiteboard > ${title}`,
        content: w.content || w.summary || 'Whiteboard content and annotations',
        author: w.author || 'You',
        authorRole: 'Creator',
        updatedAt: w.updatedAt || 'Recently updated',
        resourceType: 'whiteboard',
        metadata: {
          deepLink: `whiteboard://${w.id || title}`,
          createdAt: w.createdAt || w.updatedAt || new Date().toISOString(),
          modifiedAt: w.updatedAt || w.createdAt || new Date().toISOString(),
          activityAt: w.updatedAt || w.createdAt || new Date().toISOString(),
          activityType: 'whiteboard'
        }
      });
    });
  }

  const comments = context.comments || [];
  if (Array.isArray(comments) && comments.length > 0) {
    comments.forEach((comment, idx) => {
      const body = (comment.text || comment.content || comment.body || '').trim();
      if (!body) return;
      items.push({
        id: `comment-${comment.id || idx}`,
        type: 'comment',
        workspace: 'comments',
        title: comment.title || 'Comment',
        subtitle: comment.app || 'Workspace Comment',
        location: `Comments > ${comment.location || comment.app || 'Workspace'}`,
        content: body,
        author: comment.author || 'You',
        authorRole: 'Commenter',
        updatedAt: comment.updatedAt || comment.createdAt || 'Recently commented',
        resourceType: 'comment',
        metadata: {
          deepLink: comment.deepLink || `comment://${comment.id || idx}`,
          createdAt: comment.createdAt || comment.updatedAt || new Date().toISOString(),
          modifiedAt: comment.updatedAt || comment.createdAt || new Date().toISOString(),
          activityAt: comment.updatedAt || comment.createdAt || new Date().toISOString(),
          activityType: 'comment'
        }
      });
    });
  }

  const chatTabs = context.chatTabs || [];
  if (Array.isArray(chatTabs) && chatTabs.length > 0) {
    chatTabs.forEach((tab, idx) => {
      const messages = Array.isArray(tab.messages) ? tab.messages : [];
      const text = messages.map((m) => `${m.role || 'User'}: ${m.text || m.content || ''}`).join('\n');
      if (!text && !tab.title) return;
      items.push({
        id: `chat-${tab.id || idx}`,
        type: 'chat',
        workspace: 'chat',
        title: tab.title || `Chat ${idx + 1}`,
        subtitle: 'Assistant sidebar conversation history',
        location: `Chats > ${tab.title || `Chat ${idx + 1}`}`,
        content: text || `${tab.title || 'Conversation'} history`,
        author: 'Assistant',
        authorRole: 'AI',
        updatedAt: tab.updatedAt || 'Recent',
        resourceType: 'chat',
        metadata: {
          deepLink: `chat://${tab.id || idx}`,
          createdAt: tab.createdAt || tab.updatedAt || new Date().toISOString(),
          modifiedAt: tab.updatedAt || tab.createdAt || new Date().toISOString(),
          activityAt: tab.updatedAt || tab.createdAt || new Date().toISOString(),
          activityType: 'chat'
        }
      });
    });
  }

  const schedule = context.scheduleAgendaItems || [];
  if (Array.isArray(schedule) && schedule.length > 0) {
    schedule.forEach((event, idx) => {
      const title = event.title || event.name || `Meeting ${idx + 1}`;
      const dateText = [event.date, event.startTime, event.endTime].filter(Boolean).join(' ');
      const content = [title, dateText, event.summary || event.description || ''].filter(Boolean).join(' ');
      items.push({
        id: `schedule-${event.id || idx}`,
        type: 'schedule_event',
        workspace: 'schedule',
        title,
        subtitle: dateText || 'Scheduled event',
        location: `Schedule > ${title}`,
        content,
        author: event.organizer || 'Workspace',
        authorRole: 'Schedule',
        updatedAt: event.updatedAt || dateText || 'Scheduled',
        resourceType: 'schedule_event',
        metadata: {
          deepLink: `schedule://${event.id || idx}`,
          createdAt: event.createdAt || event.date || new Date().toISOString(),
          modifiedAt: event.updatedAt || event.createdAt || event.date || new Date().toISOString(),
          activityAt: event.date || event.updatedAt || new Date().toISOString(),
          activityType: 'schedule_event'
        }
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
      if (activeFilter === 'room' || activeFilter === 'rooms') return item.workspace === 'room' && (item.type === 'meeting' || item.type === 'meeting_note') || item.type === 'meeting';
      if (activeFilter === 'notes') return item.workspace === 'room' && item.type === 'meeting_note';
      if (activeFilter === 'browser' || activeFilter === 'research') return item.workspace === 'browser' || item.type === 'research_note';
      if (activeFilter === 'browser-history') return item.type === 'browser_history' || item.workspace === 'browser-history';
      if (activeFilter === 'people') return item.workspace === 'people' || item.type === 'person';
      if (activeFilter === 'relay' || activeFilter === 'chat' || activeFilter === 'dm') return item.workspace === 'relay' || item.type === 'chat';
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
    notes: { label: 'Room Notes', workspace: 'notes', items: [] },
    browserHistory: { label: 'Browser History', workspace: 'browser-history', items: [] },
    whiteboards: { label: 'Whiteboards', workspace: 'whiteboard', items: [] },
    comments: { label: 'Comments', workspace: 'comments', items: [] },
    chats: { label: 'Chats', workspace: 'chat', items: [] },
    schedule: { label: 'Schedule', workspace: 'schedule', items: [] },
    people: { label: 'People & Collaborators', workspace: 'people', items: [] },
    research: { label: 'Research & Notes', workspace: 'browser', items: [] }
  };

  scoredResults.forEach(res => {
    const ws = (res.entity.workspace || '').toLowerCase();
    const type = (res.entity.type || '').toLowerCase();

    if (type === 'browser_history' || ws === 'browser-history') groups.browserHistory.items.push(res);
    else if (ws === 'compose' || type === 'document') groups.docs.items.push(res);
    else if (ws === 'sheets' || type === 'sheet') groups.sheets.items.push(res);
    else if (ws === 'deck' || type === 'slide') groups.decks.items.push(res);
    else if (ws === 'tasks' || type === 'task') groups.tasks.items.push(res);
    else if (ws === 'room' && (type === 'meeting_note' || type === 'room_note')) groups.notes.items.push(res);
    else if (ws === 'room' || type === 'meeting') groups.rooms.items.push(res);
    else if (ws === 'whiteboard' || type === 'whiteboard') groups.whiteboards.items.push(res);
    else if (ws === 'comments' || type === 'comment') groups.comments.items.push(res);
    else if (ws === 'chat' || type === 'chat') groups.chats.items.push(res);
    else if (ws === 'schedule' || type === 'schedule_event') groups.schedule.items.push(res);
    else if (ws === 'people' || type === 'person') groups.people.items.push(res);
    else if (ws === 'browser' || type === 'research_note') groups.research.items.push(res);
    else groups.research.items.push(res);
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

