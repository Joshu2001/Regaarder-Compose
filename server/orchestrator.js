import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getSystemPromptForPersona } from './agentPrompts.js';

const INTENT_AGENT_PROMPT = `You are the Intent Agent for Regaarder Compose.
Analyze the user's voice or text command and extract their intent into a list of required specialized agent actions.
Available actions:
- set_title_subtitle: Set or update document title and subtitle.
- set_full_content: Replace the entire document content.
- append_content: Append new HTML content at the end of the document.
- prepend_content: Prepend new HTML content at the start of the document.
- clear_content: Clear document body text.
- clear_document: Reset title, subtitle, initiatives, sections, and body text.
- search_replace: Find and replace text across the document.
- format_text: Bold, italicize, underline, format headers (h1, h2, h3, p), font size/color, text alignment.
- apply_list_style: Apply bulleted, numbered, or custom list style.
- extract_table: Extract or summarize tabular data.
- generate_chart: Create a pie, bar, line, or heatmap chart.
- create_table: Generate a table.
- insert_image: Insert an image with caption.
- insert_callout: Insert a callout or quote box.
- insert_code: Insert a syntax-highlighted code snippet.
- insert_equation: Insert a LaTeX math equation.
- insert_link: Insert a hyperlink.
- insert_divider: Insert a horizontal rule line.
- insert_quote: Insert a pull quote block.
- insert_badge: Insert a styled inline badge.
- add_initiative: Add a key project initiative or metric block.
- update_initiative: Update an existing project initiative.
- remove_initiative: Remove a project initiative.
- append_section: Append a structured document section.
- update_section: Update an existing document section.
- remove_section: Remove a document section.
- export_document: Export document as Word, PDF, Compose JSON, HTML, or TXT.
- undo: Undo last action.
- redo: Redo last action.
- save_document: Explicitly save document draft.
- translate: Translate text into specified language.
- summarize: Summarize text or section.
- rewrite: Rewrite, proofread, or improve text.
- chat: General conversational response.

Return ONLY valid JSON matching the schema.`;

const EXECUTION_PLANNER_PROMPT = `You are the Execution Orchestrator Agent. 
You must fulfill the user's requested actions by emitting a sequence of precise EditorActions.

Available EditorActions:
1. {"action": "set_title_subtitle", "title": "Title String", "subtitle": "Subtitle String"}
2. {"action": "set_full_content", "text": "<p>Full HTML content...</p>"}
3. {"action": "append_content", "text": "<p>Appended HTML content...</p>"}
4. {"action": "prepend_content", "text": "<p>Prepended HTML content...</p>"}
5. {"action": "clear_content"}
6. {"action": "clear_document"}
7. {"action": "search_replace", "searchStr": "target text", "replaceStr": "replacement text", "caseSensitive": false}
8. {"action": "format_text", "command": "bold|italic|underline|strikeThrough|h1|h2|h3|p", "value": "optional value"}
9. {"action": "apply_list_style", "tab": "bulleted|numbered", "styleId": "disc|decimal|check|arrow"}
10. {"action": "replace_selection", "text": "HTML string replacing active selection"}
11. {"action": "insert_chart", "chartType": "bar|pie|line|heatmap", "data": [["A", "10"], ["B", "20"]], "headers": ["Category", "Value"], "title": "Chart Title"}
12. {"action": "insert_table", "data": [["Col1", "Col2"], ["Val1", "Val2"]]}
13. {"action": "insert_image", "src": "image URL", "alt": "description", "caption": "caption text"}
14. {"action": "insert_callout", "calloutType": "info|warning|success|error", "text": "callout body text", "icon": "💡"}
15. {"action": "insert_code", "code": "const x = 10;", "language": "javascript"}
16. {"action": "insert_equation", "latex": "E = mc^2"}
17. {"action": "insert_link", "text": "Link label", "url": "https://example.com"}
18. {"action": "insert_divider"}
19. {"action": "insert_quote", "text": "Quote text", "author": "Author Name"}
20. {"action": "insert_badge", "text": "Badge Text", "color": "#3b82f6"}
21. {"action": "add_initiative", "title": "Initiative Title", "desc": "Description", "tag": "In Progress", "metrics": "100% complete"}
22. {"action": "update_initiative", "id": "init_id", "title": "New Title", "tag": "Completed"}
23. {"action": "remove_initiative", "id": "init_id"}
24. {"action": "append_section", "title": "Section Title", "text": "<p>Section body HTML...</p>"}
25. {"action": "update_section", "sectionId": "sec_id", "title": "New Section Title"}
26. {"action": "remove_section", "sectionId": "sec_id"}
27. {"action": "export_document", "format": "word|pdf|compose|html|txt"}
28. {"action": "undo"}
29. {"action": "redo"}
30. {"action": "save_document"}
31. {"action": "insert_block", "blockType": "bullets|numbered_list", "text": "HTML list representation"}
32. {"action": "chat_message", "message": "Conversational reply to user"}

You will be given the user's original command, the parsed intents, and the active document context (including selected text, nearby paragraphs, and tables).
Generate the exact EditorActions required.
Ensure all numbers in chart data are clean strings (e.g. "500" not "$500").

Return ONLY valid JSON matching the schema.`;

export async function processAgentRequest(socket, intent, context, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to Gemini 1.5 Flash for fast reasoning
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  socket.emit('agent_state', { state: 'Understanding Intent...', progress: 10 });

  // 1. INTENT AGENT
  let intentData;
  try {
    const intentRes = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `User command: "${intent}"\nDocument Context: ${JSON.stringify(context)}` }] }],
      systemInstruction: { role: 'system', parts: [{ text: INTENT_AGENT_PROMPT }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: { actions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } },
          required: ["actions"]
        }
      }
    });
    intentData = JSON.parse(intentRes.response.text());
    socket.emit('agent_log', { message: `Intent Agent detected: ${intentData.actions.join(', ')}` });
  } catch (e) {
    throw new Error('Intent Agent failed to parse request: ' + e.message);
  }

  socket.emit('agent_state', { state: 'Planning Execution...', progress: 40 });

  // Determine Persona System Prompt
  const detectedActions = intentData.actions || [];
  let selectedPersonaKey = 'DOCUMENT_ARCHITECT';
  if (detectedActions.some(a => ['generate_chart', 'create_table', 'extract_table'].includes(a))) {
    selectedPersonaKey = 'DATA_VISUALS_SPECIALIST';
  } else if (detectedActions.some(a => ['rewrite', 'summarize', 'translate', 'search_replace', 'format_text', 'apply_list_style'].includes(a))) {
    selectedPersonaKey = 'PROOFREADER_REFINER';
  } else if (detectedActions.some(a => ['append_section', 'add_initiative', 'set_full_content'].includes(a))) {
    selectedPersonaKey = 'RESEARCHER_WRITER';
  }

  const activePersonaPrompt = `${getSystemPromptForPersona(selectedPersonaKey)}\n\n${EXECUTION_PLANNER_PROMPT}`;
  socket.emit('agent_log', { message: `Active Agent Persona: ${selectedPersonaKey}` });
  
  // 2. ORCHESTRATOR / EXECUTION PLANNER
  let execData;
  try {
    const execRes = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `User command: "${intent}"\nParsed Intents: ${detectedActions.join(', ')}\nDocument Context: ${JSON.stringify(context)}\n\nGenerate the EditorActions JSON array.` }] }],
      systemInstruction: { role: 'system', parts: [{ text: activePersonaPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            steps: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  action: { type: SchemaType.STRING },
                  text: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                  subtitle: { type: SchemaType.STRING },
                  searchStr: { type: SchemaType.STRING },
                  replaceStr: { type: SchemaType.STRING },
                  command: { type: SchemaType.STRING },
                  value: { type: SchemaType.STRING },
                  chartType: { type: SchemaType.STRING },
                  calloutType: { type: SchemaType.STRING },
                  blockType: { type: SchemaType.STRING },
                  message: { type: SchemaType.STRING },
                  src: { type: SchemaType.STRING },
                  alt: { type: SchemaType.STRING },
                  caption: { type: SchemaType.STRING },
                  code: { type: SchemaType.STRING },
                  language: { type: SchemaType.STRING },
                  latex: { type: SchemaType.STRING },
                  url: { type: SchemaType.STRING },
                  tag: { type: SchemaType.STRING },
                  metrics: { type: SchemaType.STRING },
                  id: { type: SchemaType.STRING },
                  sectionId: { type: SchemaType.STRING },
                  tab: { type: SchemaType.STRING },
                  styleId: { type: SchemaType.STRING },
                  author: { type: SchemaType.STRING },
                  color: { type: SchemaType.STRING },
                  format: { type: SchemaType.STRING },
                  headers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  data: { type: SchemaType.ARRAY, items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } }
                },
                required: ["action"]
              }
            }
          },
          required: ["steps"]
        }
      }
    });
    execData = JSON.parse(execRes.response.text());
  } catch (e) {
    throw new Error('Orchestrator failed to plan execution: ' + e.message);
  }

  socket.emit('agent_state', { state: 'Executing...', progress: 80 });
  
  // 3. EXECUTION AND VERIFICATION STREAMING
  for (let i = 0; i < execData.steps.length; i++) {
    const step = execData.steps[i];
    socket.emit('agent_log', { message: `Executing: ${step.action}` });
    socket.emit('agent_action', step);
    
    // Simulating client acknowledgement wait for verification loop
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  socket.emit('agent_state', { state: 'Complete', progress: 100 });
}
