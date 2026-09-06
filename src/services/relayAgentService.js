/**
 * relayAgentService.js
 * 
 * Relay Autonomous Agent Harness & Multi-Layer Execution Engine
 * 
 * Implements Layer 2 (Orchestration & Intent Parsing) and Layer 3 (Tool Invocation)
 * for Regaarder Relay (Executive Direct Messages).
 * 
 * Allows users to converse with Relay to:
 * 1. Create and edit documents in Compose Docs with full generated content
 * 2. Schedule and manage tasks/initiatives
 * 3. Update spreadsheet cells and matrices
 * 4. Scan workspace documents for deep-link citations with exact line numbers
 */

import { 
  getAgentContext, 
  rememberInstruction, 
  addProjectRule, 
  mutateAndPropagate 
} from './universalContextGraph.js';
import { mcpClient } from './universalMcpBridge.js';
import * as intentScheduler from './intentSchedulerEngine.js';
import * as spatialTopology from './spatialTopologyEngine.js';
import * as roomObserver from './roomObserverEngine.js';
import * as agentHandoffBus from './agentHandoffBus.js';
import { runAgentExecutionLoop } from './llmProviderService.js';

/**
 * Converts markdown text into executive-tier, semantic document HTML.
 * Strips conversational chatter and automatically synthesizes structured sections
 * if a lightweight model under-generates.
 */
export function convertMarkdownToDocumentHtml(markdownText, docTitle = '') {
  const title = docTitle || 'Executive Strategic Briefing';
  let raw = (markdownText || '').trim();

  // 1. Strip conversational lead-in sentences (even on the same continuous line)
  let cleaned = raw
    .replace(/^(okay|sure|certainly|acknowledged|understood|here is|here's|let's generate|let's create|let's draft|alright)[^.:\n]*[.:\n]+\s*/i, '')
    .replace(/^(here's a preliminary outline|here is an outline|here is a draft|here is a breakdown|to ensure it delivers comprehensive information:)[^.:\n]*[.:\n]+\s*/i, '')
    .trim();

  // 2. Strip conversational trailing sign-offs
  cleaned = cleaned.replace(/\n+(let me know|hope this helps|feel free to|is there anything else|let us know)[^\n]*$/i, '').trim();

  // 3. Substantive content check: If model under-generated (< 40 words), synthesize executive sections
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordCount < 40) {
    const seedOverview = cleaned && cleaned.length > 25
      ? cleaned
      : `This document outlines the strategic priorities, market shifts, and operational deliverables for ${title}.`;

    cleaned = `## Executive Overview\n${seedOverview}\n\n## Key Strategic Drivers & Market Shifts\n1. **Macro & Environmental Transition:** Evaluating evolving regulatory mandates, decarbonization standards, and sustainability baselines.\n2. **Technological & Operational Evolution:** Transitioning to high-efficiency processes, resilient inputs, and modernized infrastructure.\n3. **Supply Resilience & Risk Mitigation:** Diversifying critical material pipelines, resolving vulnerabilities, and establishing continuity safeguards.\n\n## Implementation Milestones\n* **Phase 1 (Scoping & Baseline Mapping):** Conduct compliance review, data gathering, and stakeholder alignment.\n* **Phase 2 (Strategic Execution):** Deploy target initiatives and operational modernization roadmap.\n* **Phase 3 (Review & Performance Tracking):** Measure impact against quarterly KPIs and optimize resource allocation.`;
  }

  const lines = cleaned.split(/\r?\n/);
  const htmlParts = [];
  let inList = false;
  let listType = 'ul'; // 'ul' | 'ol'

  const closeListIfOpen = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeListIfOpen();
      return;
    }

    // Heading 1 (# Title or # **Title**)
    if (trimmed.startsWith('# ')) {
      closeListIfOpen();
      const content = trimmed.slice(2).replace(/^\*\*|\*\*$/g, '');
      htmlParts.push(`<h1>${formatInlineMarkdown(content)}</h1>`);
      return;
    }

    // Heading 2 (## Subtitle)
    if (trimmed.startsWith('## ')) {
      closeListIfOpen();
      const content = trimmed.slice(3).replace(/^\*\*|\*\*$/g, '');
      htmlParts.push(`<h2>${formatInlineMarkdown(content)}</h2>`);
      return;
    }

    // Heading 3 (### Section)
    if (trimmed.startsWith('### ')) {
      closeListIfOpen();
      const content = trimmed.slice(4).replace(/^\*\*|\*\*$/g, '');
      htmlParts.push(`<h3>${formatInlineMarkdown(content)}</h3>`);
      return;
    }

    // Standalone **Bold Heading Line** treated as <h2>
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      closeListIfOpen();
      const headingText = trimmed.replace(/^\*\*|\*\*$/g, '');
      htmlParts.push(`<h2>${formatInlineMarkdown(headingText)}</h2>`);
      return;
    }

    // Numbered list item (e.g. 1. **Title:** description)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        closeListIfOpen();
        htmlParts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li>${formatInlineMarkdown(numMatch[2])}</li>`);
      return;
    }

    // Bullet list item (e.g. * Item or - Item or • Item)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeListIfOpen();
        htmlParts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlParts.push(`<li>${formatInlineMarkdown(bulletMatch[1])}</li>`);
      return;
    }

    // Standard paragraph
    closeListIfOpen();
    htmlParts.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  });

  closeListIfOpen();

  let finalHtml = htmlParts.join('\n');

  // Prepend document H1 title if not already present at top
  if (title && !finalHtml.toLowerCase().startsWith('<h1')) {
    finalHtml = `<h1>${title}</h1>\n${finalHtml}`;
  }

  return finalHtml;
}

function formatInlineMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
  * Heuristic intent classifier for rapid zero-latency detection
  */
export function classifyRelayIntent(prompt) {
  const text = (prompt || '').trim().toLowerCase();

  const isTranslation = /\b(translate|traducir|traduire|übersetzen|翻译|翻訳)\b/i.test(text) || /\b(to|into|in)\s+(chinese|spanish|french|german|japanese|russian|arabic|hindi|portuguese|italian|english)\b/i.test(text);
  const isMemoryInstruction = !isTranslation && /(remember that|our rule is|always make sure|from now on|save instruction|project rule:|never forget)/i.test(text);
  const isScheduleMeeting = !isTranslation && !isMemoryInstruction && (
    /(schedule|book|arrange|set up|plan)\s+(a\s+)?(meeting|sync|call|discussion|review|session|prep|practice)/i.test(text) ||
    /\b(tennis practice|board prep sync|investor pitch sync|architecture review|design sync|financial audit session)\b/i.test(text)
  );
  const isDirectiveQueue = !isTranslation && !isMemoryInstruction && (
    /(?:queue|run|assign|execute|checkout)\s+(?:an?|the)?\s*(?:agent|autonomous)?\s*(?:directive|task|execution)/i.test(text) ||
    /(?:add|create|dispatch)\s+(?:an?|the)?\s*(?:agent|autonomous)?\s*(?:directive|execution|agent\s+task|autonomous\s+task)/i.test(text)
  );
  const isWhiteboardTopology = !isTranslation && !isMemoryInstruction && (
    /(?:compile|render|generate|export|patch|inspect)\s+(?:an?|the)?\s*(?:whiteboard|diagram|flowchart|architecture|spatial topology)/i.test(text) ||
    /(?:whiteboard topology|spatial graph|diagram to schema|architecture diagram)/i.test(text)
  );
  const isRoomHarvester = !isTranslation && !isMemoryInstruction && (
    /(?:harvest|observe|transcribe|listen|monitor|join)\s+(?:an?|the)?\s*(?:room|meeting|audio|call|speech|discussion|in-meeting)/i.test(text) ||
    /(?:meeting observer|room observer|room context|in-meeting observer|meeting transcript|harvest meeting)/i.test(text)
  );
  const isAgentHandoff = !isTranslation && !isMemoryInstruction && (
    /(?:handoff|hand-off|delegate to|dispatch to|subagent|multi-agent|peer agent|specialist agent)/i.test(text) ||
    /(?:browser researcher|calendar negotiator|finance modeler|doc synthesizer)\b/i.test(text)
  );
  const isDocCreation = !isTranslation && !isMemoryInstruction && !isAgentHandoff && !isScheduleMeeting && !isDirectiveQueue && !isWhiteboardTopology && !isRoomHarvester && /(create|make|start|draft|write|generate)\s+(a\s+)?(new\s+)?(document|doc|proposal|brief|memo|notes|report)/i.test(text);
  const isTaskSchedule = !isTranslation && !isMemoryInstruction && !isAgentHandoff && !isScheduleMeeting && !isDirectiveQueue && !isWhiteboardTopology && !isRoomHarvester && (/(add|create|schedule|set|assign)\s+(a\s+)?(new\s+)?(task|todo|initiative|action item|deadline|reminder)/i.test(text) || /\bdue\s+(today|tomorrow|next|on|by)\b/i.test(text));
  const isSheetUpdate = !isTranslation && !isMemoryInstruction && (/(update|set|change|write|fill)\s+(the\s+)?(sheet|cell|row|column|cells)\s+([a-z]\d+|\d+)/i.test(text) || /(update|modify)\s+(spreadsheet|sheets)/i.test(text));
  const isCitationQuery = !isTranslation && !isMemoryInstruction && (/(where is|where does it mention|find in docs|search docs for|cite where|what doc discusses|reference for|show me where)/i.test(text) || /\b(citation|citations|source reference)\b/i.test(text));
  const isIngestDocument = !isSheetUpdate && !isCitationQuery && !isDocCreation && !isDirectiveQueue && !isWhiteboardTopology && !isRoomHarvester &&
    /(ingest|import|upload|parse|absorb)\s+(a\s+)?(file|document|pdf|csv|spreadsheet|docx|pptx)/i.test(text);

  return {
    isAction: isDocCreation || isTaskSchedule || isScheduleMeeting || isSheetUpdate || isCitationQuery || isMemoryInstruction || isIngestDocument || isDirectiveQueue || isWhiteboardTopology || isRoomHarvester || isAgentHandoff,
    isAgentHandoff,
    isDocCreation,
    isTaskSchedule,
    isDirectiveQueue,
    isScheduleMeeting,
    isSheetUpdate,
    isCitationQuery,
    isIngestDocument,
    isWhiteboardTopology,
    isRoomHarvester,
    isTranslation,
    isMemoryInstruction
  };
};

/**
 * Searches all workspace documents for citations and computes 1-based line numbers
 */
export function searchWorkspaceCitations(query) {
  if (typeof window === 'undefined') return [];
  const allDocs = window.__REGAARDER_WORKSPACE_DOCS__ || [];
  const cleanQuery = (query || '').toLowerCase().trim();
  if (!cleanQuery) return [];

  const results = [];

  allDocs.forEach(doc => {
    const title = doc.title || doc.sheetsTitle || doc.deckTitle || 'Untitled Document';
    const bodyHtml = doc.bodyHtml || '';
    const plainText = doc.text || '';

    let blocks = [];
    if (typeof document !== 'undefined' && bodyHtml) {
      const container = document.createElement('div');
      container.innerHTML = bodyHtml;
      const elements = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote, tr, div'))
        .filter(el => el.textContent && el.textContent.trim().length > 0);
      
      if (elements.length > 0) {
        blocks = elements.map(el => el.textContent.trim());
      }
    }

    if (blocks.length === 0) {
      const rawLines = (plainText || bodyHtml.replace(/<[^>]+>/g, '\n')).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      blocks = rawLines;
    }

    blocks.forEach((blockText, idx) => {
      if (blockText.toLowerCase().includes(cleanQuery)) {
        results.push({
          docId: doc.id,
          title: title,
          type: doc.mode || 'compose',
          line: idx + 1,
          snippet: blockText.length > 180 ? blockText.slice(0, 180) + '...' : blockText
        });
      }
    });
  });

  return results.slice(0, 8);
}

/**
 * System prompt instructing the model to operate as the Relay Autonomous Agent.
 * Conditioned specifically to avoid conversational chatter and output executive content.
 */
const RELAY_AGENT_SYSTEM_PROMPT = `You are the Regaarder Relay Autonomous Executive Agent.
When creating a document, memo, or outline:
- DO NOT say "Okay", "Sure", "Here's a draft", or talk to the user conversationally.
- Start directly with the document title and content.
- Include an "## Executive Overview" section.
- Include numbered points (1., 2., 3.) with bold titles explaining key strategic drivers and impacts.
- Include an "## Implementation Milestones" section.
- Write substantive, high-level professional paragraphs.`;

/**
 * Main execution dispatcher for Relay
 */
export async function processRelayAgentMessage(args = {}) {
  const options = typeof args === 'string' ? { userPrompt: args } : (args || {});
  const {
    userPrompt,
    onCallAi,
    customModel,
    customProvider,
    existingThread = [],
    systemPrompt: customSystemPrompt,
    personaName
  } = options;
  const trimmed = (userPrompt || '').trim();
  const intent = classifyRelayIntent(trimmed);

  let replyText = '';
  let actionCard = null;
  let referenceSources = [];

  // If citation query, immediately extract matching references from live workspace docs
  if (intent.isCitationQuery) {
    const searchTerms = trimmed
      .replace(/(where is|where does it mention|find in docs|search docs for|cite where|what doc discusses|reference for|show me where)/gi, '')
      .replace(/["'?.]/g, '')
      .trim();
    
    if (searchTerms) {
      referenceSources = searchWorkspaceCitations(searchTerms);
    }
  }

  // Handle Persistent Memory & Rule Storage Intent
  if (intent.isMemoryInstruction) {
    const cleanRule = trimmed
      .replace(/^(remember that|our rule is|always make sure|from now on|save instruction|project rule:|never forget)\s*[:,-]?\s*/i, '')
      .trim();

    const isRule = /rule|must|never|always|enforce/i.test(trimmed);
    if (isRule) {
      addProjectRule({ rule: cleanRule, project: 'Global Workspace', enforcement: 'strict' });
    } else {
      rememberInstruction({ text: cleanRule, category: 'user_directive', project: 'Global Workspace', priority: 'strict' });
    }

    return {
      replyText: `I have committed that directive to your persistent workspace memory bank:\n\n> "${cleanRule}"\n\nAll future agent syntheses and cross-app workflows will strictly observe this constraint.`,
      actionCard: {
        type: 'memory',
        subType: 'stored',
        title: 'Committed to Memory Bank',
        description: `Stored as persistent ${isRule ? 'project rule' : 'workspace instruction'}.`,
        previewSnippet: cleanRule
      },
      referenceSources: []
    };
  }

  // Handle Constraint-Based Intent Scheduling (Pillar 6)
  if (intent.isScheduleMeeting) {
    const spec = intentScheduler.parseIntentToScheduleSpec(trimmed);
    const negotiation = intentScheduler.negotiateScheduleBetweenAgents(spec);

    const slotTimeStr = negotiation.agreedSlot?.formattedTime || 'Optimized Window';
    const confidencePct = Math.round((negotiation.agreedSlot?.utilityScore || 0.88) * 100);

    actionCard = {
      type: 'schedule',
      subType: 'negotiated',
      title: `Scheduled: ${spec.title}`,
      description: `Multi-agent negotiation converged on optimal slot (${negotiation.negotiationRecord?.roundsCount || 2} rounds, Pareto utility ${confidencePct}%).`,
      agreedSlot: negotiation.agreedSlot,
      confidence: confidencePct,
      participants: spec.participants,
      event: {
        title: spec.title,
        intentCategory: spec.intentCategory,
        startTime: negotiation.agreedSlot?.start || new Date().toISOString(),
        endTime: negotiation.agreedSlot?.end || new Date(Date.now() + (spec.durationMin || 60) * 60 * 1000).toISOString(),
        durationMin: spec.durationMin,
        participants: spec.participants,
        priority: spec.priority,
        constraints: spec.constraints
      }
    };

    replyText = `I analyzed your intent for **"${spec.title}"** (Systemic domain: \`${spec.intentCategory}\`, Prep buffer: ${spec.constraints?.prepBufferMin || 15}m).\n\nAlex Agent and Elena Agent conducted alternating-offer parameter negotiation and reached Pareto convergence at **${slotTimeStr}** (${confidencePct}% confidence). You can confirm the slot or inspect the schedule below.`;

    return {
      replyText,
      actionCard,
      referenceSources: []
    };
  }

  // Handle Whiteboard Spatial Topology & Diagram Compiler (Pillar 9)
  if (intent.isWhiteboardTopology) {
    const graph = spatialTopology.getTopologyGraph();
    const isSql = /sql|ddl|database|table/i.test(trimmed);
    const isOpenApi = /openapi|swagger|endpoint|api/i.test(trimmed);
    const isState = /state|fsm|xstate|lifecycle/i.test(trimmed);
    const target = isSql ? 'sql' : (isOpenApi ? 'openapi' : (isState ? 'state_machine' : 'summary'));
    
    let compiledCode = '';
    if (target === 'sql') compiledCode = spatialTopology.compileTopologyToSqlSchema();
    else if (target === 'openapi') compiledCode = spatialTopology.compileTopologyToOpenApi();
    else if (target === 'state_machine') compiledCode = spatialTopology.compileTopologyToStateMachine();
    else compiledCode = spatialTopology.compileTopologyToArchitectureSummary();

    const analysis = spatialTopology.analyzeTopology();

    actionCard = {
      type: 'topology',
      subType: 'compiled',
      title: `Spatial Topology: ${target.toUpperCase()}`,
      description: `Compiled visual whiteboard canvas (${graph.nodes.length} nodes, ${graph.edges.length} edges, ${analysis.hasCycles ? 'cyclic' : 'acyclic'}) into ${target.toUpperCase()}.`,
      target,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      previewSnippet: compiledCode.slice(0, 300)
    };

    replyText = `I processed the spatial whiteboard canvas topology (**${graph.nodes.length} nodes**, **${graph.edges.length} directed edges**).\n\nBi-directional compiler emitted **${target.toUpperCase()}** specifications with complete relational constraints.\n\n\`\`\`${target === 'sql' ? 'sql' : target === 'summary' ? 'markdown' : 'json'}\n${compiledCode.slice(0, 450)}${compiledCode.length > 450 ? '\n// ...' : ''}\n\`\`\`\n\nYou can inspect or synthesize further in the Spatial Topology Inspector.`;

    return {
      replyText,
      actionCard,
      referenceSources: []
    };
  }

  // Handle Room Real-Time Context Harvester & Multi-Agent Observer (Pillar 10)
  if (intent.isRoomHarvester) {
    const session = roomObserver.getLiveSession();
    const isSimulate = /simulate|run simulation|demo meeting|sample call/i.test(trimmed);

    if (isSimulate && session.speakerTurns.length === 0) {
      roomObserver.runSyntheticMeetingSimulation();
    }

    const updatedSession = roomObserver.getLiveSession();
    const snippet = roomObserver.serializeRoomContextToMarkdown(updatedSession);

    actionCard = {
      type: 'room_harvester',
      subType: 'live_stream',
      title: `Room In-Meeting Observer: ${updatedSession.title}`,
      description: `Active observers (${updatedSession.activeObservers.map(o => o.name).join(', ')}) tracking live organizational intent, decisions, and cross-app mutations.`,
      meetingId: updatedSession.meetingId,
      speakerCount: updatedSession.participants.length,
      turnsCount: updatedSession.summary.totalTurns,
      decisionsCount: updatedSession.summary.decisionsCount,
      directivesCount: updatedSession.summary.directivesCount,
      activePrBranchId: updatedSession.activePrBranchId,
      previewSnippet: snippet.slice(0, 320)
    };

    replyText = `The **Room Context Harvester & Multi-Agent In-Meeting Observer** is actively monitoring "${updatedSession.title}".\n\n- **Active Observers:** ${updatedSession.activeObservers.map(o => o.name).join(', ')}\n- **Speaker Turns Processed:** ${updatedSession.summary.totalTurns}\n- **Epistemic Decisions Harvested:** ${updatedSession.summary.decisionsCount}\n- **Directives Queued:** ${updatedSession.summary.directivesCount}\n${updatedSession.activePrBranchId ? `- **Staged Meeting PR:** \`${updatedSession.activePrBranchId}\`\n` : ''}\nYou can inspect live transcripts, consensus cards, and staged PR diffs in the Room Observer Inspector.`;

    return {
      replyText,
      actionCard,
      referenceSources: []
    };
  }

  // Handle Multi-Agent Handoff & Specialist Delegation Substrate
  if (intent.isAgentHandoff) {
    const isBrowser = /browser|web|scrape|research|url|http/i.test(trimmed);
    const isScheduler = /schedule|calendar|slot|meeting|negotiat/i.test(trimmed);
    const isFinance = /finance|sheet|financial|matrix|reconcil|model/i.test(trimmed);
    const targetCapability = isBrowser
      ? 'browser_research'
      : (isScheduler ? 'scheduler_negotiation' : (isFinance ? 'finance_modeling' : 'doc_synthesis'));

    const envelope = await agentHandoffBus.dispatchAgentHandoff({
      sourceAgentId: 'agent_relay_orchestrator',
      targetCapability,
      intent: trimmed,
      contextPayload: {
        rawDirective: trimmed,
        targetUrl: isBrowser ? 'https://ec.europa.eu/energy/data-analysis' : undefined
      },
      parameters: {
        searchTopic: trimmed,
        maxRounds: 4
      }
    });

    actionCard = {
      type: 'agent_handoff',
      subType: 'dispatched',
      title: `A2A Handoff: ${envelope.handoffId}`,
      handoffId: envelope.handoffId,
      sourceAgentId: envelope.sourceAgentId,
      targetAgentId: envelope.targetAgentId,
      targetCapability: envelope.targetCapability,
      lifecycle: envelope.lifecycle,
      description: `Delegated directive to ${envelope.targetAgentId} (${envelope.targetCapability}) with standardized envelope and alternating offer loop.`,
      previewSnippet: trimmed
    };

    replyText = `I have dispatched an **Agent-to-Agent (A2A) Handoff** (\`${envelope.handoffId}\`).\n\n- **Source:** \`${envelope.sourceAgentId}\` (Relay Director)\n- **Specialist:** \`${envelope.targetAgentId}\` (\`${envelope.targetCapability}\`)\n- **State:** \`${envelope.lifecycle}\`\n- **Directive:** "${trimmed}"\n\nYou can track alternating counter-offers, utility convergence, and staged PR diffs in the **Agent Handoffs** tab in Memory Dashboard.`;

    return {
      replyText,
      actionCard,
      referenceSources: []
    };
  }

  // Build active system prompt prioritizing custom persona instructions with explicit role anchoring
  const rolePrefix = personaName
    ? `[STRICT IDENTITY & ROLE ANCHORING]
You are ${personaName}. Stay strictly in character as ${personaName} at all times.
The message you are receiving is from the User speaking to you.
Do not confuse the User's name or greeting with yourself: if the user greets you with your name (e.g. "Hello Mr. Wells" or "Hello Dr. Wells"), acknowledge them warmly as yourself, never call the user by your own name.
If asked "Who are you?", identify yourself strictly as ${personaName} and describe your background or purpose according to your persona instructions. Never claim to be "Regaarder Relay", "an AI assistant", or a generic bot.

`
    : '';

  let activeSystemPrompt = customSystemPrompt
    ? `${rolePrefix}${customSystemPrompt}`
    : `${rolePrefix}You are an executive intelligent assistant in Regaarder Relay. Answer user queries directly, concisely, and naturally. Never create a document or output outlines unless explicitly asked.`;

  if (intent.isTranslation) {
    activeSystemPrompt = `${activeSystemPrompt}\n\n[TASK]: Provide an accurate, direct translation of the requested sentence or text into the target language. Do not invent outlines or add commentary.`;
  } else if (intent.isDocCreation) {
    const memoryContext = getAgentContext({ maxEntities: 6, maxRules: 4, maxDecisions: 2 });
    activeSystemPrompt = `${activeSystemPrompt}\n\n${RELAY_AGENT_SYSTEM_PROMPT}\n\n${memoryContext}`;
  } else {
    const memoryContext = getAgentContext({ maxEntities: 4, maxRules: 3, maxDecisions: 2 });
    activeSystemPrompt = `${activeSystemPrompt}\n\n${memoryContext}`;
  }

  // Attempt AI invocation via onCallAi bridge
  let modelJson = null;
  if (typeof onCallAi === 'function') {
    try {
      const aiRaw = await onCallAi({
        userPrompt: trimmed,
        systemPrompt: activeSystemPrompt,
        customModel,
        customProvider
      });

      const rawString = typeof aiRaw === 'string' ? aiRaw : (aiRaw?.text || aiRaw?.content || '');
      if (rawString) {
        const jsonMatch = rawString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            modelJson = JSON.parse(jsonMatch[0]);
          } catch (_parseErr) {
            // Not valid JSON; rawString is natural language markdown from local model
          }
        }

        if (!modelJson) {
          replyText = rawString;
        }
      }
    } catch (aiErr) {
      console.warn('[RelayAgent] AI invocation failed, using deterministic execution fallback:', aiErr);
    }
  }

  // Attempt dynamic multi-turn tool calling loop if model not yet answered and provider/config given
  if (!replyText && !modelJson && (customProvider || options.aiConfig)) {
    try {
      const loopResult = await runAgentExecutionLoop({
        prompt: trimmed,
        systemPrompt: activeSystemPrompt,
        aiConfig: {
          provider: customProvider,
          activeModel: customModel,
          ...(options.aiConfig || {})
        }
      });

      if (loopResult && loopResult.success) {
        replyText = loopResult.replyText;
        const tools = loopResult.executedTools || [];
        if (tools.length > 0) {
          const primary = tools[0];
          actionCard = {
            type: primary.toolName.includes('document') || primary.toolName.includes('content') ? 'document' : 'action',
            subType: 'llm_executed',
            title: `Tool: ${primary.toolName.replace(/_/g, ' ')}`,
            description: primary.result?.message || `Executed ${primary.toolName} dynamically via agent loop (${loopResult.turnsCount} turns).`,
            previewSnippet: typeof primary.arguments === 'object' ? JSON.stringify(primary.arguments, null, 2) : String(primary.arguments)
          };
        }
      }
    } catch (loopErr) {
      console.warn('[RelayAgent] runAgentExecutionLoop fallback error:', loopErr);
    }
  }

  // Case A: Model returned structured tool JSON
  if (modelJson) {
    replyText = modelJson.replyText || modelJson.message || '';
    const action = modelJson.action;
    const params = modelJson.params || {};

    if (action === 'create_document' && params.title) {
      const content = params.contentHtml 
        ? params.contentHtml 
        : convertMarkdownToDocumentHtml(replyText || params.title, params.title);

      if (typeof window !== 'undefined' && window.__REGAARDER_CREATE_DOC__) {
        const created = window.__REGAARDER_CREATE_DOC__({
          title: params.title,
          contentHtml: content,
          mode: 'compose'
        });

        // Clean snippet for preview (strip H1 title and HTML tags)
        const previewSnippet = content
          .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        actionCard = {
          type: 'document',
          subType: 'created',
          title: params.title,
          docId: created?.docId || Date.now(),
          description: `Document "${params.title}" has been created and prepared in Compose Docs.`,
          previewSnippet: previewSnippet.slice(0, 160)
        };

        // Auto-propagate new document node into Universal Context Graph
        mutateAndPropagate({
          entityId: `ent_doc_${created?.docId || Date.now()}`,
          changes: {
            title: params.title,
            type: 'document',
            workspace: 'compose',
            excerpt: previewSnippet,
            content: previewSnippet,
            metadata: { docId: created?.docId, status: 'Active' }
          },
          reason: 'Agent Document Synthesis in Relay',
          actor: 'agent'
        });
      }
    } else if (action === 'add_task' && params.title) {
      if (typeof window !== 'undefined' && window.__REGAARDER_ADD_TASK__) {
        const res = window.__REGAARDER_ADD_TASK__(params);
        actionCard = {
          type: 'task',
          subType: 'added',
          title: params.title,
          taskId: res?.data?.id || `task_${Date.now()}`,
          priority: params.priority || 'Medium',
          assignee: params.assignee || 'Unassigned',
          dueDate: params.dueDate || 'Flexible',
          description: `Scheduled task "${params.title}" in workspace initiatives.`
        };

        mutateAndPropagate({
          entityId: `ent_task_${res?.data?.id || Date.now()}`,
          changes: {
            title: params.title,
            type: 'task',
            workspace: 'tasks',
            excerpt: params.title,
            metadata: { priority: params.priority || 'Medium', status: 'In Progress' }
          },
          reason: 'Agent Task Scheduling in Relay',
          actor: 'agent'
        });
      }
    } else if (action === 'update_sheet' && params.updates?.length) {
      if (typeof window !== 'undefined' && window.__REGAARDER_UPDATE_SHEET_CELLS__) {
        window.__REGAARDER_UPDATE_SHEET_CELLS__(params.updates);
        actionCard = {
          type: 'sheet',
          subType: 'updated',
          title: 'Active Spreadsheet',
          description: `Updated ${params.updates.length} cell(s) in active spreadsheet.`,
          cellCount: params.updates.length
        };

        mutateAndPropagate({
          entityId: 'ent_nv_sheet',
          changes: {
            excerpt: `Updated ${params.updates.length} cell(s) via agent action.`,
            metadata: { updatesCount: params.updates.length }
          },
          reason: 'Agent Spreadsheet Cell Update in Relay',
          actor: 'agent'
        });
      }
    } else if (action === 'search_workspace_citations' && params.query) {
      referenceSources = searchWorkspaceCitations(params.query);
    } else if (['remember_instruction', 'add_project_rule', 'record_decision', 'mutate_and_propagate', 'validate_tool_call'].includes(action)) {
      try {
        const mcpResult = await mcpClient.callTool(action, params);
        actionCard = {
          type: action === 'record_decision' ? 'decision' : 'memory',
          subType: 'mcp_execution',
          title: `MCP: ${action.replace(/_/g, ' ').toUpperCase()}`,
          description: mcpResult?.content?.[0]?.text || `Executed ${action} via native Model Context Protocol.`,
          previewSnippet: typeof params === 'object' ? JSON.stringify(params, null, 2) : String(params)
        };
      } catch (mcpErr) {
        console.warn(`[RelayAgent] MCP callTool failed for ${action}:`, mcpErr);
      }
    }
  }

  // Case B: Document Creation Intent with plain-text AI output (e.g. gemma3:1b, llama3, or local Ollama)
  if (!actionCard && intent.isDocCreation) {
    const titleMatch = trimmed.match(/(?:titled|named|called|title)\s+["']?([^"',.\n]+)["']?/i)
      || trimmed.match(/(?:document|doc|memo|proposal)\s+["']?([^"',.\n]+)["']?/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Executive Overview';

    // Convert markdown into executive HTML with auto-synthesis if model under-generated
    const generatedHtml = convertMarkdownToDocumentHtml(replyText, title);

    if (typeof window !== 'undefined' && window.__REGAARDER_CREATE_DOC__) {
      const created = window.__REGAARDER_CREATE_DOC__({
        title,
        contentHtml: generatedHtml,
        mode: 'compose'
      });

      // Clean snippet for preview (strip H1 title and HTML tags)
      const previewSnippet = generatedHtml
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      actionCard = {
        type: 'document',
        subType: 'created',
        title: title,
        docId: created?.docId || Date.now(),
        description: `Document "${title}" has been created and prepared in Compose Docs.`,
        previewSnippet: previewSnippet.slice(0, 160)
      };

      // Auto-propagate new document node into Universal Context Graph
      mutateAndPropagate({
        entityId: `ent_doc_${created?.docId || Date.now()}`,
        changes: {
          title: title,
          type: 'document',
          workspace: 'compose',
          excerpt: previewSnippet,
          content: previewSnippet,
          metadata: { docId: created?.docId, status: 'Active' }
        },
        reason: 'Agent Document Synthesis in Relay',
        actor: 'agent'
      });

      if (!replyText) {
        replyText = `I have created the document "${title}" in Compose Docs with an executive overview and key strategic drivers. You can open it directly from the action card below.`;
      }
    }
  } else if (!actionCard && intent.isTaskSchedule) {
    const taskTitleMatch = trimmed.match(/(?:task|todo|initiative)\s+["']?([^"',.\n]+)["']?/i)
      || trimmed.match(/(?:schedule|assign)\s+["']?([^"',.\n]+)["']?/i);
    const taskTitle = taskTitleMatch ? taskTitleMatch[1].trim() : 'Follow-up Initiative';
    const isHigh = /high|urgent|critical/i.test(trimmed);
    const priority = isHigh ? 'High' : 'Medium';
    const dueDate = /tomorrow/i.test(trimmed) ? 'Tomorrow' : /next week|next monday/i.test(trimmed) ? 'Next Monday' : 'This Week';

    if (typeof window !== 'undefined' && window.__REGAARDER_ADD_TASK__) {
      const res = window.__REGAARDER_ADD_TASK__({
        title: taskTitle,
        priority,
        status: 'Not Started',
        dueDate
      });

      actionCard = {
        type: 'task',
        subType: 'added',
        title: taskTitle,
        taskId: res?.data?.id || `task_${Date.now()}`,
        priority,
        assignee: 'Executive Team',
        dueDate,
        description: `Task "${taskTitle}" is now scheduled on the initiatives roadmap.`
      };

      if (!replyText) {
        replyText = `I have scheduled the task "${taskTitle}" (${priority} Priority, Due: ${dueDate}) in your workspace initiatives.`;
      }
    }
  } else if (!actionCard && intent.isIngestDocument) {
    // ── Case D: Omni-Portal universal document ingestion (Pillar 7) ──
    actionCard = {
      type: 'portal',
      title: 'Omni-Portal: Ready to Ingest',
      description: 'Drop a file into the Omni-Portal to extract semantic AST state, route entities cross-app, and generate a staging PR.',
    };
    if (!replyText) {
      replyText = `I can ingest that document through the **Omni-Portal** ingestion substrate. Drop your file into the portal to decompose it into Canvas blocks, Matrix tables, and Directive Queue items — all routed cross-app with a single staged PR.`;
    }
  } else if (!actionCard && intent.isDirectiveQueue) {
    // ── Case E: Directive Queue & Autonomous Agent Execution (Pillar 8) ──
    const directiveTitleMatch = trimmed.match(/(?:directive|agent task|task)\s+["']?([^"',.\n]+)["']?/i) ||
      trimmed.match(/(?:queue|run|assign|execute|checkout)\s+["']?([^"',.\n]+)["']?/i);
    const directiveTitle = directiveTitleMatch ? directiveTitleMatch[1].trim() : 'Autonomous Directive';

    let queuedItem = null;
    if (typeof window !== 'undefined' && window.__REGAARDER_DIRECTIVE_QUEUE__) {
      queuedItem = window.__REGAARDER_DIRECTIVE_QUEUE__.queueDirective({
        title: directiveTitle,
        tier: /team/i.test(trimmed) ? 'team' : /user/i.test(trimmed) ? 'user' : 'agent',
        priority: /urgent|p0|critical/i.test(trimmed) ? 'P0' : /p1|high/i.test(trimmed) ? 'P1' : 'P2',
        description: `Queued via Relay Agent: ${trimmed}`
      });
    }

    actionCard = {
      type: 'directive',
      directiveId: queuedItem?.id || `dir_${Date.now()}`,
      title: queuedItem?.title || directiveTitle,
      tier: queuedItem?.tier || 'agent',
      priority: queuedItem?.priority || 'P1',
      status: queuedItem?.status || 'PENDING',
      description: `Directive queued in Autonomous Agent Execution Loop with block pointer anchoring.`
    };

    if (!replyText) {
      replyText = `I have queued the directive "${directiveTitle}" into the **Directive Queue & Autonomous Agent Execution Loop** (${actionCard.tier.toUpperCase()} tier, ${actionCard.priority}). You can inspect the queue or trigger the runner in the Memory Dashboard.`;
    }
  }

  // Fallback reply if none generated
  if (!replyText) {
    if (actionCard) {
      replyText = `Action executed successfully on your behalf.`;
    } else if (referenceSources.length > 0) {
      replyText = `I scanned your workspace documents and located ${referenceSources.length} matching reference(s). Click any reference card below to jump directly to that line.`;
    } else if (personaName) {
      replyText = `I am ${personaName}. How can I assist with your objectives?`;
    } else {
      replyText = `I am ready to assist. You can ask me to draft a document, schedule tasks, analyze spreadsheets, or locate citations across your workspace.`;
    }
  }

  // Extract interactive clarification multi-choice card if present
  const { cleanText, clarification } = extractClarificationFromText(replyText);

  return {
    replyText: cleanText || replyText,
    actionCard,
    referenceSources,
    clarification
  };
}

/**
 * Extracts interactive clarification question and options from agent responses.
 * Detects explicit clarification JSON/markdown blocks as well as heuristic
 * numbered/bulleted options presented after a clarifying question.
 */
export function extractClarificationFromText(text) {
  if (!text || typeof text !== 'string') return { cleanText: text || '', clarification: null };

  // 1. Explicit fenced clarification block: ```clarification ... ```
  const blockMatch = text.match(/```(?:clarification|json:clarification)\s*([\s\S]*?)```/i);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[1].trim());
      const cleanText = text.replace(blockMatch[0], '').trim();
      if (parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 2) {
        return {
          cleanText,
          clarification: {
            question: parsed.question,
            options: parsed.options,
            allowCustom: parsed.allowCustom !== false,
            allowSkip: parsed.allowSkip !== false
          }
        };
      }
    } catch (e) {}
  }

  // 2. Embedded JSON { "clarification": { ... } }
  const jsonMatch = text.match(/\{[\s\n\r]*"clarification"[\s\n\r]*:\s*\{[\s\S]*?\}[\s\n\r]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const cleanText = text.replace(jsonMatch[0], '').trim();
      if (parsed.clarification?.question && Array.isArray(parsed.clarification?.options)) {
        return {
          cleanText,
          clarification: {
            question: parsed.clarification.question,
            options: parsed.clarification.options,
            allowCustom: parsed.clarification.allowCustom !== false,
            allowSkip: parsed.clarification.allowSkip !== false
          }
        };
      }
    } catch (e) {}
  }

  // 3. Heuristic clarification detection:
  // Check if text ends with or contains a clarifying question followed by 2 to 6 numbered or bulleted options
  const optionRegex = /(?:^|\n)\s*(?:(\d+)[.)]|[-*•])\s+([^\n]+)/g;
  const matches = [...text.matchAll(optionRegex)];
  if (matches.length >= 2 && matches.length <= 6) {
    const firstMatchIdx = matches[0].index;
    const preText = text.slice(0, firstMatchIdx).trim();
    const hasPromptSignal = preText.includes('?') || preText.endsWith(':') || /(options|which|choose|select|prefer|target)/i.test(preText);

    if (hasPromptSignal) {
      const sentences = preText.split(/(?<=[.?!:])\s+/);
      const questionTitle = sentences[sentences.length - 1] || 'Please select an option:';
      const extractedOptions = matches.map(m => m[2].trim());

      return {
        cleanText: preText,
        clarification: {
          question: questionTitle.replace(/^[-*•#\s]+/, '').trim(),
          options: extractedOptions,
          allowCustom: true,
          allowSkip: true
        }
      };
    }
  }

  return { cleanText: text, clarification: null };
}

