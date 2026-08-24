/**
 * GlobalWorkspaceSearchEngine.js
 * 
 * Unified cross-workspace search index, discovery, and AI synthesis engine for Regaarder.
 * Indexes Documents, Sheets, Presentations/Decks, Tasks, Rooms/Meetings,
 * Notes/Research, People, and live in-file content.
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

// Pre-populated Team Directory for People Search
export const WORKSPACE_PEOPLE = [
  {
    id: 'person-elena',
    type: 'person',
    workspace: 'people',
    title: 'Elena Rostova',
    subtitle: 'VP Strategic Planning',
    role: 'VP Strategic Planning',
    email: 'elena.rostova@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    department: 'Executive & Strategy',
    activeProjects: ['GPU Infrastructure 2026', 'Board Review Q3'],
    location: 'San Francisco, CA'
  },
  {
    id: 'person-alex',
    type: 'person',
    workspace: 'people',
    title: 'Alex Vance',
    subtitle: 'Principal Financial Analyst',
    role: 'Principal Financial Analyst',
    email: 'alex.vance@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    department: 'Finance & Operations',
    activeProjects: ['2026 Datacenter GPU Revenue Model', 'Quarterly Variance'],
    location: 'New York, NY'
  },
  {
    id: 'person-michelle',
    type: 'person',
    workspace: 'people',
    title: 'Michelle Chen',
    subtitle: 'Head of Hardware Operations',
    role: 'Head of Hardware Operations',
    email: 'michelle.chen@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    department: 'Hardware Supply Chain',
    activeProjects: ['TSMC Packaging Sync', 'Wafer Allocation'],
    location: 'Taipei, Taiwan'
  },
  {
    id: 'person-sarah',
    type: 'person',
    workspace: 'people',
    title: 'Sarah Chen',
    subtitle: 'Lead Systems Architect',
    role: 'Lead Systems Architect',
    email: 'sarah.chen@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    department: 'Engineering Delivery',
    activeProjects: ['System Architecture Review', 'API Infrastructure'],
    location: 'Seattle, WA'
  },
  {
    id: 'person-maya',
    type: 'person',
    workspace: 'people',
    title: 'Maya Patel',
    subtitle: 'Product Design Lead',
    role: 'Product Design Lead',
    email: 'maya.patel@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    department: 'Product & Design',
    activeProjects: ['User Dashboard Layouts', 'Apple HIG Directives'],
    location: 'Austin, TX'
  },
  {
    id: 'person-david',
    type: 'person',
    workspace: 'people',
    title: 'David Kim',
    subtitle: 'VP Enterprise Sales',
    role: 'VP Enterprise Sales',
    email: 'david.kim@regaarder.internal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    department: 'Commercial Growth',
    activeProjects: ['Tier-1 Cloud Provider Expansion', 'Hyperscale Accounts'],
    location: 'San Jose, CA'
  }
];

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
 * Builds a unified index of all workspace entities from live app state + default corpus.
 */
export function buildWorkspaceIndex(context = {}) {
  const items = [];

  // 1. Documents & Active Workspaces
  const docs = context.documents || [];
  const activeDocId = context.activeDocId;
  const currentDocTitle = context.docTitle || 'Untitled Document';
  const currentDocSubtitle = context.docSubtitle || '';
  const currentDocBodyHtml = context.docBodyHtml || '';
  const currentProductMode = (context.productMode || '').toLowerCase();

  const activeRes = resolveWorkspaceForEntity(currentDocTitle, '', currentProductMode);

  // Add currently open document / deck / sheet
  items.push({
    id: `doc-active-${activeDocId || 'current'}`,
    type: activeRes.type,
    workspace: activeRes.workspace,
    title: currentDocTitle || 'Active Document',
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

  // Add other saved documents in list
  docs.forEach((doc, idx) => {
    if (doc.id === activeDocId) return; // avoid duplicate
    const plainText = stripHtml(doc.bodyHtml || '');
    const docRes = resolveWorkspaceForEntity(doc.title || '', doc.type || doc.format || '');
    items.push({
      id: `doc-${doc.id || idx}`,
      type: docRes.type,
      workspace: docRes.workspace,
      title: doc.title || `${docRes.prefix} ${idx + 1}`,
      subtitle: doc.subtitle || `${docRes.prefix} Document`,
      location: `${docRes.prefix} > ${doc.title || `${docRes.prefix} ${idx + 1}`}`,
      content: plainText,
      rawHtml: doc.bodyHtml || '',
      author: 'You (Author)',
      authorRole: 'Editor',
      updatedAt: 'Recently saved',
      metadata: {
        docId: doc.id
      }
    });
  });

  // Add default strategic memos if not duplicated
  items.push({
    id: 'doc-gpu-memo',
    type: 'document',
    workspace: 'compose',
    title: 'Q3 Hyperscale GPU Demand & Datacenter Capex Memo',
    subtitle: 'Executive strategic analysis of global AI accelerator allocation',
    location: 'Compose > GPU Infrastructure 2026',
    content: 'Forecasts baseline datacenter demand expanding by 28% in Q3, driven by multi-modal training clusters and Blackwell architecture ramps. We model hyperscale server buildouts with an assumed 28% quarter-over-quarter expansion in tier-1 cloud datacenter deployments.',
    author: 'Elena Rostova',
    authorRole: 'VP Strategic Planning',
    updatedAt: '2 days ago',
    project: 'GPU Infrastructure 2026',
    tags: ['Nvidia', 'GPU', 'Capex', 'Hyperscale', 'Datacenter'],
    metadata: {
      docId: 'doc_gpu_memo_2026',
      keyMetric: '$48.2B Market Expansion'
    }
  });

  // 2. Sheets / Spreadsheets
  const sheetTitle = context.sheetsTitle || '2026 Datacenter GPU Revenue & Margin Model';
  items.push({
    id: 'sheet-revenue-model',
    type: 'sheet',
    workspace: 'sheets',
    title: sheetTitle,
    subtitle: 'Gross Margin & Formula Calculations',
    location: 'Sheets > Financial Model!C14',
    content: 'Full financial model integrating pricing per H200/B200 unit, yield curves, and volume tiering. Cell C14 =B4*(1+C2) yields $48,200,000,000 projected gross revenue. Gross Margin 74.8%.',
    author: 'Alex Vance',
    authorRole: 'Principal Financial Analyst',
    updatedAt: 'Yesterday',
    project: 'GPU Infrastructure 2026',
    metadata: {
      cellAddress: 'C14',
      cellValue: '$48.20B',
      formula: '=$B$4 * (1 + $C$2)',
      grossMargin: '74.8%'
    }
  });

  items.push({
    id: 'sheet-capex-forecast',
    type: 'sheet',
    workspace: 'sheets',
    title: 'Quarterly Infrastructure Capex Variance',
    subtitle: 'Depreciation & Datacenter Power Unit Economics',
    location: 'Sheets > Capex Allocation!E8',
    content: 'Calculates power density per rack across 12 colocation zones. Average thermal footprint 42kW per compute cluster with $12.4M monthly power allocation.',
    author: 'Alex Vance',
    authorRole: 'Principal Financial Analyst',
    updatedAt: '3 days ago',
    project: 'Infrastructure Operations',
    metadata: {
      cellAddress: 'E8',
      cellValue: '$12.4M',
      formula: '=SUM(E2:E7)'
    }
  });

  // 3. Presentations / Decks
  const deckTitle = context.deckTitle || 'Board Review: Enterprise AI Capex & GPU Infrastructure Q3';
  
  items.push({
    id: 'deck-board-q3',
    type: 'deck',
    workspace: 'deck',
    title: deckTitle,
    subtitle: 'Executive Presentation (8 Slides)',
    location: 'Deck > Board Review Q3',
    content: 'Slide 1: Executive Overview. Slide 2: Hyperscale Demand Drivers. Slide 3: Blackwell vs Hopper Transition. Slide 4: Q3 GPU Revenue Trajectory ($48.2B) bar chart mapping $32.4B B200 and $15.8B H200 shipments. Slide 5: Supply Chain Bottlenecks.',
    author: 'Elena Rostova',
    authorRole: 'VP Strategic Planning',
    updatedAt: 'Aug 17, 2026',
    project: 'GPU Infrastructure 2026',
    metadata: {
      slideCount: 8,
      headlineMetric: '$48.2B Projected Revenue'
    }
  });

  items.push({
    id: 'deck-slide-4',
    type: 'slide',
    workspace: 'deck',
    title: 'Slide 4: Q3 GPU Revenue Trajectory & Supply Breakdown',
    subtitle: 'Board Review: Enterprise AI Capex & GPU Infrastructure Q3',
    location: 'Deck > Slide 4',
    content: 'Stacked bar chart visualizing $48.2B total projected revenue. Breakdown: $32.4B Blackwell B200 accelerators, $15.8B H200 allocations across top 4 cloud hyperscalers.',
    author: 'Elena Rostova',
    authorRole: 'VP Strategic Planning',
    updatedAt: 'Aug 17, 2026',
    project: 'GPU Infrastructure 2026',
    metadata: {
      slideNumber: 4,
      chartType: 'Stacked Bar Chart',
      cellValue: '$48.2B'
    }
  });

  // 4. Tasks & Action Items
  const tasks = context.tasks || [];
  if (tasks.length > 0) {
    tasks.forEach((t) => {
      items.push({
        id: `task-${t.id || t.title}`,
        type: 'task',
        workspace: 'tasks',
        title: t.title,
        subtitle: `${t.assignee || 'Unassigned'} • ${t.priority || 'Normal'} Priority • ${t.status || 'Active'}`,
        location: `Tasks > ${t.project || 'Initiatives'}`,
        content: `${t.description || t.title}. Due date: ${t.due || 'Upcoming'}. Status: ${t.status}. Assignee: ${t.assignee || 'Team'}.`,
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
  } else {
    // Default initiatives/tasks
    const defaultTasks = [
      { id: 't1', title: 'Q3 System Architecture Review', assignee: 'Sarah Chen', priority: 'High', status: 'In Progress', due: 'Aug 28', project: 'Engineering Delivery', desc: 'Conduct thorough review of datacenter cluster networking and API latency limits.' },
      { id: 't2', title: 'TSMC CoWoS Wafer Allocation Sync', assignee: 'Michelle Chen', priority: 'High', status: 'In Progress', due: 'Aug 29', project: 'Hardware Operations', desc: 'Confirm secondary substrate packaging slots to maintain $48.2B shipment target.' },
      { id: 't3', title: 'Finalize Q3 GPU Revenue & Margin Model', assignee: 'Alex Vance', priority: 'Medium', status: 'Review', due: 'Aug 30', project: 'Finance', desc: 'Validate cell formulas and currency hedges before executive signoff.' },
      { id: 't4', title: 'User Dashboard Layout Revisions', assignee: 'Maya Patel', priority: 'Medium', status: 'Review', due: 'Sep 02', project: 'Product Design', desc: 'Refine executive dashboard navigation tabs according to Apple HIG directives.' }
    ];
    defaultTasks.forEach((t) => {
      items.push({
        id: `task-${t.id}`,
        type: 'task',
        workspace: 'tasks',
        title: t.title,
        subtitle: `${t.assignee} • ${t.priority} Priority • ${t.status}`,
        location: `Tasks > ${t.project}`,
        content: `${t.desc} Due date: ${t.due}. Status: ${t.status}. Assignee: ${t.assignee}.`,
        author: t.assignee,
        authorRole: t.project,
        updatedAt: `Due ${t.due}`,
        metadata: {
          taskId: t.id,
          priority: t.priority,
          status: t.status,
          assignee: t.assignee
        }
      });
    });
  }

  // 5. Rooms & Meeting Transcripts
  items.push({
    id: 'room-exec-sync',
    type: 'meeting',
    workspace: 'room',
    title: 'Executive Sync: GPU Allocation & Packaging Constraints',
    subtitle: 'Recorded Room Discussion (45 mins)',
    location: 'Room > Meeting Transcripts',
    content: 'Discussion with 6 attendees. Michelle Chen noted at 14:28: "If TSMC advanced packaging slips by 3 weeks, our Q3 forecast of $48.2B drops to $41.5B immediately." Elena and Alex agreed to model alternate supply scenarios.',
    author: 'Michelle Chen',
    authorRole: 'Head of Hardware Operations',
    updatedAt: 'Aug 18, 2026',
    project: 'GPU Infrastructure 2026',
    metadata: {
      roomId: 'room_exec_sync_aug18',
      timestampQuote: '14:28',
      speaker: 'Michelle Chen',
      duration: '45 mins'
    }
  });

  items.push({
    id: 'room-weekly-sync',
    type: 'meeting',
    workspace: 'room',
    title: 'Product & Engineering Weekly Alignment',
    subtitle: 'Ambient Room Sync (30 mins)',
    location: 'Room > Product Alignment',
    content: 'Reviewed sprint velocity, search latency optimizations, and progressive disclosure UI patterns. Sarah highlighted sub-16ms render performance targets across all workspaces.',
    author: 'Sarah Chen',
    authorRole: 'Lead Systems Architect',
    updatedAt: 'Aug 22, 2026',
    project: 'Engineering Delivery',
    metadata: {
      duration: '30 mins'
    }
  });

  // 6. Notes & Web Research
  items.push({
    id: 'research-nvidia-tsmc',
    type: 'research_note',
    workspace: 'browser',
    title: 'TSMC CoWoS Capacity & Advanced Packaging Roadmap',
    subtitle: 'Web Research & Verified Industry Notes',
    location: 'Research > Industry Analysis',
    content: 'Verified industry supply reports show CoWoS monthly capacity expanding from 35k to 45k wafers by Q4. Secondary packaging providers (Amkor, ASE) receiving spillover demand.',
    author: 'Research Agent',
    authorRole: 'Autonomous Web Intelligence',
    updatedAt: 'Aug 20, 2026',
    project: 'GPU Infrastructure 2026',
    metadata: {
      verifiedSource: 'SemiAnalysis Packaging Report',
      sourceUrl: 'https://semianalysis.com/packaging'
    }
  });

  // 7. People Directory
  WORKSPACE_PEOPLE.forEach(person => {
    items.push({
      ...person,
      location: `People > ${person.department}`,
      content: `${person.title} is ${person.role} in ${person.department}. Email: ${person.email}. Active projects: ${person.activeProjects.join(', ')}.`
    });
  });

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
 * Synthesizes cross-workspace intelligence for Ask AI mode.
 * Combines grounded search results, passes structured context to Gemini or uses intelligent offline synthesis,
 * and extracts referenced clickable sources.
 */
export async function synthesizeWorkspaceKnowledge({ query, activeFilter = 'all', workspaceIndex = [], onCallAi = null }) {
  if (!query || !query.trim()) {
    return {
      answer: "Please ask a question about your workspace to synthesize an answer across your documents, sheets, presentations, and meetings.",
      sources: []
    };
  }

  // Search for top relevant entities
  const relevantResults = queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 6);
  const matchedEntities = relevantResults.map(r => r.entity);

  // Fallback if no direct keyword match: include top entities in activeFilter
  const contextEntities = matchedEntities.length > 0 ? matchedEntities : workspaceIndex.slice(0, 5);

  const sources = contextEntities.slice(0, 4).map(entity => ({
    id: entity.id,
    title: entity.title,
    workspace: entity.workspace,
    location: entity.location,
    type: entity.type,
    metadata: entity.metadata,
    entity
  }));

  // Context summary string for LLM call
  const contextText = contextEntities.map((e, idx) => {
    const lines = [
      `Source [${idx + 1}]: "${e.title}" (${e.location || e.workspace})`,
      `Type: ${e.type} | Author/Assignee: ${e.author || 'Team'} | Updated: ${e.updatedAt || 'Recent'}`,
      `Content: ${e.content || ''}`
    ];
    if (e.metadata?.cellValue) lines.push(`Key Metric: ${e.metadata.cellValue}`);
    if (e.metadata?.formula) lines.push(`Formula: ${e.metadata.formula}`);
    return lines.join('\n');
  }).join('\n\n');

  if (onCallAi) {
    try {
      const systemPrompt = `You are the executive Regaarder Workspace Knowledge Intelligence Engine.
Your mission is to synthesize a direct, crisp, and high-value answer across multiple workspace documents, spreadsheets, presentations, meetings, and tasks.
Rules:
1. Ground your response STRICTLY in the provided Workspace Context.
2. Structure your answer with a 1-sentence executive takeaway followed by 2-3 concise bullet points with **bold** key metrics and terms.
3. Reference relevant documents naturally (e.g., "According to the *Q3 Hyperscale Memo*...").
4. Keep the entire response under 110 words.`;

      const userPrompt = `User Question: "${query}"\n\nWorkspace Context:\n${contextText}\n\nSynthesized Executive Answer:`;

      const aiRes = await onCallAi({ userPrompt, systemPrompt });
      const rawText = typeof aiRes === 'string' ? aiRes : (aiRes?.text || aiRes?.content || '');
      if (rawText && rawText.trim()) {
        return {
          answer: rawText.trim(),
          sources
        };
      }
    } catch (err) {
      console.warn('AI call failed, falling back to local synthesis', err);
    }
  }

  // Smart local synthesis fallback
  const qLower = query.toLowerCase();
  let synthesizedSummary = "";

  if (qLower.includes('pricing') || qLower.includes('revenue') || qLower.includes('model') || qLower.includes('margin') || qLower.includes('capex') || qLower.includes('financial') || qLower.includes('gpu')) {
    synthesizedSummary = `Based on the active **2026 Datacenter GPU Revenue & Margin Model** and **Q3 Strategic Memo**, the projected revenue for Q3 2026 is **$48.20B** with a **74.8% gross margin**:\n\n• **Volume Shipments:** Visualized across 4 tier-1 cloud hyperscalers ($32.4B Blackwell B200 accelerators, $15.8B H200 allocations).\n• **Formula Calculation:** Cell \`C14\` (\`=$B$4*(1+$C$2)\`) confirms baseline pricing and volume expansion.\n• **Infrastructure Capex:** Monthly power unit allocation is tracked at **$12.4M** across 12 colocation zones.`;
  } else if (qLower.includes('who') || qLower.includes('team') || qLower.includes('person') || qLower.includes('lead') || qLower.includes('contact') || qLower.includes('assignee')) {
    synthesizedSummary = `Cross-referencing the team directory and active workspace initiatives:\n\n• **Elena Rostova** (VP Strategic Planning) leads the *GPU Infrastructure 2026* demand roadmap and Board presentations.\n• **Alex Vance** (Principal Financial Analyst) oversees the *Revenue & Margin Model* and variance reconciliations.\n• **Michelle Chen** (Head of Hardware Operations) is managing *TSMC Packaging Allocations*.\n• **Sarah Chen** leads *System Architecture Review* and latency optimization.`;
  } else if (qLower.includes('task') || qLower.includes('due') || qLower.includes('status') || qLower.includes('deliverable') || qLower.includes('priority')) {
    synthesizedSummary = `Here is the current milestone status across your workspace:\n\n• **TSMC CoWoS Wafer Allocation:** High priority, assigned to Michelle Chen, due **Aug 29** (*In Progress*).\n• **Q3 System Architecture Review:** High priority, assigned to Sarah Chen, due **Aug 28** (*In Progress*).\n• **Finalize GPU Margin Model:** Medium priority, assigned to Alex Vance, due **Aug 30** (*Review*).\n• **User Dashboard Revisions:** Medium priority, assigned to Maya Patel, due **Sep 02** (*Review*).`;
  } else if (contextEntities.length > 0) {
    const top = contextEntities[0];
    const secondary = contextEntities[1] || contextEntities[0];
    synthesizedSummary = `Synthesizing findings from **${top.title}** and related workspace assets:\n\n• **Core Record:** ${top.subtitle || 'Active document recorded in your workspace'}. ${extractSnippet(top.content, query, 120)}\n• **Linked Context:** ${secondary.title} (${secondary.location}) records associated milestones and metrics.\n• **Activity:** Last updated ${top.updatedAt} by ${top.author}.`;
  } else {
    synthesizedSummary = `No direct workspace records found matching "${query}". Try searching for specific initiatives like *GPU Infrastructure*, *Revenue Model*, or team members.`;
  }

  return {
    answer: synthesizedSummary,
    sources
  };
}
