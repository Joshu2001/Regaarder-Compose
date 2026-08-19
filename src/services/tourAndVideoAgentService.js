/**
 * tourAndVideoAgentService.js
 * 
 * Regaarder Tour & Video Autonomous Agents
 * - Tour Agent: Generates step-by-step interactive visual UI walkthroughs with spotlight guides.
 * - Video Agent: Autonomously simulates/records canvas actions, generating animated video replays and real DOM execution.
 */

export async function generateTourGuideViaAI(intent, productMode = 'compose', callGemini = null) {
  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Tour Guide Agent. The user asks:
"${intent}" in ${productMode === 'sheets' ? 'Sheets mode' : productMode === 'deck' ? 'Decks mode' : 'Docs mode'}.

REGAARDER COMPOSE ACTUAL APPLICATION CONTROLS & WORKFLOWS:
1. Images & Media: Click "+ Insert" on the top document toolbar -> Select "Images / Videos / Files", or type "/image" on the canvas, or drag and drop files directly onto the editor.
2. Tables & Grids: Click "+ Insert" -> "Table Grid" (hover to pick rows & cols), or type "/table".
3. Checklists & Tasks: Click "Lists" dropdown in toolbar -> "Checklist", or type "/checklist" or "- [ ] task".
4. Charts & Analytics: Click "+ Insert" -> "Chart", or type "/chart".
5. Math & Equations: Click "+ Insert" -> "Equations", or type "/math" or "$$formula$$".
6. Exporting: Click "Export" at top right -> choose PDF, Word (.docx), or Markdown.
7. AI & Slash Commands: Type "/" or "@" anywhere on the canvas or Assistant chat.

Generate a realistic 3-4 step walkthrough matching the user's exact request.
Return strict JSON matching this schema:
{
  "title": "Clear concise action title (e.g. How to Upload Images in Documents)",
  "description": "1-sentence summary of this workflow",
  "steps": [
    { "stepNumber": 1, "title": "Step 1 Title", "description": "Accurate instruction referencing actual Regaarder Compose UI buttons" },
    { "stepNumber": 2, "title": "Step 2 Title", "description": "Accurate instruction" },
    { "stepNumber": 3, "title": "Step 3 Title", "description": "Accurate instruction" }
  ]
}`;

    try {
      const res = await callGemini({
        userPrompt: prompt,
        systemPrompt: 'You are the Senior UI Architect & Tour Guide for Regaarder Compose. Return strict JSON only without markdown code fences.'
      });
      
      let raw = String(res?.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = typeof res?.parsed === 'object' && res?.parsed !== null ? res.parsed : JSON.parse(raw);
      if (parsed && parsed.title && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[TourAgent] LLM generation error, using smart fallback:', err);
    }
  }

  return generateTourGuide(intent, productMode);
}

export function generateTourGuide(intent, productMode = 'compose') {
  const cleanIntent = String(intent || '').toLowerCase();
  
  if (cleanIntent.includes('image') || cleanIntent.includes('photo') || cleanIntent.includes('picture') || cleanIntent.includes('upload')) {
    return {
      title: 'How to Upload & Insert Images',
      description: 'Follow these steps to insert local images, stock photos, or AI-generated visuals.',
      steps: [
        { stepNumber: 1, title: 'Open Insert Menu', description: 'Click "+ Insert" on the top document toolbar, or press "/" and type "image".' },
        { stepNumber: 2, title: 'Select Images / Media', description: 'Choose "Images / Videos / Files" from the dropdown menu.' },
        { stepNumber: 3, title: 'Upload or Drag & Drop', description: 'Select a file from your device, or drag and drop an image directly onto the editor canvas.' }
      ]
    };
  }

  if (cleanIntent.includes('checklist') || cleanIntent.includes('task') || cleanIntent.includes('todo') || cleanIntent.includes('find')) {
    return {
      title: 'How to Find & Use Checklists',
      description: 'Locate tasks and interactive checklist items in your document.',
      steps: [
        { stepNumber: 1, title: 'Search Document', description: 'Press "Ctrl + F" or use the search bar to locate specific task keywords.' },
        { stepNumber: 2, title: 'Insert New Tasks', description: 'Type "/checklist" or select "Lists > Checklist" from the toolbar.' },
        { stepNumber: 3, title: 'Interact with Checkboxes', description: 'Click any square checkbox on the canvas to toggle task completion.' }
      ]
    };
  }

  if (cleanIntent.includes('table') || cleanIntent.includes('grid')) {
    return {
      title: 'How to Insert & Format a Data Table',
      description: 'Follow this 3-step walkthrough to create and customize tables.',
      steps: [
        { stepNumber: 1, title: 'Open Insert Menu', description: 'Click "+ Insert" on the top document toolbar or type "/table".' },
        { stepNumber: 2, title: 'Choose Grid Dimensions', description: 'Hover over the grid picker to select rows and columns.' },
        { stepNumber: 3, title: 'Apply Dropdowns & Formats', description: 'Click header cells to configure dropdown tags or currency formatting.' }
      ]
    };
  }

  return {
    title: `Walkthrough: ${intent || 'Getting Started'}`,
    description: `Step-by-step guidance for ${intent || 'performing this task'}.`,
    steps: [
      { stepNumber: 1, title: 'Access Toolbar or Slash Menu', description: 'Use the top toolbar or press "/" anywhere on the canvas to view available tools.' },
      { stepNumber: 2, title: 'Select Desired Action', description: `Choose the tool corresponding to "${intent || 'your task'}" from the menu.` },
      { stepNumber: 3, title: 'Configure & Review', description: 'Customize settings in the active overlay or canvas block.' }
    ]
  };
}

export async function generateVideoActionScriptViaAI(intent, productMode = 'compose', callGemini = null, documentContent = '') {
  if (typeof callGemini === 'function') {
    const prompt = `You are the Regaarder Compose Video Agent. The user wants to see:
"${intent}" in ${productMode === 'sheets' ? 'Sheets mode' : productMode === 'deck' ? 'Decks mode' : 'Docs mode'}.

Generate an action demo script with realistic 4-step captions explaining what the AI is scanning, executing, and updating in the app.
Return strict JSON:
{
  "title": "Action Demo: ${intent}",
  "duration": 6,
  "captions": [
    { "time": 0, "text": "1. Scanning document structure for ${intent}..." },
    { "time": 2, "text": "2. Navigating and locating target elements..." },
    { "time": 4, "text": "3. Executing workflow on canvas..." },
    { "time": 5.5, "text": "4. Task completed and verified." }
  ]
}`;

    try {
      const res = await callGemini({
        userPrompt: prompt,
        systemPrompt: 'You are the Video Demo Agent. Return strict JSON only without code fences.'
      });
      let raw = String(res?.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = typeof res?.parsed === 'object' && res?.parsed !== null ? res.parsed : JSON.parse(raw);
      if (parsed && parsed.title && Array.isArray(parsed.captions) && parsed.captions.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[VideoAgent] LLM generation error:', err);
    }
  }

  return generateVideoActionScript(intent, productMode);
}

export function generateVideoActionScript(intent, productMode = 'compose') {
  return {
    title: `Action Demo: ${intent || 'Performing Workflow'}`,
    duration: 6,
    captions: [
      { time: 0, text: `1. Scanning document and workspace for: "${intent || 'Action'}"...` },
      { time: 2, text: `2. Navigating to target section in ${productMode} mode...` },
      { time: 4, text: '3. Executing action and applying styles...' },
      { time: 5.5, text: '4. Workflow executed successfully.' }
    ]
  };
}
