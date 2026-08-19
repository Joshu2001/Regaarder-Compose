/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder UI Knowledge Base & Autonomous Action Engine
 * Contains the comprehensive, verified UI sitemap of Regaarder Compose
 * so AI models never hallucinate non-existent menus (e.g. MS Word panes).
 */

export const REGAARDER_UI_SITEMAP = [
  {
    keywords: ['margin', 'margins', 'page margin', 'page margins', 'spacing', 'gutter'],
    title: 'How to Adjust Page Margins',
    description: 'Access page margins directly in the View tab on the top toolbar.',
    actionType: 'navigate_tab',
    targetTab: 'view',
    highlightSelector: '[data-tour="margins"]',
    steps: [
      { stepNumber: 1, title: 'Switch to View Tab', description: 'Click the "View" tab on the top document mode bar (next to Context, Templates, Write, Review).' },
      { stepNumber: 2, title: 'Open Margins Dropdown', description: 'Click the "Normal Margins (1.0 in)" dropdown on the toolbar.' },
      { stepNumber: 3, title: 'Select Margin Preset', description: 'Choose between Normal (1.0 in), Narrow (0.5 in), Wide (1.5 in), or Custom margins.' }
    ]
  },
  {
    keywords: ['equation', 'equations', 'math', 'formula', 'latex', 'sum', 'integral'],
    title: 'How to Add Equations & Math Formulas',
    description: 'Insert LaTeX equations via the + Insert menu or slash shortcut.',
    actionType: 'open_equation',
    targetTab: 'write',
    highlightSelector: '[data-tour="insert-menu"]',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top document toolbar, or press "/" on the canvas.' },
      { stepNumber: 2, title: 'Select Equations', description: 'Under "SPECIAL CHARACTERS", click "Equations (Common math formulas)".' },
      { stepNumber: 3, title: 'Type or Choose LaTeX', description: 'Select a preset formula (fractions, integrals, matrices) or type LaTeX directly using $$...$$.' }
    ]
  },
  {
    keywords: ['image', 'images', 'photo', 'picture', 'upload', 'uploading', 'media', 'file'],
    title: 'How to Upload & Insert Images',
    description: 'Upload local files, generate visual assets, or paste image URLs.',
    actionType: 'open_image_modal',
    targetTab: 'write',
    highlightSelector: '[data-tour="insert-menu"]',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top toolbar, or press "/" and select "image".' },
      { stepNumber: 2, title: 'Choose Images / Videos / Files', description: 'Click "Images / Videos / Files" in the dropdown.' },
      { stepNumber: 3, title: 'Upload or Drag & Drop', description: 'Select an image from your computer, generate via AI, or drag and drop onto the canvas.' }
    ]
  },
  {
    keywords: ['table', 'grid', 'tabular', 'spreadsheet', 'matrix', 'columns', 'rows'],
    title: 'How to Insert & Format Data Tables',
    description: 'Create interactive tables with custom rows, columns, and dropdowns.',
    actionType: 'insert_table',
    targetTab: 'write',
    highlightSelector: '[data-tour="insert-menu"]',
    steps: [
      { stepNumber: 1, title: 'Open + Insert Menu', description: 'Click "+ Insert" on the top toolbar, or type "/table" directly on the canvas.' },
      { stepNumber: 2, title: 'Pick Grid Dimensions', description: 'Hover over the Table Grid squares to select desired rows and columns.' },
      { stepNumber: 3, title: 'Format Cells', description: 'Click cell headers to configure status dropdowns, currency, or percentage formatting.' }
    ]
  },
  {
    keywords: ['checklist', 'checklists', 'task', 'tasks', 'todo', 'todos', 'checkbox'],
    title: 'How to Create & Locate Checklists',
    description: 'Add interactive task checklists or locate existing tasks.',
    actionType: 'find_checklist',
    targetTab: 'write',
    highlightSelector: '[data-tour="lists-menu"]',
    steps: [
      { stepNumber: 1, title: 'Access Lists Menu', description: 'Click the "Lists" dropdown in the toolbar, or type "/checklist".' },
      { stepNumber: 2, title: 'Select Checklist', description: 'Click "Checklist" to insert square interactive checkboxes.' },
      { stepNumber: 3, title: 'Toggle Completion', description: 'Click any checkbox on the document canvas to mark tasks as completed.' }
    ]
  },
  {
    keywords: ['export', 'pdf', 'docx', 'word', 'download', 'markdown', 'share'],
    title: 'How to Export & Share Documents',
    description: 'Export to PDF, Word, Markdown, or share live collaboration links.',
    actionType: 'open_export',
    targetTab: 'write',
    highlightSelector: '[data-tour="export-button"]',
    steps: [
      { stepNumber: 1, title: 'Click Export in Header', description: 'Locate the "Export" button at the top right of the application header.' },
      { stepNumber: 2, title: 'Select Export Format', description: 'Choose between PDF Document, Microsoft Word (.docx), or Clean Markdown.' },
      { stepNumber: 3, title: 'Share Collaboration Link', description: 'Click "Share" (purple button) to copy view/edit links or manage permissions.' }
    ]
  },
  {
    keywords: ['orientation', 'portrait', 'landscape', 'paper', 'a4', 'letter'],
    title: 'How to Change Page Orientation & Size',
    description: 'Toggle between Portrait/Landscape and switch paper sizes.',
    actionType: 'navigate_tab',
    targetTab: 'view',
    highlightSelector: '[data-tour="orientation"]',
    steps: [
      { stepNumber: 1, title: 'Click View Tab', description: 'Click the "View" tab on the top mode bar.' },
      { stepNumber: 2, title: 'Toggle Portrait / Landscape', description: 'Click "Portrait" or "Landscape" on the toolbar.' },
      { stepNumber: 3, title: 'Select Paper Size', description: 'Use the "A4 (210 x 297 mm)" dropdown to choose Letter, Legal, or Executive.' }
    ]
  }
];

export function findExactUiMatch(intent) {
  const clean = String(intent || '').toLowerCase();
  for (const item of REGAARDER_UI_SITEMAP) {
    if (item.keywords.some(kw => clean.includes(kw))) {
      return item;
    }
  }
  return null;
}

export async function generateTourGuideViaAI(intent, productMode = 'compose', callGemini = null) {
  // 1. Exact verified match from Regaarder UI Sitemap (Prevents all hallucinations)
  const exactMatch = findExactUiMatch(intent);
  if (exactMatch) {
    return exactMatch;
  }

  // 2. If no direct match, query LLM with strict grounding in actual UI controls
  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Tour Guide Agent.
The user is asking: "${intent}" in ${productMode} mode.

ACTUAL REGAARDER COMPOSE UI CONTROLS:
- Top Mode Bar: Context, Templates, Write, Review, View.
- Write Tab Toolbar: Mode switcher, Document Title, Font (Manrope, Inter, DM Sans), Font Size (14pt default), Alignment, Lists (Bullet, Numbered, Checklist), + Insert (Images/Videos/Files, Emoji, Symbols, Equations, Table Grid, Charts, Shapes).
- View Tab Toolbar: Portrait/Landscape, Page Margins dropdown (Normal 1.0 in, Narrow 0.5 in, Wide 1.5 in), Paper Size (A4, Letter), Outline On/Off, Dark Mode.
- Header: Export (PDF, DOCX, Markdown), Share, Notifications.
- Canvas: Slash commands (/table, /image, /checklist, /math, /browser, /tour, /video).

CRITICAL RULE: DO NOT invent non-existent menus (e.g. do NOT say "Equation Pane" or "Pen Icon"). Ground strictly in the controls listed above.
Return strict JSON:
{
  "title": "Concise walkthrough title",
  "description": "1-sentence summary",
  "steps": [
    { "stepNumber": 1, "title": "Step 1", "description": "Accurate UI instruction referencing real buttons" },
    { "stepNumber": 2, "title": "Step 2", "description": "Accurate UI instruction" },
    { "stepNumber": 3, "title": "Step 3", "description": "Accurate UI instruction" }
  ]
}`;

    try {
      const res = await callGemini({
        userPrompt: prompt,
        systemPrompt: 'You are the Senior UI Architect for Regaarder Compose. Return strict JSON only without code fences.'
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
