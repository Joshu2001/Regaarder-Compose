import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const INTENT_AGENT_PROMPT = `You are the Intent Agent for Regaarder Compose.
Analyze the user's voice command and extract their intent into a list of required specialized agent actions.
Available actions:
- extract_table: If they want to chart/graph or summarize an existing table in the document.
- generate_chart: If they ask for a pie, bar, line, or heatmap chart.
- format_text: If they ask to bold, italicize, underline, or format as list.
- translate: If they ask to translate text.
- summarize: If they ask for a summary.
- rewrite: If they ask to rewrite, proofread, or improve text.
- create_table: If they ask to generate a brand new table from scratch.
- chat: General conversational response.

Return ONLY valid JSON matching the schema.`;

const EXECUTION_PLANNER_PROMPT = `You are the Execution Orchestrator Agent. 
You must fulfill the user's requested actions by emitting a sequence of precise EditorActions.

Available EditorActions:
1. {"action": "replace_selection", "text": "new HTML string replacing the selection"}
2. {"action": "insert_chart", "chartType": "bar|pie|line|heatmap", "data": [["A", "1"], ["B", "2"]], "headers": ["X", "Y"], "title": "Title"}
3. {"action": "insert_table", "data": [["Header1", "Header2"], ["Val1", "Val2"]]}
4. {"action": "chat_message", "message": "text to say to user"}
5. {"action": "insert_block", "blockType": "bullets|numbered_list", "text": "HTML list representation"}

You will be given the user's original command, the parsed intents, and the active document context (including selected text, nearby paragraphs, and tables).
Generate the exact EditorActions required. If translating, ensure you provide the translated text in replace_selection or insert_block.
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
  
  // 2. ORCHESTRATOR / EXECUTION PLANNER
  let execData;
  try {
    const execRes = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `User command: "${intent}"\nParsed Intents: ${intentData.actions.join(', ')}\nDocument Context: ${JSON.stringify(context)}\n\nGenerate the EditorActions JSON array.` }] }],
      systemInstruction: { role: 'system', parts: [{ text: EXECUTION_PLANNER_PROMPT }] },
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
                  chartType: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                  blockType: { type: SchemaType.STRING },
                  message: { type: SchemaType.STRING },
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
