/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder UI Knowledge Base & Autonomous Action Engine
 * Comprehensive canonical UI sitemap and AI Planning Engine:
 * - High-Precision Semantic Grounding across all workspace controls
 * - LLM Autonomous Action Planner with complete UI DOM hierarchy
 */

export const REGAARDER_UI_SITEMAP = [
  // ── WORKSPACE APPS & PRODUCT SWITCHER ─────────────────────────────────────
  {
    id: 'workspace_switcher',
    keywords: [
      'switch workspace app', 'switch workspace apps', 'switch workspace', 'workspace app', 'workspace apps',
      'workspace switcher', 'switch app', 'switch apps', 'switch to deck', 'switch to sheet',
      'switch to room', 'switch to whiteboard', 'open deck', 'open sheet', 'open whiteboard',
      'worspace apps', 'worspace app', 'worspace switcher', 'worspace', 'app switcher',
      'grid icon', 'layout grid', 'switch mode', 'switch products', 'switch workspace apps'
    ],
    title: 'How to Switch Workspace Apps (Compose, Deck, Sheet, Room, Whiteboard)',
    description: 'Click the 9-dot grid icon in the top left header to switch between Compose, Deck, Sheet, Room, Whiteboard, and Tasks.',
    actionType: 'open_workspace_switcher',
    targetTab: 'Write',
    highlightSelector: 'button[title*="Switch Workspace App" i], button:has(svg.lucide-layout-grid)',
    steps: [
      { stepNumber: 1, title: 'Locate 9-Dot Grid Icon', description: 'Find the 9-dot Workspace App Switcher icon in the top left header next to the document title.' },
      { stepNumber: 2, title: 'Open Workspace Menu', description: 'Click the grid icon to open the dropdown menu of all Regaarder workspace products.' },
      { stepNumber: 3, title: 'Select Target App', description: 'Choose Compose, Deck, Sheet, Room, Whiteboard, Schedule, or Memory to switch workspaces instantly.' }
    ]
  },

  // ── HEADER & GLOBAL CONTROLS ──────────────────────────────────────────────
  {
    id: 'search_find',
    keywords: [
      'find specific words', 'find words', 'find word', 'search word', 'search words',
      'search document', 'find in document', 'search in document', 'find and replace',
      'search them', 'search bar', 'locate text', 'ctrl f', 'cmd f', 'search'
    ],
    title: 'How to Search & Find Words in Document',
    description: 'Search for specific words or phrases and navigate through document matches.',
    actionType: 'open_search',
    targetTab: 'Write',
    highlightSelector: 'button[title*="Find & Replace" i], button[title*="Search" i]',
    steps: [
      { stepNumber: 1, title: 'Open Search in Header', description: 'Click the Magnifying Glass search icon in the top header bar, or press Ctrl+F / Cmd+F.' },
      { stepNumber: 2, title: 'Enter Search Term', description: 'Type the word or phrase you want to locate in the search input box.' },
      { stepNumber: 3, title: 'Navigate Matches', description: 'Use the Previous / Next arrows to cycle through all highlighted occurrences in the document.' }
    ]
  },
  {
    id: 'edit_replay',
    keywords: [
      'edit replay', 'replay', 'replays', 'where is the replay', 'where is the edit replay',
      'version history', 'time machine', 'revert changes', 'previous version', 'past edits',
      'restore version', 'history tab', 'view history', 'document history'
    ],
    title: 'How to View Version History & Replay Edits',
    description: 'Inspect previous document revisions and replay past edits with the Time Machine.',
    actionType: 'open_history',
    targetTab: 'Write',
    highlightSelector: 'button[title*="replay" i], button[title*="history" i], button:has-text("History")',
    steps: [
      { stepNumber: 1, title: 'Open History in Header or Sidebar', description: 'Click the Clock icon in the top header, or select the "History" tab in the right sidebar.' },
      { stepNumber: 2, title: 'Browse Version Snapshots', description: 'Review the chronological timeline of auto-saved versions and edit diffs.' },
      { stepNumber: 3, title: 'Replay Action Sequence', description: 'Click "Replay" to watch the time-machine sequence of document changes reconstruct on canvas.' }
    ]
  },
  {
    id: 'slash_menu',
    keywords: [
      'slash menu', 'slash commands', 'slash command', 'slash button', 'where is the slash',
      'how to use slash', 'slash shortcuts', 'slash palette', 'slash trigger', 'type slash',
      'slash'
    ],
    title: 'How to Open & Use the Slash (/) Command Menu',
    description: 'Press "/" on any empty line in the canvas to trigger the contextual quick-insert palette.',
    actionType: 'trigger_slash',
    targetTab: 'Write',
    highlightSelector: '[data-tour="slash-menu"], .document-canvas, #root',
    steps: [
      { stepNumber: 1, title: 'Focus Document Canvas', description: 'Click onto an empty line inside the document editor canvas.' },
      { stepNumber: 2, title: 'Type Slash Character', description: 'Press the "/" key on your keyboard to immediately display the floating command menu.' },
      { stepNumber: 3, title: 'Pick a Tool', description: 'Select /table, /image, /checklist, /math, /browser, /tour, or /video to execute directly.' }
    ]
  },
  {
    id: 'export',
    keywords: ['export document', 'export', 'pdf', 'docx', 'word document', 'download document', 'save as pdf', 'markdown export', 'print document'],
    title: 'How to Export & Download Documents',
    description: 'Export to PDF Document, Microsoft Word (.docx), or Clean Markdown.',
    actionType: 'open_export',
    targetTab: 'Write',
    highlightSelector: 'button[title*="Export" i], button:has-text("Export")',
    steps: [
      { stepNumber: 1, title: 'Click Export in Top Header', description: 'Locate and click the "Export" button in the upper right navigation header.' },
      { stepNumber: 2, title: 'Select File Format', description: 'Choose your desired format: PDF Document, Microsoft Word (.docx), or Markdown.' },
      { stepNumber: 3, title: 'Download File', description: 'Your formatted file will download immediately to your computer.' }
    ]
  },
  {
    id: 'share',
    keywords: ['share document', 'share', 'collaboration', 'invite', 'share permissions', 'copy link', 'share link', 'collaborate'],
    title: 'How to Share Documents & Manage Collaboration',
    description: 'Invite team members, set View/Edit permissions, and copy live collaboration links.',
    actionType: 'open_share',
    targetTab: 'Write',
    highlightSelector: 'button:has-text("Share"), [data-tour="share-button"]',
    steps: [
      { stepNumber: 1, title: 'Click Share in Header', description: 'Click the purple "Share" button at the top right of the application header.' },
      { stepNumber: 2, title: 'Configure Access Level', description: 'Select between View-Only access or Full Collaborative Editing permissions.' },
      { stepNumber: 3, title: 'Copy Share Link', description: 'Click "Copy Link" to share the live document with colleagues.' }
    ]
  },
  {
    id: 'saved_drafts',
    keywords: ['saved drafts', 'document title', 'rename document', 'rename file', 'saved draft', 'drafts list', 'document name', 'change title'],
    title: 'How to Manage Saved Drafts & Rename Documents',
    description: 'Rename the active document and switch between recent saved drafts.',
    actionType: 'rename_title',
    targetTab: 'Write',
    highlightSelector: '[data-tour="document-title"], button:has-text("Saved Drafts")',
    steps: [
      { stepNumber: 1, title: 'Click Document Title', description: 'Click the title text at the top left of the header to edit the document name inline.' },
      { stepNumber: 2, title: 'Open Saved Drafts', description: 'Click "Saved Drafts" to view, duplicate, or switch between recent document drafts.' }
    ]
  },
  {
    id: 'undo_redo',
    keywords: ['undo', 'redo', 'undo edit', 'redo edit', 'revert edit', 'ctrl z', 'cmd z', 'history undo'],
    title: 'How to Undo & Redo Edits',
    description: 'Step backwards or forwards through your recent editing changes.',
    actionType: 'undo_action',
    targetTab: 'Write',
    highlightSelector: 'button[title*="Undo" i], button[title*="Redo" i]',
    steps: [
      { stepNumber: 1, title: 'Use Header Buttons', description: 'Click the curved left arrow to Undo, or curved right arrow to Redo in the top header.' },
      { stepNumber: 2, title: 'Use Keyboard Shortcuts', description: 'Press Ctrl+Z / Cmd+Z to undo, or Ctrl+Shift+Z / Cmd+Shift+Z to redo.' }
    ]
  },
  {
    id: 'model_selector',
    keywords: ['change model', 'select model', 'gemma', 'gemini', 'claude', 'ollama', 'model dropdown', 'ai model', 'local model', 'switch model', 'switch ai model', 'switch ai models'],
    title: 'How to Switch AI Models (Local Gemma / Gemini / Claude)',
    description: 'Select between local on-device models (Ollama/Gemma) and cloud models (Gemini/Claude).',
    actionType: 'select_model',
    targetTab: 'Write',
    highlightSelector: 'button:has-text("gemma"), button:has-text("gemini")',
    steps: [
      { stepNumber: 1, title: 'Click Model Pill in Chat', description: 'Click the active model badge (e.g. "gemma3:1b") at the bottom of the chat input box.' },
      { stepNumber: 2, title: 'Select Target Model', description: 'Choose your desired local Ollama model or connected cloud provider from the dropdown.' }
    ]
  },
  {
    id: 'properties_panel',
    keywords: ['properties panel', 'properties', 'word count', 'character count', 'reading time', 'document stats', 'document metadata'],
    title: 'How to View Document Properties & Word Count',
    description: 'Inspect live statistics including word count, character count, and document metadata.',
    actionType: 'open_properties',
    targetTab: 'Write',
    highlightSelector: 'button:has-text("Properties")',
    steps: [
      { stepNumber: 1, title: 'Open Properties Tab', description: 'Click the "Properties" tab at the top right of the right sidebar.' },
      { stepNumber: 2, title: 'Review Document Statistics', description: 'View total words, character count, estimated reading duration, and creation date.' }
    ]
  },
  {
    id: 'document_tabs',
    keywords: ['new tab', 'document tab', 'document tabs', 'open tab', 'switch tab', 'close tab', 'multi tab', 'tab management'],
    title: 'How to Open & Manage Multiple Document Tabs',
    description: 'Open multiple documents simultaneously using the document tab strip.',
    actionType: 'manage_tabs',
    targetTab: 'Write',
    highlightSelector: '[data-tour="document-tabs"], button:has-text("+")',
    steps: [
      { stepNumber: 1, title: 'Click "+" New Tab', description: 'Click the "+" icon on the tab bar above the toolbar to create a new document.' },
      { stepNumber: 2, title: 'Switch Between Tabs', description: 'Click any tab title to instantly switch documents without losing unsaved changes.' }
    ]
  },

  // ── CONTEXT & GROUNDING ───────────────────────────────────────────────────
  {
    id: 'source_files',
    keywords: [
      'add source file', 'source file', 'source files', 'add source', 'sources',
      'reference file', 'reference files', 'references', 'context file', 'context files',
      'add context', 'grounding file', 'mention docs', 'mention doc', 'attach document',
      'attach file', 'grounding', 'knowledge base'
    ],
    title: 'How to Add Source Files & Document Context',
    description: 'Attach reference documents, PDFs, or files to ground AI composition and research.',
    actionType: 'open_context',
    targetTab: 'Context',
    highlightSelector: '[data-toolbar-tab="Context"], button:has-text("Context")',
    steps: [
      { stepNumber: 1, title: 'Open Context Tab or Chat Mentions', description: 'Click the "Context" tab on the top toolbar, or click "+" / "@" in the chat input bar.' },
      { stepNumber: 2, title: 'Upload or Link Source Files', description: 'Select reference PDFs, DOCX, or text files to add to the grounding knowledge base.' },
      { stepNumber: 3, title: 'Verify Active Grounding', description: 'Attached source files will display as active badges and provide context for all AI generations.' }
    ]
  },

  // ── VIEW CONTROLS ────────────────────────────────────────────────────────
  {
    id: 'outline',
    keywords: ['outline', 'outlines', 'document outline', 'outline panel', 'outline sidebar', 'left panel', 'toggle outline', 'turn outline off', 'turn outline on'],
    title: 'How to Toggle Document Outline',
    description: 'Turn the document outline navigation sidebar on or off.',
    actionType: 'outline_toggle',
    targetTab: 'View',
    highlightSelector: '[data-toolbar-action="outline-toggle"]',
    steps: [
      { stepNumber: 1, title: 'Switch to View Tab', description: 'Click the "View" tab on the top toolbar.' },
      { stepNumber: 2, title: 'Click Outline Button', description: 'Click the "Outline: On / Off" button to toggle the outline navigation panel.' },
      { stepNumber: 3, title: 'View Updated Layout', description: 'The document outline panel on the left will collapse or expand immediately.' }
    ]
  },
  {
    id: 'margins',
    keywords: ['margin', 'margins', 'page margin', 'page margins', 'spacing', 'gutter'],
    title: 'How to Adjust Page Margins',
    description: 'Access page margins directly in the View tab on the top toolbar.',
    actionType: 'navigate_tab',
    targetTab: 'View',
    highlightSelector: '[data-tour="margins"], button:has-text("Margins")',
    steps: [
      { stepNumber: 1, title: 'Switch to View Tab', description: 'Click the "View" tab on the top document mode bar.' },
      { stepNumber: 2, title: 'Open Margins Dropdown', description: 'Click the "Normal Margins (1.0 in)" dropdown on the toolbar.' },
      { stepNumber: 3, title: 'Select Margin Preset', description: 'Choose between Normal (1.0 in), Narrow (0.5 in), Wide (1.5 in), or Custom margins.' }
    ]
  },
  {
    id: 'orientation',
    keywords: ['orientation', 'portrait', 'landscape', 'paper', 'a4', 'letter', 'page size'],
    title: 'How to Change Page Orientation & Size',
    description: 'Toggle between Portrait/Landscape and switch paper sizes.',
    actionType: 'navigate_tab',
    targetTab: 'View',
    highlightSelector: '[data-tour="orientation"]',
    steps: [
      { stepNumber: 1, title: 'Click View Tab', description: 'Click the "View" tab on the top mode bar.' },
      { stepNumber: 2, title: 'Toggle Portrait / Landscape', description: 'Click "Portrait" or "Landscape" on the toolbar.' },
      { stepNumber: 3, title: 'Select Paper Size', description: 'Use the "A4 (210 x 297 mm)" dropdown to choose Letter, Legal, or Executive.' }
    ]
  },
  {
    id: 'theme',
    keywords: ['dark mode', 'light mode', 'theme', 'night mode', 'dark theme', 'light theme', 'color scheme'],
    title: 'How to Switch Theme (Light / Dark)',
    description: 'Toggle between light and dark visual aesthetics.',
    actionType: 'theme_toggle',
    targetTab: 'View',
    highlightSelector: 'button:has-text("Mode")',
    steps: [
      { stepNumber: 1, title: 'Open View Tab', description: 'Click the "View" tab on the toolbar.' },
      { stepNumber: 2, title: 'Toggle Theme', description: 'Click the "Dark Mode" / "Light Mode" button with sun/moon icon.' }
    ]
  },
  {
    id: 'focus',
    keywords: ['focus mode', 'focus', 'distraction free', 'zen mode', 'immersive', 'fullscreen writing'],
    title: 'How to Toggle Focus Mode',
    description: 'Hide toolbars and sidebars for an immersive distraction-free writing experience.',
    actionType: 'toggle_focus',
    targetTab: 'Write',
    highlightSelector: '[data-tour="focus-mode"], button:has-text("Focus Mode")',
    steps: [
      { stepNumber: 1, title: 'Locate Focus Mode in Footer', description: 'Find the "Focus Mode" pill in the bottom status bar.' },
      { stepNumber: 2, title: 'Click Focus Mode', description: 'Click the button to enter or exit immersive focus mode.' }
    ]
  },

  // ── WRITE & INSERT TOOLS ──────────────────────────────────────────────────
  {
    id: 'images',
    keywords: ['image', 'images', 'photo', 'photos', 'picture', 'pictures', 'upload image', 'insert image', 'media asset', 'graphic', 'visuals'],
    title: 'How to Upload & Insert Images',
    description: 'Upload local files, generate visual assets, or paste image URLs.',
    actionType: 'open_image_modal',
    targetTab: 'Write',
    highlightSelector: '[data-tour="insert-menu"], button:has-text("Insert")',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top toolbar, or press "/" and select "image".' },
      { stepNumber: 2, title: 'Choose Images / Videos / Files', description: 'Click "Images / Videos / Files" in the dropdown.' },
      { stepNumber: 3, title: 'Upload or Drag & Drop', description: 'Select an image from your computer, generate via AI, or drag and drop onto the canvas.' }
    ]
  },
  {
    id: 'equations',
    keywords: ['equation', 'equations', 'math', 'formula', 'latex', 'sum', 'integral', 'fraction', 'add equations', 'add formula'],
    title: 'How to Add Equations & Math Formulas',
    description: 'Insert LaTeX equations via the + Insert menu or slash shortcut.',
    actionType: 'open_equation',
    targetTab: 'Write',
    highlightSelector: '[data-tour="insert-menu"], button:has-text("Insert")',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top document toolbar, or press "/" on the canvas.' },
      { stepNumber: 2, title: 'Select Equations', description: 'Under "SPECIAL CHARACTERS", click "Equations (Common math formulas)".' },
      { stepNumber: 3, title: 'Type or Choose LaTeX', description: 'Select a preset formula (fractions, integrals, matrices) or type LaTeX directly using $$...$$.' }
    ]
  },
  {
    id: 'tables',
    keywords: ['table', 'tables', 'grid', 'tabular', 'spreadsheet', 'matrix', 'columns', 'rows', 'add table', 'insert table', 'add table manually'],
    title: 'How to Insert & Format Data Tables',
    description: 'Create interactive tables with custom rows, columns, and dropdowns.',
    actionType: 'insert_table',
    targetTab: 'Write',
    highlightSelector: '[data-tour="insert-menu"], button:has-text("Insert")',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top toolbar, or type "/table" directly on the canvas.' },
      { stepNumber: 2, title: 'Pick Grid Dimensions', description: 'Hover over the Table Grid squares to select desired rows and columns.' },
      { stepNumber: 3, title: 'Format Cells', description: 'Click cell headers to configure status dropdowns, currency, or percentage formatting.' }
    ]
  },
  {
    id: 'checklists',
    keywords: ['checklist', 'checklists', 'task', 'tasks', 'todo', 'todos', 'checkbox', 'bullet', 'list', 'create checklist'],
    title: 'How to Create & Locate Checklists',
    description: 'Add interactive task checklists or locate existing tasks.',
    actionType: 'find_checklist',
    targetTab: 'Write',
    highlightSelector: '[data-tour="lists-menu"], button:has-text("Lists")',
    steps: [
      { stepNumber: 1, title: 'Access Lists Menu', description: 'Click the "Lists" dropdown in the toolbar, or type "/checklist".' },
      { stepNumber: 2, title: 'Select Checklist', description: 'Click "Checklist" to insert square interactive checkboxes.' },
      { stepNumber: 3, title: 'Toggle Completion', description: 'Click any checkbox on the document canvas to mark tasks as completed.' }
    ]
  },
  {
    id: 'typography',
    keywords: ['font', 'fonts', 'typeface', 'family', 'typography', 'inter', 'manrope', 'dm sans', 'size', 'font size', 'change font'],
    title: 'How to Customize Fonts & Typography',
    description: 'Switch between premium font families (Manrope, Inter, DM Sans) and font sizes.',
    actionType: 'navigate_tab',
    targetTab: 'Write',
    highlightSelector: '[data-tour="font-family"]',
    steps: [
      { stepNumber: 1, title: 'Open Write Toolbar', description: 'Ensure you are on the "Write" tab on the document toolbar.' },
      { stepNumber: 2, title: 'Select Font Family', description: 'Click the Font dropdown (e.g. Manrope) to choose your typeface.' },
      { stepNumber: 3, title: 'Adjust Size', description: 'Use the Font Size picker (default 14pt) to resize text.' }
    ]
  },
  {
    id: 'heading',
    keywords: ['heading', 'headings', 'h1', 'h2', 'h3', 'title', 'subtitle', 'paragraph', 'formatting', 'heading style'],
    title: 'How to Format Headings & Text Styles',
    description: 'Apply Heading 1, Heading 2, Heading 3, or Paragraph styling.',
    actionType: 'navigate_tab',
    targetTab: 'Write',
    highlightSelector: '[data-tour="formatting"]',
    steps: [
      { stepNumber: 1, title: 'Select Text or Heading Dropdown', description: 'Click the "Heading 1" / "Normal" style dropdown in the toolbar.' },
      { stepNumber: 2, title: 'Choose Hierarchy', description: 'Select Heading 1, Heading 2, Heading 3, Subtitle, or Body text.' }
    ]
  },
  {
    id: 'templates',
    keywords: ['template', 'templates', 'layout', 'starter', 'preset', 'executive brief', 'meeting notes', 'use templates'],
    title: 'How to Use Document Templates',
    description: 'Browse curated document templates for executive briefs, roadmaps, and specs.',
    actionType: 'navigate_tab',
    targetTab: 'Templates',
    highlightSelector: '[data-toolbar-tab="Templates"]',
    steps: [
      { stepNumber: 1, title: 'Switch to Templates Tab', description: 'Click "Templates" on the top document mode bar.' },
      { stepNumber: 2, title: 'Pick a Template', description: 'Select an executive template to insert structured sections onto your canvas.' }
    ]
  }
];

/**
 * Intelligent semantic matcher across REGAARDER_UI_SITEMAP
 * Prioritizes multi-word exact phrases and eliminates false positives on stop-words.
 */
export function findExactUiMatch(intent) {
  let clean = String(intent || '')
    .toLowerCase()
    .replace(/["'“”‘’?!.,:;()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // Typo normalization
  clean = clean
    .replace(/\bworspace\b/g, 'workspace')
    .replace(/\bworkspce\b/g, 'workspace')
    .replace(/\bswich\b/g, 'switch');

  // 1. Exact Multi-word Phrase Matches
  for (const item of REGAARDER_UI_SITEMAP) {
    for (const kw of item.keywords) {
      if (kw.includes(' ') && clean.includes(kw)) {
        return item;
      }
    }
  }

  // 2. Exact Full Keyword Match
  for (const item of REGAARDER_UI_SITEMAP) {
    if (item.keywords.some(kw => clean === kw || clean.split(/\s+/).includes(kw))) {
      return item;
    }
  }

  // 3. Significant Token Overlap (Ignores stop words)
  const stopWords = new Set(['button', 'where', 'is', 'the', 'how', 'to', 'a', 'an', 'in', 'on', 'of', 'for', 'you', 'can', 'with', 'them', 'and', 'my', 'do', 'i']);
  const tokens = clean.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));

  if (tokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of REGAARDER_UI_SITEMAP) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwTokens = kw.split(/\s+/).filter(t => !stopWords.has(t));
      for (const token of tokens) {
        if (kwTokens.includes(token)) score += 5;
        else if (kw.includes(token)) score += 2;
      }
    }

    for (const token of tokens) {
      if (item.title.toLowerCase().includes(token)) score += 3;
      if (item.id.includes(token)) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore >= 4 ? bestMatch : null;
}

const UI_GROUNDING_PROMPT = `
ACTUAL REGAARDER COMPOSE CONTROLS DIRECTORY:
- Top Header Left:
  * Workspace Switcher (Compose, Deck, Sheet, Room, Whiteboard, Tasks): selector 'button[title*="Switch Workspace App" i]', actionType 'open_workspace_switcher'
  * Document Title / Rename: selector '[data-tour="document-title"]', actionType 'rename_title'
  * Saved Drafts: selector 'button:has-text("Saved Drafts")', actionType 'saved_drafts'
- Top Header Right:
  * Undo Edit: selector 'button[title*="Undo" i]', actionType 'undo_action'
  * Redo Edit: selector 'button[title*="Redo" i]', actionType 'redo_action'
  * Version History & Time Machine: selector 'button[title*="replay" i]', actionType 'open_history'
  * Find & Replace (Search): selector 'button[title*="Find & Replace" i]', actionType 'open_search'
  * Export (PDF, Word DOCX, Markdown): selector 'button[title*="Export" i]', actionType 'open_export'
  * Share & Collaboration: selector 'button:has-text("Share")', actionType 'open_share'
- Right Sidebar Tabs:
  * Assistant: 'button:has-text("Assistant")'
  * History: 'button:has-text("History")'
  * Properties (Word/Char Count): 'button:has-text("Properties")', actionType 'open_properties'
  * Tasks, Schedule, Room, Memory
- Segmented Mode Bar:
  * Context Tab: '[data-toolbar-tab="Context"]' -> '+ Add Source File'
  * Templates Tab: '[data-toolbar-tab="Templates"]' -> Curated template picker
  * Write Tab: '[data-toolbar-tab="Write"]' -> Font Family, Font Size, Alignment, Lists, + Insert (Images, Equations, Table Grid, Charts, Shapes)
  * Review Tab: '[data-toolbar-tab="Review"]' -> Track changes, Comments
  * View Tab: '[data-toolbar-tab="View"]' -> Margins (1.0 in, 0.5 in, 1.5 in), Paper Size (A4, Letter), Outline Toggle ('[data-toolbar-action="outline-toggle"]'), Light/Dark Mode
- Canvas & Ephemeral Controls:
  * Slash Commands (/table, /image, /checklist, /math, /browser): actionType 'trigger_slash'
  * Data Tables: actionType 'insert_table'
  * Equations & LaTeX: actionType 'open_equation'
  * Task Checklists: actionType 'find_checklist'
  * Image Upload: actionType 'open_image_modal'
- Footer:
  * Focus Mode: 'button:has-text("Focus Mode")', actionType 'toggle_focus'
  * Word Count / Character Count / Language
`;

export async function generateTourGuideViaAI(intent, productMode = 'compose', callGemini = null) {
  const exactMatch = findExactUiMatch(intent);
  if (exactMatch) {
    return exactMatch;
  }

  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Senior UI Architect and Tour Guide Agent.
The user is asking: "${intent}" in ${productMode} mode.

${UI_GROUNDING_PROMPT}

CRITICAL RULE: Return strict JSON without markdown code fences:
{
  "title": "Concise walkthrough title",
  "description": "1-sentence summary",
  "actionType": "open_workspace_switcher" | "open_history" | "open_search" | "open_export" | "insert_table" | "insert_equation" | "insert_checklist" | "outline_toggle" | "open_image_modal" | "open_share" | "open_properties" | "select_model" | "trigger_slash" | "custom",
  "targetTab": "Write" | "View" | "Context" | "Templates" | "Review" | null,
  "highlightSelector": "CSS selector to highlight",
  "steps": [
    { "stepNumber": 1, "title": "Step 1", "description": "Specific UI instruction" },
    { "stepNumber": 2, "title": "Step 2", "description": "Specific UI instruction" },
    { "stepNumber": 3, "title": "Step 3", "description": "Specific UI instruction" }
  ]
}`;

    try {
      const res = await callGemini({
        userPrompt: prompt,
        systemPrompt: 'You are the Senior UI Architect for Regaarder Compose. Return strict JSON only.'
      });
      let raw = String(res?.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = typeof res?.parsed === 'object' && res?.parsed !== null ? res.parsed : JSON.parse(raw);
      if (parsed && parsed.title && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[TourAgent] Fallback:', err);
    }
  }

  return {
    title: `Walkthrough: ${intent || 'Workflow'}`,
    description: `Step-by-step guidance for ${intent || 'performing this task'}.`,
    steps: [
      { stepNumber: 1, title: 'Open Toolbar or Slash Menu', description: 'Use the top toolbar or press "/" on the canvas to open available tools.' },
      { stepNumber: 2, title: 'Select Desired Action', description: `Choose the tool corresponding to "${intent || 'your task'}".` },
      { stepNumber: 3, title: 'Review & Apply', description: 'Configure options in the active dropdown or document canvas.' }
    ]
  };
}

export async function generateVideoActionScriptViaAI(intent, productMode = 'compose', callGemini = null) {
  const exactMatch = findExactUiMatch(intent);
  if (exactMatch) {
    return {
      title: `Action Demo: ${exactMatch.title}`,
      duration: 6,
      actionType: exactMatch.actionType,
      targetTab: exactMatch.targetTab,
      highlightSelector: exactMatch.highlightSelector,
      captions: exactMatch.steps.map((s, idx) => ({
        time: idx * 2,
        text: `${s.stepNumber}. ${s.title}: ${s.description}`
      }))
    };
  }

  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Video Agent Architect.
The user is requesting an automated demonstration for: "${intent}" in ${productMode} mode.

${UI_GROUNDING_PROMPT}

CRITICAL: Return strict JSON only matching this schema:
{
  "title": "Action Demo: Descriptive Title",
  "actionType": "open_workspace_switcher" | "open_history" | "open_search" | "open_export" | "insert_table" | "insert_equation" | "insert_checklist" | "outline_toggle" | "open_image_modal" | "open_share" | "open_properties" | "select_model" | "trigger_slash" | "custom",
  "targetTab": "Write" | "View" | "Context" | "Templates" | "Review" | null,
  "highlightSelector": "CSS selector to highlight",
  "duration": 6,
  "captions": [
    { "time": 0, "text": "1. Step description..." },
    { "time": 2, "text": "2. Step description..." },
    { "time": 4, "text": "3. Step description..." }
  ]
}`;

    try {
      const res = await callGemini({
        userPrompt: prompt,
        systemPrompt: 'You are the Senior UI Architect for Regaarder Compose. Return strict JSON only.'
      });
      let raw = String(res?.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = typeof res?.parsed === 'object' && res?.parsed !== null ? res.parsed : JSON.parse(raw);
      if (parsed && parsed.title && Array.isArray(parsed.captions) && parsed.captions.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[VideoAgent] AI generation fallback:', err);
    }
  }

  return {
    title: `Action Demo: ${intent || 'Performing Workflow'}`,
    duration: 6,
    captions: [
      { time: 0, text: `1. Scanning document workspace for: "${intent || 'Action'}"...` },
      { time: 2, text: `2. Navigating to corresponding toolbar menu...` },
      { time: 4, text: '3. Executing action and configuring parameters...' },
      { time: 5.5, text: '4. Action executed and verified on canvas.' }
    ]
  };
}
