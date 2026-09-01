/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder Universal UI Knowledge Base & Autonomous Action Engine
 * Comprehensive Canonical Sitemap & DOM Registry Across All 8 Workspace Apps:
 * 1. Global / Header (Workspace Switcher, Search, History Replay, Export, Share, Drafts, Undo/Redo)
 * 2. Compose (Documents, Context, Templates, Write, Review, View, Equations, Tables, Outlines, Margins, Slash)
 * 3. Sheets (Spreadsheets, Formula Bar, Number Formats %, Currency, Rows/Cols, Charts, Presets, Sheets Slash)
 * 4. Deck (Presentations, Add Slide, Layouts, Shapes, Text, Media, Present Mode, Notes, Export PPTX)
 * 5. Whiteboard (Infinite Canvas, Pen, Highlighter, Eraser, Sticky Notes, Shapes, Color Palette, Zoom, Clear)
 * 6. Schedule (Calendar, New Event, Day/Week/Month Views, Timeline, Timezones, Task Sync)
 * 7. Tasks (Kanban Board, Add Task, Columns, Priority Dropdown, Due Dates, Filters)
 * 8. Room (Video Collaboration, Mic Mute/Unmute, Camera Toggle, Screen Share, Participants)
 * 9. Memory (Knowledge Graph, Semantic Search, Document Clusters)
 */

export const REGAARDER_UI_SITEMAP = [
  // ── 1. GLOBAL HEADER & WORKSPACE NAVIGATION ───────────────────────────────
  {
    id: 'workspace_switcher',
    workspace: 'global',
    keywords: [
      'switch workspace app', 'switch workspace apps', 'switch workspace', 'workspace app', 'workspace apps',
      'workspace switcher', 'switch app', 'switch apps', 'switch to deck', 'switch to sheet', 'switch to sheets',
      'switch to room', 'switch to whiteboard', 'switch to schedule', 'switch to tasks', 'switch to memory',
      'open deck', 'open sheet', 'open sheets', 'open whiteboard', 'open schedule', 'open tasks',
      'worspace apps', 'worspace app', 'worspace switcher', 'worspace', 'app switcher',
      'grid icon', 'layout grid', 'switch mode', 'switch products', 'switch workspace apps'
    ],
    title: 'How to Switch Workspace Apps (Compose, Deck, Sheet, Room, Whiteboard, Schedule, Tasks, Memory)',
    description: 'Click the 9-dot grid icon in the top left header to switch between Compose, Deck, Sheet, Room, Whiteboard, Schedule, Tasks, and Memory.',
    actionType: 'open_workspace_switcher',
    targetTab: null,
    highlightSelector: 'button[title*="Switch Workspace App" i], button:has(svg.lucide-layout-grid)',
    steps: [
      { stepNumber: 1, title: 'Locate 9-Dot Grid Icon', description: 'Find the 9-dot Workspace App Switcher icon in the top left header next to the document title.' },
      { stepNumber: 2, title: 'Open Workspace Menu', description: 'Click the grid icon to open the dropdown menu of all Regaarder workspace products.' },
      { stepNumber: 3, title: 'Select Target App', description: 'Choose Compose, Deck, Sheet, Room, Whiteboard, Schedule, Tasks, or Memory to switch workspaces instantly.' }
    ]
  },
  {
    id: 'search_find',
    workspace: 'global',
    keywords: [
      'find specific words', 'find words', 'find word', 'search word', 'search words',
      'search document', 'find in document', 'search in document', 'find and replace',
      'search them', 'search bar', 'locate text', 'ctrl f', 'cmd f', 'search'
    ],
    title: 'How to Search & Find Words in Document / Sheet',
    description: 'Search for specific words or phrases and navigate through document matches.',
    actionType: 'open_search',
    targetTab: null,
    highlightSelector: 'button[title*="Find & Replace" i], button[title*="Search" i]',
    steps: [
      { stepNumber: 1, title: 'Open Search in Header', description: 'Click the Magnifying Glass search icon in the top header bar, or press Ctrl+F / Cmd+F.' },
      { stepNumber: 2, title: 'Enter Search Term', description: 'Type the word or phrase you want to locate in the search input box.' },
      { stepNumber: 3, title: 'Navigate Matches', description: 'Use the Previous / Next arrows to cycle through all highlighted occurrences in the document.' }
    ]
  },
  {
    id: 'edit_replay',
    workspace: 'global',
    keywords: [
      'edit replay', 'replay', 'replays', 'where is the replay', 'where is the edit replay',
      'version history', 'time machine', 'revert changes', 'previous version', 'past edits',
      'restore version', 'history tab', 'view history', 'document history'
    ],
    title: 'How to View Version History & Replay Edits',
    description: 'Inspect previous document revisions and replay past edits with the Time Machine.',
    actionType: 'open_history',
    targetTab: null,
    highlightSelector: 'button[title*="replay" i], button[title*="history" i], button:has-text("History")',
    steps: [
      { stepNumber: 1, title: 'Open History in Header or Sidebar', description: 'Click the Clock icon in the top header, or select the "History" tab in the right sidebar.' },
      { stepNumber: 2, title: 'Browse Version Snapshots', description: 'Review the chronological timeline of auto-saved versions and edit diffs.' },
      { stepNumber: 3, title: 'Replay Action Sequence', description: 'Click "Replay" to watch the time-machine sequence of document changes reconstruct on canvas.' }
    ]
  },
  {
    id: 'export',
    workspace: 'global',
    keywords: ['export document', 'export', 'pdf', 'docx', 'word document', 'download document', 'save as pdf', 'markdown export', 'print document', 'download'],
    title: 'How to Export & Download Files',
    description: 'Export to PDF Document, Microsoft Word (.docx), Excel (.xlsx), or Clean Markdown.',
    actionType: 'open_export',
    targetTab: null,
    highlightSelector: 'button[title*="Export" i], button:has-text("Export")',
    steps: [
      { stepNumber: 1, title: 'Click Export in Top Header', description: 'Locate and click the "Export" button in the upper right navigation header.' },
      { stepNumber: 2, title: 'Select File Format', description: 'Choose your desired format: PDF Document, Microsoft Word (.docx), Excel (.xlsx), or Markdown.' },
      { stepNumber: 3, title: 'Download File', description: 'Your formatted file will download immediately to your computer.' }
    ]
  },
  {
    id: 'share',
    workspace: 'global',
    keywords: ['share document', 'share', 'collaboration', 'invite', 'share permissions', 'copy link', 'share link', 'collaborate'],
    title: 'How to Share & Manage Collaboration',
    description: 'Invite team members, set View/Edit permissions, and copy live collaboration links.',
    actionType: 'open_share',
    targetTab: null,
    highlightSelector: 'button:has-text("Share"), [data-tour="share-button"]',
    steps: [
      { stepNumber: 1, title: 'Click Share in Header', description: 'Click the purple "Share" button at the top right of the application header.' },
      { stepNumber: 2, title: 'Configure Access Level', description: 'Select between View-Only access or Full Collaborative Editing permissions.' },
      { stepNumber: 3, title: 'Copy Share Link', description: 'Click "Copy Link" to share the live document with colleagues.' }
    ]
  },
  {
    id: 'saved_drafts',
    workspace: 'global',
    keywords: ['saved drafts', 'document title', 'rename document', 'rename file', 'saved draft', 'drafts list', 'document name', 'change title', 'rename sheet', 'rename deck'],
    title: 'How to Manage Saved Drafts & Rename Documents',
    description: 'Rename the active file and switch between recent saved drafts.',
    actionType: 'rename_title',
    targetTab: null,
    highlightSelector: '[data-tour="document-title"], button:has-text("Saved Drafts")',
    steps: [
      { stepNumber: 1, title: 'Click Document Title', description: 'Click the title text at the top left of the header to edit the document name inline.' },
      { stepNumber: 2, title: 'Open Saved Drafts', description: 'Click "Saved Drafts" to view, duplicate, or switch between recent document drafts.' }
    ]
  },
  {
    id: 'undo_redo',
    workspace: 'global',
    keywords: ['undo', 'redo', 'undo edit', 'redo edit', 'revert edit', 'ctrl z', 'cmd z', 'history undo'],
    title: 'How to Undo & Redo Edits',
    description: 'Step backwards or forwards through your recent editing changes.',
    actionType: 'undo_action',
    targetTab: null,
    highlightSelector: 'button[title*="Undo" i], button[title*="Redo" i]',
    steps: [
      { stepNumber: 1, title: 'Use Header Buttons', description: 'Click the curved left arrow to Undo, or curved right arrow to Redo in the top header.' },
      { stepNumber: 2, title: 'Use Keyboard Shortcuts', description: 'Press Ctrl+Z / Cmd+Z to undo, or Ctrl+Shift+Z / Cmd+Shift+Z to redo.' }
    ]
  },
  {
    id: 'model_selector',
    workspace: 'global',
    keywords: ['change model', 'select model', 'gemma', 'gemini', 'claude', 'ollama', 'model dropdown', 'ai model', 'local model', 'switch model', 'switch ai model', 'switch ai models'],
    title: 'How to Switch AI Models (Local Gemma / Gemini / Claude)',
    description: 'Select between local on-device models (Ollama/Gemma) and cloud models (Gemini/Claude).',
    actionType: 'select_model',
    targetTab: null,
    highlightSelector: 'button:has-text("gemma"), button:has-text("gemini")',
    steps: [
      { stepNumber: 1, title: 'Click Model Pill in Chat', description: 'Click the active model badge (e.g. "gemma3:1b") at the bottom of the chat input box.' },
      { stepNumber: 2, title: 'Select Target Model', description: 'Choose your desired local Ollama model or connected cloud provider from the dropdown.' }
    ]
  },
  {
    id: 'properties_panel',
    workspace: 'global',
    keywords: ['properties panel', 'properties', 'word count', 'character count', 'reading time', 'document stats', 'document metadata', 'sheet stats'],
    title: 'How to View Document Properties & Statistics',
    description: 'Inspect live statistics including word count, character count, and document metadata.',
    actionType: 'open_properties',
    targetTab: null,
    highlightSelector: 'button:has-text("Properties")',
    steps: [
      { stepNumber: 1, title: 'Open Properties Tab', description: 'Click the "Properties" tab at the top right of the right sidebar.' },
      { stepNumber: 2, title: 'Review Document Statistics', description: 'View total words, character count, estimated reading duration, and creation date.' }
    ]
  },
  {
    id: 'document_tabs',
    workspace: 'global',
    keywords: ['new tab', 'document tab', 'document tabs', 'open tab', 'switch tab', 'close tab', 'multi tab', 'tab management'],
    title: 'How to Open & Manage Multiple Document Tabs',
    description: 'Open multiple documents simultaneously using the document tab strip.',
    actionType: 'manage_tabs',
    targetTab: null,
    highlightSelector: '[data-tour="document-tabs"], button:has-text("+")',
    steps: [
      { stepNumber: 1, title: 'Click "+" New Tab', description: 'Click the "+" icon on the tab bar above the toolbar to create a new document.' },
      { stepNumber: 2, title: 'Switch Between Tabs', description: 'Click any tab title to instantly switch documents without losing unsaved changes.' }
    ]
  },

  // ── 2. COMPOSE (DOCUMENTS) ────────────────────────────────────────────────
  {
    id: 'source_files',
    workspace: 'compose',
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
  {
    id: 'outline',
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
  {
    id: 'images',
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
    workspace: 'compose',
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
  },
  {
    id: 'slash_menu',
    workspace: 'compose',
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

  // ── 3. SHEETS (SPREADSHEETS) ──────────────────────────────────────────────
  {
    id: 'sheets_formula_bar',
    workspace: 'sheets',
    keywords: ['formula bar', 'formulas', 'sum', 'average', 'vlookup', 'formula input', 'fx bar', 'calculate', 'function'],
    title: 'How to Use the Sheets Formula Bar & Functions',
    description: 'Type calculations and spreadsheet formulas directly into the formula bar.',
    actionType: 'sheets_formula',
    targetTab: null,
    highlightSelector: 'input[placeholder*="Formula" i], .formula-bar-input, [data-tour="sheets-formula"]',
    steps: [
      { stepNumber: 1, title: 'Select Cell', description: 'Click on any spreadsheet cell where you want to calculate data.' },
      { stepNumber: 2, title: 'Type Formula in Bar', description: 'Click the formula bar (fx) and type =SUM(A1:A10) or =AVERAGE(B1:B5).' },
      { stepNumber: 3, title: 'Press Enter', description: 'Press Enter to compute and render the dynamic calculated result.' }
    ]
  },
  {
    id: 'sheets_formatting',
    workspace: 'sheets',
    keywords: ['number format', 'currency', 'percentage', 'percent format', 'decimal format', 'format cells', 'dollar sign', 'format as percent'],
    title: 'How to Format Numbers (Currency, Percentage, Decimals) in Sheets',
    description: 'Format selected numbers as native currency ($), percentages (%), or decimals.',
    actionType: 'sheets_format',
    targetTab: null,
    highlightSelector: 'button:has-text("%"), button:has-text("$"), [data-tour="sheets-number-format"]',
    steps: [
      { stepNumber: 1, title: 'Select Data Range', description: 'Highlight the numeric columns or cells you want to format.' },
      { stepNumber: 2, title: 'Click Format Button', description: 'Click "$" for currency, "%" for percentages, or ".00" for decimal precision on the Sheets toolbar.' },
      { stepNumber: 3, title: 'Verify Formatting', description: 'Values will display with formatted symbols (e.g. 65%, $2,400.00).' }
    ]
  },
  {
    id: 'sheets_insert_row_col',
    workspace: 'sheets',
    keywords: ['insert row', 'insert column', 'add row', 'add column', 'delete row', 'delete column', 'resize column', 'freeze rows', 'freeze panes'],
    title: 'How to Insert & Delete Rows or Columns in Sheets',
    description: 'Add new rows or columns to expand your spreadsheet grid.',
    actionType: 'sheets_grid_modify',
    targetTab: null,
    highlightSelector: 'button:has-text("+ Row"), button:has-text("+ Col"), [data-tour="sheets-rows-cols"]',
    steps: [
      { stepNumber: 1, title: 'Right-Click or Toolbar Button', description: 'Click "+ Row" or "+ Column" on the spreadsheet toolbar, or right-click any row/column header.' },
      { stepNumber: 2, title: 'Select Dimension', description: 'Choose "Insert Row Above/Below" or "Insert Column Left/Right".' }
    ]
  },
  {
    id: 'sheets_charts',
    workspace: 'sheets',
    keywords: ['insert chart', 'create chart', 'bar chart', 'line chart', 'pie chart', 'visualize data', 'sheets chart', 'graph data'],
    title: 'How to Insert Charts & Data Graphs in Sheets',
    description: 'Turn spreadsheet data ranges into interactive Bar, Line, or Pie charts.',
    actionType: 'sheets_chart',
    targetTab: null,
    highlightSelector: 'button:has-text("Chart"), button[title*="Chart" i], [data-tour="sheets-chart"]',
    steps: [
      { stepNumber: 1, title: 'Select Data Range', description: 'Select the columns containing labels and numerical data values.' },
      { stepNumber: 2, title: 'Click Insert Chart', description: 'Click the "Chart" icon on the Sheets toolbar or press "/" and select chart.' },
      { stepNumber: 3, title: 'Choose Chart Type', description: 'Select Bar, Line, Area, or Pie chart to embed the interactive visualization.' }
    ]
  },
  {
    id: 'sheets_slash_menu',
    workspace: 'sheets',
    keywords: ['sheets slash menu', 'sheets slash', 'cell slash', 'sheets shortcuts', 'slash in sheets'],
    title: 'How to Use the Sheets Slash (/) Quick Action Menu',
    description: 'Type "/" inside any spreadsheet cell or table to open the quick actions menu.',
    actionType: 'sheets_slash',
    targetTab: null,
    highlightSelector: '.sheets-grid, [data-tour="sheets-grid"]',
    steps: [
      { stepNumber: 1, title: 'Double Click Cell', description: 'Enter edit mode in any spreadsheet cell.' },
      { stepNumber: 2, title: 'Type "/" Key', description: 'Press "/" to open the Sheets quick insert dropdown (presets, formulas, charts).' }
    ]
  },

  // ── 4. DECK (PRESENTATIONS) ───────────────────────────────────────────────
  {
    id: 'deck_add_slide',
    workspace: 'deck',
    keywords: ['add slide', 'new slide', 'insert slide', 'slide layout', 'duplicate slide', 'delete slide', 'deck slides'],
    title: 'How to Add & Manage Slides in Deck',
    description: 'Create new presentation slides, choose slide layouts, and reorder.',
    actionType: 'deck_add_slide',
    targetTab: null,
    highlightSelector: 'button:has-text("+ Slide"), button[title*="Add Slide" i], [data-tour="deck-add-slide"]',
    steps: [
      { stepNumber: 1, title: 'Click "+ Slide"', description: 'Click the "+ Slide" button on the left slide filmstrip or top toolbar.' },
      { stepNumber: 2, title: 'Choose Layout', description: 'Select Title Slide, Two Columns, Comparison, Section Header, or Blank canvas.' }
    ]
  },
  {
    id: 'deck_present_mode',
    workspace: 'deck',
    keywords: ['present mode', 'slide show', 'start presentation', 'present slides', 'fullscreen presentation', 'play deck', 'f5 presentation'],
    title: 'How to Start Present Mode & Slideshow in Deck',
    description: 'Launch fullscreen presentation mode with keyboard navigation and presenter notes.',
    actionType: 'deck_present',
    targetTab: null,
    highlightSelector: 'button:has-text("Present"), button[title*="Present" i], [data-tour="deck-present"]',
    steps: [
      { stepNumber: 1, title: 'Click "Present" in Header', description: 'Click the blue "Present" / Play icon in the upper right toolbar.' },
      { stepNumber: 2, title: 'Navigate Slides', description: 'Use Arrow Keys, Spacebar, or click to advance through your presentation in fullscreen.' }
    ]
  },
  {
    id: 'deck_shapes_text',
    workspace: 'deck',
    keywords: ['add text box', 'insert text box', 'deck shapes', 'deck text', 'insert shape in deck', 'deck images', 'deck media'],
    title: 'How to Insert Text Boxes, Shapes & Media in Deck',
    description: 'Add resizable text boxes, geometric shapes, and images to slides.',
    actionType: 'deck_insert_element',
    targetTab: null,
    highlightSelector: 'button:has-text("Text"), button:has-text("Shape"), [data-tour="deck-insert"]',
    steps: [
      { stepNumber: 1, title: 'Click Tool on Toolbar', description: 'Click "Text Box", "Shapes", or "Image" on the top Deck toolbar.' },
      { stepNumber: 2, title: 'Draw on Slide', description: 'Click and drag on the active slide canvas to position and size your element.' }
    ]
  },

  // ── 5. WHITEBOARD (INFINITE CANVAS) ───────────────────────────────────────
  {
    id: 'whiteboard_drawing',
    workspace: 'whiteboard',
    keywords: ['pen tool', 'draw on whiteboard', 'whiteboard pen', 'highlighter', 'eraser', 'freehand draw', 'sketch', 'draw lines'],
    title: 'How to Use Drawing Tools (Pen, Highlighter, Eraser) on Whiteboard',
    description: 'Freehand sketch, highlight diagrams, and erase marks on the infinite canvas.',
    actionType: 'whiteboard_tool',
    targetTab: null,
    highlightSelector: 'button[title*="Pen" i], button[title*="Highlighter" i], [data-tour="whiteboard-tools"]',
    steps: [
      { stepNumber: 1, title: 'Select Pen or Highlighter', description: 'Click the Pen or Highlighter icon on the floating whiteboard toolbar.' },
      { stepNumber: 2, title: 'Pick Stroke Color & Width', description: 'Choose your desired color and line thickness from the palette.' },
      { stepNumber: 3, title: 'Draw on Canvas', description: 'Click and drag your mouse/pen to draw freehand diagrams.' }
    ]
  },
  {
    id: 'whiteboard_sticky_notes',
    workspace: 'whiteboard',
    keywords: ['sticky note', 'sticky notes', 'add sticky note', 'whiteboard notes', 'post it', 'colored notes', 'brainstorming notes'],
    title: 'How to Add Sticky Notes & Brainstorming Cards on Whiteboard',
    description: 'Place colored sticky notes with formatted text for brainstorming sessions.',
    actionType: 'whiteboard_sticky',
    targetTab: null,
    highlightSelector: 'button[title*="Sticky" i], button:has-text("Sticky"), [data-tour="whiteboard-sticky"]',
    steps: [
      { stepNumber: 1, title: 'Click Sticky Note Tool', description: 'Click the Sticky Note icon on the whiteboard toolbar.' },
      { stepNumber: 2, title: 'Place on Canvas', description: 'Click anywhere on the whiteboard canvas to drop the note.' },
      { stepNumber: 3, title: 'Type Thoughts', description: 'Double click the note to type your notes and change background color.' }
    ]
  },
  {
    id: 'whiteboard_shapes_zoom',
    workspace: 'whiteboard',
    keywords: ['whiteboard shapes', 'whiteboard zoom', 'infinite canvas pan', 'clear whiteboard', 'reset whiteboard', 'whiteboard rectangle'],
    title: 'How to Insert Shapes, Zoom & Pan on Whiteboard',
    description: 'Add flowcharts, geometric shapes, and navigate the infinite canvas.',
    actionType: 'whiteboard_shapes',
    targetTab: null,
    highlightSelector: 'button[title*="Shapes" i], button[title*="Zoom" i], [data-tour="whiteboard-canvas"]',
    steps: [
      { stepNumber: 1, title: 'Select Shape Tool', description: 'Click "Shapes" (Rectangle, Circle, Diamond, Arrow) on the toolbar.' },
      { stepNumber: 2, title: 'Pan & Zoom', description: 'Hold Spacebar and drag to pan across the infinite canvas, or use the mouse scroll wheel to zoom in/out.' }
    ]
  },

  // ── 6. SCHEDULE (CALENDAR & TIMELINE) ─────────────────────────────────────
  {
    id: 'schedule_new_event',
    workspace: 'schedule',
    keywords: ['new event', 'create event', 'add meeting', 'schedule meeting', 'calendar event', 'add to calendar', 'schedule task'],
    title: 'How to Create Calendar Events & Schedule Meetings',
    description: 'Book events, set time slots, invite participants, and sync with tasks.',
    actionType: 'schedule_create',
    targetTab: null,
    highlightSelector: 'button:has-text("+ New Event"), button:has-text("New Event"), [data-tour="schedule-new-event"]',
    steps: [
      { stepNumber: 1, title: 'Click "+ New Event"', description: 'Click "+ New Event" in the upper corner of the Schedule workspace, or click any calendar time block.' },
      { stepNumber: 2, title: 'Set Event Details', description: 'Enter the meeting title, date range, start/end time, and add attendees.' },
      { stepNumber: 3, title: 'Save Event', description: 'Click "Create Event" to lock the meeting onto your calendar.' }
    ]
  },
  {
    id: 'schedule_views',
    workspace: 'schedule',
    keywords: ['calendar view', 'day view', 'week view', 'month view', 'agenda view', 'switch calendar view', 'schedule timeline'],
    title: 'How to Switch Calendar Views (Day, Week, Month, Agenda)',
    description: 'Toggle between Day, Week, Month, and Agenda schedule timelines.',
    actionType: 'schedule_views',
    targetTab: null,
    highlightSelector: 'button:has-text("Week"), button:has-text("Month"), [data-tour="schedule-views"]',
    steps: [
      { stepNumber: 1, title: 'Locate View Switcher', description: 'Find the "Day / Week / Month / Agenda" segmented control at the top of the schedule.' },
      { stepNumber: 2, title: 'Click Target View', description: 'Click your preferred view mode to dynamically re-render your calendar timeline.' }
    ]
  },

  // ── 7. TASKS (KANBAN & WORKFLOWS) ─────────────────────────────────────────
  {
    id: 'tasks_kanban',
    workspace: 'tasks',
    keywords: ['add task', 'new task', 'kanban board', 'task status', 'task priority', 'move task', 'todo column', 'in progress column', 'done column'],
    title: 'How to Create Tasks & Manage Kanban Columns',
    description: 'Add workflow cards, assign priorities (High, Medium, Low), and drag cards across columns.',
    actionType: 'tasks_kanban',
    targetTab: null,
    highlightSelector: 'button:has-text("+ Add Task"), button:has-text("Add Task"), [data-tour="tasks-board"]',
    steps: [
      { stepNumber: 1, title: 'Click "+ Add Task"', description: 'Click "+ Add Task" inside the To Do or target Kanban column.' },
      { stepNumber: 2, title: 'Set Title & Priority', description: 'Type the task title, set Priority (High/Medium/Low), and select a Due Date.' },
      { stepNumber: 3, title: 'Track Progress', description: 'Drag the card from "To Do" to "In Progress" or "Done" as you complete milestones.' }
    ]
  },

  // ── 8. ROOM (VIDEO COLLABORATION) ─────────────────────────────────────────
  {
    id: 'room_audio_video',
    workspace: 'room',
    keywords: ['mute mic', 'unmute mic', 'turn camera on', 'turn camera off', 'screen share', 'room participants', 'video room', 'room audio'],
    title: 'How to Manage Mic, Camera & Screen Sharing in Room',
    description: 'Mute/unmute microphone, toggle video camera, and start screen sharing during live collaboration.',
    actionType: 'room_controls',
    targetTab: null,
    highlightSelector: 'button[title*="Mic" i], button[title*="Camera" i], [data-tour="room-controls"]',
    steps: [
      { stepNumber: 1, title: 'Locate Floating Bottom Bar', description: 'Find the media control pill at the bottom of the active Room.' },
      { stepNumber: 2, title: 'Toggle Mic / Camera', description: 'Click the Microphone icon to mute/unmute audio, or Camera icon for video stream.' },
      { stepNumber: 3, title: 'Start Screen Share', description: 'Click "Screen Share" to broadcast your application or full desktop to collaborators.' }
    ]
  },

  // ── 9. MEMORY (KNOWLEDGE DASHBOARD) ───────────────────────────────────────
  {
    id: 'memory_dashboard',
    workspace: 'memory',
    keywords: ['memory dashboard', 'knowledge graph', 'knowledge base search', 'recall context', 'memory clusters', 'memory nodes'],
    title: 'How to Explore Knowledge Graphs & Memory Clusters',
    description: 'Visualize semantic document relationships, search memory nodes, and recall context.',
    actionType: 'memory_explore',
    targetTab: null,
    highlightSelector: 'input[placeholder*="Search memory" i], [data-tour="memory-dashboard"]',
    steps: [
      { stepNumber: 1, title: 'Open Memory Workspace', description: 'Click "Memory" in the workspace switcher or right sidebar.' },
      { stepNumber: 2, title: 'Search Knowledge Base', description: 'Type queries in the memory search bar to find semantic connections across past documents.' },
      { stepNumber: 3, title: 'Explore Clusters', description: 'Click on graph nodes to inspect connected reference documents.' }
    ]
  }
];

/**
 * Intelligent semantic matcher across REGAARDER_UI_SITEMAP
 * Prioritizes multi-word exact phrases, normalizes typos, and supports workspace filtering.
 */
export function findExactUiMatch(intent, productMode = 'compose') {
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
    .replace(/\bswich\b/g, 'switch')
    .replace(/\bslid\b/g, 'slide')
    .replace(/\bformla\b/g, 'formula')
    .replace(/\bwhitboard\b/g, 'whiteboard');

  // 1. Exact Multi-word Phrase Matches (Contextual to productMode first)
  const productMatches = [];
  const globalMatches = [];

  for (const item of REGAARDER_UI_SITEMAP) {
    for (const kw of item.keywords) {
      if (kw.includes(' ') && clean.includes(kw)) {
        if (item.workspace === productMode) {
          return item;
        }
        productMatches.push(item);
      }
    }
  }

  if (productMatches.length > 0) {
    return productMatches[0];
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
    if (item.workspace === productMode) score += 3;

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
CANONICAL REGAARDER MULTI-PRODUCT UI DIRECTORY:

1. GLOBAL / TOP HEADER CONTROLS:
- Workspace Switcher: selector 'button[title*="Switch Workspace App" i]', actionType 'open_workspace_switcher' (Switches between Compose, Deck, Sheet, Room, Whiteboard, Schedule, Tasks, Memory)
- Document Title / Rename: selector '[data-tour="document-title"]', actionType 'rename_title'
- Saved Drafts: selector 'button:has-text("Saved Drafts")', actionType 'saved_drafts'
- Undo Edit: selector 'button[title*="Undo" i]', actionType 'undo_action'
- Redo Edit: selector 'button[title*="Redo" i]', actionType 'redo_action'
- Version History & Time Machine: selector 'button[title*="replay" i]', actionType 'open_history'
- Find & Replace (Search): selector 'button[title*="Find & Replace" i]', actionType 'open_search'
- Export (PDF, Word DOCX, Excel XLSX, Markdown): selector 'button[title*="Export" i]', actionType 'open_export'
- Share & Collaboration: selector 'button:has-text("Share")', actionType 'open_share'

2. COMPOSE (DOCUMENTS) CONTROLS:
- Context Tab: selector '[data-toolbar-tab="Context"]' -> '+ Add Source File'
- Templates Tab: selector '[data-toolbar-tab="Templates"]' -> Curated template picker
- Write Tab: selector '[data-toolbar-tab="Write"]' -> Font Family, Font Size, Alignment, Lists, + Insert (Images, Equations, Table Grid, Charts, Shapes)
- Review Tab: selector '[data-toolbar-tab="Review"]' -> Track changes, Comments
- View Tab: selector '[data-toolbar-tab="View"]' -> Margins (1.0 in, 0.5 in, 1.5 in), Paper Size (A4, Letter), Outline Toggle ('[data-toolbar-action="outline-toggle"]'), Light/Dark Mode
- Canvas Actions: Slash Commands (/table, /image, /checklist, /math, /browser), Tables (insert_table), LaTeX Equations (open_equation)
- Footer: Focus Mode ('button:has-text("Focus Mode")'), Word/Char Count

3. SHEETS (SPREADSHEETS) CONTROLS:
- Formula Bar: selector 'input[placeholder*="Formula" i]', actionType 'sheets_formula'
- Number Formats: Currency ('$'), Percentage ('%'), Decimals ('.00'), actionType 'sheets_format'
- Rows & Columns: '+ Row', '+ Col', actionType 'sheets_grid_modify'
- Insert Chart: 'button:has-text("Chart")', actionType 'sheets_chart'
- Sheets Slash: actionType 'sheets_slash'

4. DECK (PRESENTATIONS) CONTROLS:
- Add Slide: 'button:has-text("+ Slide")', actionType 'deck_add_slide'
- Present Mode / Slideshow: 'button:has-text("Present")', actionType 'deck_present'
- Shapes & Text: 'button:has-text("Text")', 'button:has-text("Shape")', actionType 'deck_insert_element'

5. WHITEBOARD (INFINITE CANVAS) CONTROLS:
- Pen Tool / Draw: 'button[title*="Pen" i]', actionType 'whiteboard_tool'
- Highlighter: 'button[title*="Highlighter" i]', actionType 'whiteboard_tool'
- Sticky Notes: 'button[title*="Sticky" i]', actionType 'whiteboard_sticky'
- Shapes & Zoom: actionType 'whiteboard_shapes'

6. SCHEDULE (CALENDAR) CONTROLS:
- New Event: 'button:has-text("+ New Event")', actionType 'schedule_create'
- Day / Week / Month Views: actionType 'schedule_views'

7. TASKS (KANBAN) CONTROLS:
- Add Task: 'button:has-text("+ Add Task")', actionType 'tasks_kanban'
- Columns: To Do, In Progress, Done

8. ROOM (VIDEO COLLABORATION):
- Mute/Unmute Mic, Camera Toggle, Screen Sharing: actionType 'room_controls'

9. MEMORY (KNOWLEDGE HUB):
- Knowledge Search & Graph Exploration: actionType 'memory_explore'
`;

export async function generateTourGuideViaAI(intent, productMode = 'compose', callGemini = null) {
  const exactMatch = findExactUiMatch(intent, productMode);
  if (exactMatch) {
    return exactMatch;
  }

  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Senior UI Architect and Tour Guide Agent.
The user is asking: "${intent}" in ${productMode} workspace mode.

${UI_GROUNDING_PROMPT}

CRITICAL RULE: Return strict JSON without markdown code fences:
{
  "title": "Concise walkthrough title",
  "description": "1-sentence summary",
  "actionType": "open_workspace_switcher" | "open_history" | "open_search" | "open_export" | "sheets_formula" | "sheets_format" | "sheets_chart" | "deck_add_slide" | "deck_present" | "whiteboard_tool" | "whiteboard_sticky" | "schedule_create" | "tasks_kanban" | "room_controls" | "insert_table" | "insert_equation" | "insert_checklist" | "outline_toggle" | "open_image_modal" | "open_share" | "open_properties" | "select_model" | "trigger_slash" | "custom",
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
        systemPrompt: 'You are the Senior UI Architect for Regaarder Workspace. Return strict JSON only.'
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
  const exactMatch = findExactUiMatch(intent, productMode);
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
    const prompt = `You are the Regaarder Universal Video Agent Architect.
The user is requesting an automated demonstration for: "${intent}" in ${productMode} workspace mode.

${UI_GROUNDING_PROMPT}

CRITICAL: Return strict JSON only matching this schema:
{
  "title": "Action Demo: Descriptive Title",
  "actionType": "open_workspace_switcher" | "open_history" | "open_search" | "open_export" | "sheets_formula" | "sheets_format" | "sheets_chart" | "deck_add_slide" | "deck_present" | "whiteboard_tool" | "whiteboard_sticky" | "schedule_create" | "tasks_kanban" | "room_controls" | "insert_table" | "insert_equation" | "insert_checklist" | "outline_toggle" | "open_image_modal" | "open_share" | "open_properties" | "select_model" | "trigger_slash" | "custom",
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
        systemPrompt: 'You are the Senior UI Architect for Regaarder Workspace. Return strict JSON only.'
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
