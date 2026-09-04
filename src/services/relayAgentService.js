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
  const isDocCreation = !isTranslation && !isMemoryInstruction && !isScheduleMeeting && /(create|make|start|draft|write|generate)\s+(a\s+)?(new\s+)?(document|doc|proposal|brief|memo|notes|report)/i.test(text);
  const isTaskSchedule = !isTranslation && !isMemoryInstruction && !isScheduleMeeting && (/(add|create|schedule|set|assign)\s+(a\s+)?(new\s+)?(task|todo|initiative|action item|deadline|reminder)/i.test(text) || /\bdue\s+(today|tomorrow|next|on|by)\b/i.test(text));
  const isSheetUpdate = !isTranslation && !isMemoryInstruction && (/(update|set|change|write|fill)\s+(the\s+)?(sheet|cell|row|column|cells)\s+([a-z]\d+|\d+)/i.test(text) || /(update|modify)\s+(spreadsheet|sheets)/i.test(text));
  const isCitationQuery = !isTranslation && !isMemoryInstruction && (/(where is|where does it mention|find in docs|search docs for|cite where|what doc discusses|reference for|show me where)/i.test(text) || /\b(citation|citations|source reference)\b/i.test(text));

  return {
    isAction: isDocCreation || isTaskSchedule || isScheduleMeeting || isSheetUpdate || isCitationQuery || isMemoryInstruction,
    isDocCreation,
    isTaskSchedule,
    isScheduleMeeting,
    isSheetUpdate,
    isCitationQuery,
    isTranslation,
    isMemoryInstruction
  };
}

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
export async function processRelayAgentMessage({
  userPrompt,
  onCallAi,
  customModel,
  customProvider,
  existingThread = []
}) {
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

  // Dynamic system prompt selection to prevent small model hallucination
  let activeSystemPrompt = 'You are an executive intelligent assistant in Regaarder Relay. Answer user queries directly, concisely, and naturally. Never create a document or output outlines unless explicitly asked.';

  if (intent.isTranslation) {
    activeSystemPrompt = 'You are an expert multilingual translator in Regaarder Relay. Provide an accurate, direct translation of the requested sentence or text into the target language. Do not create documents, do not add filler commentary, and do not invent outlines.';
  } else if (intent.isDocCreation) {
    const memoryContext = getAgentContext({ maxEntities: 6, maxRules: 4, maxDecisions: 2 });
    activeSystemPrompt = `${RELAY_AGENT_SYSTEM_PROMPT}\n\n${memoryContext}`;
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
  }

  // Fallback reply if none generated
  if (!replyText) {
    if (actionCard) {
      replyText = `Action executed successfully on your behalf.`;
    } else if (referenceSources.length > 0) {
      replyText = `I scanned your workspace documents and located ${referenceSources.length} matching reference(s). Click any reference card below to jump directly to that line.`;
    } else {
      replyText = `I am ready to assist. You can ask me to draft a document, schedule tasks, analyze spreadsheets, or locate citations across your workspace.`;
    }
  }

  return {
    replyText,
    actionCard,
    referenceSources
  };
}
