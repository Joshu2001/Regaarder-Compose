/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder Tour & Video Autonomous Agents
 * - Tour Agent: Generates step-by-step interactive visual UI walkthroughs with spotlight guides.
 * - Video Agent: Autonomously simulates/records canvas actions, generating animated video replays and clips.
 */

/**
 * Generate a structured tour guide for any user intent
 */
export function generateTourGuide(intent, productMode = 'compose') {
  const cleanIntent = String(intent || '').toLowerCase();
  
  // Custom smart mapping for common application actions
  if (cleanIntent.includes('table') || cleanIntent.includes('grid')) {
    return {
      title: 'How to Insert & Format a Data Table',
      description: 'Follow this 3-step walkthrough to create and customize tables.',
      steps: [
        { stepNumber: 1, target: '[data-tour="insert-menu"]', title: 'Open Insert Menu', description: 'Click "+ Insert" on the top document toolbar or type "/table".' },
        { stepNumber: 2, target: '[data-tour="table-picker"]', title: 'Choose Grid Dimensions', description: 'Select the number of columns and rows for your data.' },
        { stepNumber: 3, target: '[data-tour="table-style"]', title: 'Apply Styling & Dropdowns', description: 'Click any header cell to set currency, dropdown validations, or percentage formats.' }
      ]
    };
  }

  if (cleanIntent.includes('chart') || cleanIntent.includes('graph') || cleanIntent.includes('plot')) {
    return {
      title: 'How to Add Interactive Charts',
      description: 'Step-by-step guide to visualize data in Docs & Sheets.',
      steps: [
        { stepNumber: 1, target: '[data-tour="insert-menu"]', title: 'Access Chart Tools', description: 'Click "+ Insert" and select "Chart" or type "/chart".' },
        { stepNumber: 2, target: '[data-tour="chart-type"]', title: 'Select Chart Type', description: 'Choose between Bar, Line, Area, or Pie visualization.' },
        { stepNumber: 3, target: '[data-tour="chart-data"]', title: 'Link Dataset', description: 'Select table cells or prompt AI to auto-populate data points.' }
      ]
    };
  }

  if (cleanIntent.includes('export') || cleanIntent.includes('pdf') || cleanIntent.includes('download') || cleanIntent.includes('share')) {
    return {
      title: 'How to Export & Share Documents',
      description: 'Export to PDF, DOCX, Markdown, or share live collaborating links.',
      steps: [
        { stepNumber: 1, target: '[data-tour="export-button"]', title: 'Click Export in Header', description: 'Locate the "Export" dropdown at the top right.' },
        { stepNumber: 2, target: '[data-tour="export-format"]', title: 'Select Format', description: 'Choose PDF, Microsoft Word (.docx), or Clean Markdown.' },
        { stepNumber: 3, target: '[data-tour="share-modal"]', title: 'Share & Permissions', description: 'Click "Share" to copy a view/edit link or invite team members.' }
      ]
    };
  }

  if (cleanIntent.includes('sheet') || cleanIntent.includes('formula') || cleanIntent.includes('calculate')) {
    return {
      title: 'How to Use Spreadsheets & Formulas',
      description: 'Navigate sheets, matrices, and smart formulas.',
      steps: [
        { stepNumber: 1, target: '[data-tour="sheet-mode"]', title: 'Switch to Sheets Mode', description: 'Select "Sheets" from the top left product switcher.' },
        { stepNumber: 2, target: '[data-tour="formula-bar"]', title: 'Enter Formulas', description: 'Type "=SUM(A1:A10)" or "=AVERAGE(B2:B8)" into any cell.' },
        { stepNumber: 3, target: '[data-tour="cell-dropdown"]', title: 'Add Dropdown Validation', description: 'Right-click a column and choose "Dropdown Validation" for interactive tags.' }
      ]
    };
  }

  // Default dynamic tour
  return {
    title: `Walkthrough: ${intent || 'Getting Started'}`,
    description: `Step-by-step interactive guidance for ${intent || 'performing this task'}.`,
    steps: [
      { stepNumber: 1, target: '[data-tour="toolbar"]', title: 'Locate Toolbar Controls', description: 'Use the top toolbar to access formatting, typography, and modes.' },
      { stepNumber: 2, target: '[data-tour="ai-prompt"]', title: 'Invoke AI Assistance', description: 'Press "/" or "@" anywhere in the canvas or chat to trigger specialized agents.' },
      { stepNumber: 3, target: '[data-tour="canvas"]', title: 'Review & Edit Canvas', description: 'Click directly on the document or slide canvas to refine your content.' }
    ]
  };
}

/**
 * Generate animated action script for Video Agent simulation
 */
export function generateVideoActionScript(intent, productMode = 'compose') {
  return {
    title: `Action Demo: ${intent || 'Performing Workflow'}`,
    duration: 6,
    captions: [
      { time: 0, text: '1. Initializing workspace and locating controls...' },
      { time: 2, text: `2. Executing: "${intent || 'Workflow Action'}"...` },
      { time: 4, text: '3. Applying styling, formatting, and layout structure...' },
      { time: 5.5, text: '4. Action complete! Ready to insert into canvas.' }
    ]
  };
}
