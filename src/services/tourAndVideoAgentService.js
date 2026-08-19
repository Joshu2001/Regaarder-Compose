/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder UI Knowledge Base & Autonomous Action Engine
 * Contains the comprehensive, verified UI sitemap of Regaarder Compose
 * so AI models never hallucinate non-existent menus (e.g. MS Word panes).
 */

export const REGAARDER_UI_SITEMAP = [
  // ── CONTEXT & GROUNDING ───────────────────────────────────────────────────
  {
    id: 'source_files',
    keywords: [
      'add source file', 'source file', 'source files', 'add source', 'source', 'sources',
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
    keywords: ['outline', 'outlines', 'document outline', 'outline panel', 'outline button', 'outline sidebar', 'left panel', 'toggle outline'],
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
    keywords: ['dark mode', 'light mode', 'theme', 'night mode', 'dark', 'light', 'color scheme'],
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
    keywords: ['equation', 'equations', 'math', 'formula', 'latex', 'sum', 'integral', 'fraction'],
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
    keywords: ['table', 'grid', 'tabular', 'spreadsheet', 'matrix', 'columns', 'rows'],
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
    keywords: ['checklist', 'checklists', 'task', 'tasks', 'todo', 'todos', 'checkbox', 'bullet', 'list'],
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
    keywords: ['font', 'fonts', 'typeface', 'family', 'typography', 'inter', 'manrope', 'dm sans', 'size', 'font size'],
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
    keywords: ['heading', 'headings', 'h1', 'h2', 'h3', 'title', 'subtitle', 'paragraph', 'formatting'],
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

  // ── HEADER & GLOBAL CONTROLS ──────────────────────────────────────────────
  {
    id: 'export',
    keywords: ['export', 'pdf', 'docx', 'word', 'download', 'markdown', 'share', 'save as'],
    title: 'How to Export & Share Documents',
    description: 'Export to PDF, Word, Markdown, or share live collaboration links.',
    actionType: 'open_export',
    targetTab: 'Write',
    highlightSelector: '[data-tour="export-button"], button:has-text("Export")',
    steps: [
      { stepNumber: 1, title: 'Click Export in Header', description: 'Locate the "Export" button at the top right of the application header.' },
      { stepNumber: 2, title: 'Select Export Format', description: 'Choose between PDF Document, Microsoft Word (.docx), or Clean Markdown.' },
      { stepNumber: 3, title: 'Share Collaboration Link', description: 'Click "Share" (purple button) to copy view/edit links or manage permissions.' }
    ]
  },
  {
    id: 'focus',
    keywords: ['focus', 'distraction', 'zen', 'focus mode', 'immersive', 'fullscreen'],
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
    id: 'templates',
    keywords: ['template', 'templates', 'layout', 'starter', 'preset', 'executive brief', 'meeting notes'],
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
 */
export function findExactUiMatch(intent) {
  const clean = String(intent || '')
    .toLowerCase()
    .replace(/["'“”‘’?!.,:;()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // 1. Check multi-word phrase matches first (e.g. "add source file", "source file", "font size", "outline off")
  for (const item of REGAARDER_UI_SITEMAP) {
    for (const kw of item.keywords) {
      if (kw.includes(' ') && clean.includes(kw)) {
        return item;
      }
    }
  }

  // 2. Check exact keyword matches
  for (const item of REGAARDER_UI_SITEMAP) {
    if (item.keywords.some(kw => clean.includes(kw))) {
      return item;
    }
  }

  // 3. Token overlap similarity
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !['how', 'the', 'and', 'for', 'you', 'can', 'with'].includes(w));
  let bestMatch = null;
  let bestScore = 0;

  for (const item of REGAARDER_UI_SITEMAP) {
    let score = 0;
    for (const kw of item.keywords) {
      if (words.some(w => kw === w || kw.includes(w))) score += 3;
    }
    if (words.some(w => item.title.toLowerCase().includes(w))) score += 4;
    if (words.some(w => item.description.toLowerCase().includes(w))) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

export async function generateTourGuideViaAI(intent, productMode = 'compose', callGemini = null) {
  const exactMatch = findExactUiMatch(intent);
  if (exactMatch) {
    return exactMatch;
  }

  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Tour Guide Agent.
The user is asking: "${intent}" in ${productMode} mode.

ACTUAL REGAARDER COMPOSE UI CONTROLS:
- Top Mode Bar: Context, Templates, Write, Review, View.
- Write Tab Toolbar: Mode switcher, Document Title, Font (Manrope, Inter, DM Sans), Font Size (14pt default), Alignment, Lists (Bullet, Numbered, Checklist), + Insert (Images/Videos/Files, Emoji, Symbols, Equations, Table Grid, Charts, Shapes).
- View Tab Toolbar: Portrait/Landscape, Page Margins dropdown (Normal 1.0 in, Narrow 0.5 in, Wide 1.5 in), Paper Size (A4, Letter), Outline On/Off, Dark Mode.
- Header: Export (PDF, DOCX, Markdown), Share, Notifications.
- Canvas: Slash commands (/table, /image, /checklist, /math, /browser, /tour, /video).

CRITICAL RULE: Ground strictly in real controls. Return strict JSON without markdown:
{
  "title": "Concise walkthrough title",
  "description": "1-sentence summary",
  "steps": [
    { "stepNumber": 1, "title": "Step 1", "description": "Instruction" },
    { "stepNumber": 2, "title": "Step 2", "description": "Instruction" },
    { "stepNumber": 3, "title": "Step 3", "description": "Instruction" }
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
      captions: exactMatch.steps.map((s, idx) => ({
        time: idx * 2,
        text: `${s.stepNumber}. ${s.title}: ${s.description}`
      }))
    };
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
