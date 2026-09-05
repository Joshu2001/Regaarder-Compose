/**
 * llmProviderService.js
 *
 * Layer 4: Production LLM Provider Abstraction & Dynamic Tool Calling Loop
 *
 * Implements Phase 3 of the Production Execution Engine:
 * Connects frontier models with native tool-calling capabilities across:
 * - Google Gemini (gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash)
 * - OpenAI (gpt-4o, gpt-4o-mini) & DeepSeek (deepseek-chat)
 * - Anthropic Claude (claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022)
 * - Local Ollama (llama3, mistral, gemma3)
 * - Deterministic Mock Provider (for offline execution and automated test suites)
 *
 * Provides a unified multi-turn agent execution loop:
 * User Prompt -> Model reasons -> Model emits Tool Call -> Client executes locally ->
 * Tool result injected into history -> Model synthesizes executive final response.
 */

import { CANONICAL_DOCS_TOOLS } from './docsToolRegistry.js';
import { executeTool } from './docsToolExecutor.js';
import { dispatchWorkspaceMutation } from './workspaceStateBus.js';
import {
  toOpenAITools,
  toGeminiTools,
  toAnthropicTools,
  getUniversalToolSystemPrompt
} from './docsLlmAdapters.js';

export const SUPPORTED_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  CLAUDE: 'claude',
  ANTHROPIC: 'anthropic',
  DEEPSEEK: 'deepseek',
  OLLAMA: 'ollama',
  LMSTUDIO: 'lmstudio',
  CUSTOM: 'custom',
  MOCK: 'mock'
};

/**
 * Retrieve active AI configuration from environment, localStorage, or defaults.
 */
export function getActiveAiConfig(explicitOverrides = {}) {
  let saved = {};
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('regaarder_ai_config');
      if (raw) saved = JSON.parse(raw);
    } catch (_) {}
  }

  // Safe fallback to process.env if running under Node/Electron
  const env = typeof process !== 'undefined' && process.env ? process.env : {};

  return {
    provider: explicitOverrides.provider || saved.provider || env.REGAARDER_AI_PROVIDER || 'gemini',
    activeModel: explicitOverrides.model || saved.activeModel || env.REGAARDER_AI_MODEL || 'gemini-2.0-flash',
    geminiApiKey: explicitOverrides.apiKey || saved.geminiApiKey || env.GEMINI_API_KEY || '',
    openaiApiKey: explicitOverrides.apiKey || saved.openaiApiKey || env.OPENAI_API_KEY || '',
    claudeApiKey: explicitOverrides.apiKey || saved.claudeApiKey || env.ANTHROPIC_API_KEY || '',
    deepseekApiKey: explicitOverrides.apiKey || saved.deepseekApiKey || env.DEEPSEEK_API_KEY || '',
    ollamaEndpoint: explicitOverrides.endpoint || saved.ollamaEndpoint || env.OLLAMA_ENDPOINT || 'http://localhost:11434',
    ollamaModel: explicitOverrides.model || saved.ollamaModel || 'llama3:latest',
    lmstudioEndpoint: explicitOverrides.endpoint || saved.lmstudioEndpoint || 'http://localhost:1234/v1',
    customEndpoint: explicitOverrides.endpoint || saved.customEndpoint || 'http://localhost:8000/v1',
    customApiKey: explicitOverrides.apiKey || saved.customApiKey || '',
    mockBehavior: explicitOverrides.mockBehavior || null,
    ...explicitOverrides
  };
}

/**
 * Format tools for the target provider using canonical adapters.
 */
export function formatToolsForProvider(provider, tools = CANONICAL_DOCS_TOOLS) {
  const norm = (provider || '').toLowerCase();
  if (norm === SUPPORTED_PROVIDERS.GEMINI) {
    return toGeminiTools(tools);
  }
  if (norm === SUPPORTED_PROVIDERS.CLAUDE || norm === SUPPORTED_PROVIDERS.ANTHROPIC) {
    return toAnthropicTools(tools);
  }
  // OpenAI, DeepSeek, Ollama, LMStudio, Custom, Mock
  return toOpenAITools(tools);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROVIDER-SPECIFIC SINGLE-TURN DISPATCHERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Google Gemini Provider Call via v1beta generateContent API
 */
async function callGemini(messages, tools, config, options = {}) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    return { type: 'error', error: 'Missing Gemini API Key' };
  }

  const model = config.activeModel?.startsWith('gemini') ? config.activeModel : 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const contents = conversationMessages.map(m => {
    if (m.role === 'tool') {
      return {
        role: 'user',
        parts: [{
          functionResponse: {
            name: m.name,
            response: { content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }
          }
        }]
      };
    }
    if (m.role === 'assistant' && m.tool_calls) {
      return {
        role: 'model',
        parts: m.tool_calls.map(tc => ({
          functionCall: {
            name: tc.name || tc.function?.name,
            args: tc.arguments || tc.function?.arguments || {}
          }
        }))
      };
    }
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    };
  }).filter(c => c.parts.length > 0);

  const payload = {
    system_instruction: systemMsg ? { parts: [{ text: systemMsg }] } : undefined,
    contents,
    generationConfig: { temperature: 0.15 },
    ...(tools && tools.functionDeclarations?.length > 0 ? { tools: [tools] } : {})
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options.signal
  });

  if (!res.ok) {
    const errText = await res.text();
    return { type: 'error', error: `Gemini API returned ${res.status}: ${errText}` };
  }

  const data = await res.json();
  const candidate = data.candidates?.[0]?.content;
  if (!candidate) return { type: 'text', content: '' };

  const funcParts = (candidate.parts || []).filter(p => p.functionCall);
  if (funcParts.length > 0) {
    return {
      type: 'tool_call',
      toolCalls: funcParts.map((p, i) => ({
        id: `gemini_call_${Date.now()}_${i}`,
        name: p.functionCall.name,
        arguments: p.functionCall.args || {}
      })),
      rawAssistantTurn: candidate.parts
    };
  }

  const textContent = (candidate.parts || []).map(p => p.text || '').join('');
  return { type: 'text', content: textContent };
}

/**
 * OpenAI / DeepSeek / LMStudio / Ollama chat/completions API
 */
async function callOpenAiCompatible(messages, tools, config, options = {}) {
  const normProvider = (config.provider || '').toLowerCase();
  const isDeepSeek = normProvider === SUPPORTED_PROVIDERS.DEEPSEEK;
  const isOllama = normProvider === SUPPORTED_PROVIDERS.OLLAMA;
  const isLMStudio = normProvider === SUPPORTED_PROVIDERS.LMSTUDIO;

  let endpoint = 'https://api.openai.com/v1/chat/completions';
  let apiKey = config.openaiApiKey;
  let model = config.activeModel || 'gpt-4o';

  if (isDeepSeek) {
    endpoint = 'https://api.deepseek.com/v1/chat/completions';
    apiKey = config.deepseekApiKey;
    model = config.deepseekModel || 'deepseek-chat';
  } else if (isOllama) {
    endpoint = `${(config.ollamaEndpoint || 'http://localhost:11434').replace(/\/+$/, '')}/v1/chat/completions`;
    apiKey = 'ollama';
    model = config.ollamaModel || 'llama3:latest';
  } else if (isLMStudio) {
    endpoint = `${(config.lmstudioEndpoint || 'http://localhost:1234/v1').replace(/\/+$/, '')}/chat/completions`;
    apiKey = 'lmstudio';
    model = config.lmstudioModel || 'local-model';
  } else if (normProvider === SUPPORTED_PROVIDERS.CUSTOM) {
    endpoint = `${(config.customEndpoint || 'http://localhost:8000/v1').replace(/\/+$/, '')}/chat/completions`;
    apiKey = config.customApiKey || 'custom';
    model = config.customModel || 'default';
  }

  if (!isOllama && !isLMStudio && !apiKey) {
    return { type: 'error', error: `Missing API Key for ${config.provider}` };
  }

  // Format messages into OpenAI format
  const formattedMessages = messages.map(m => {
    if (m.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: m.tool_call_id || m.id || 'call_default',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
      };
    }
    if (m.role === 'assistant' && m.tool_calls) {
      return {
        role: 'assistant',
        content: m.content || null,
        tool_calls: m.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name || tc.function?.name,
            arguments: typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify(tc.arguments || {})
          }
        }))
      };
    }
    return { role: m.role, content: m.content || '' };
  });

  const payload = {
    model,
    messages: formattedMessages,
    temperature: 0.15,
    ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {})
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
    signal: options.signal
  });

  if (!res.ok) {
    const errText = await res.text();
    return { type: 'error', error: `${config.provider} returned ${res.status}: ${errText}` };
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) return { type: 'text', content: '' };

  const assistantMsg = choice.message;
  if (assistantMsg?.tool_calls?.length > 0) {
    return {
      type: 'tool_call',
      toolCalls: assistantMsg.tool_calls.map(tc => {
        let parsedArgs = {};
        try {
          parsedArgs = typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments)
            : (tc.function.arguments || {});
        } catch (_) {
          parsedArgs = { raw: tc.function.arguments };
        }
        return {
          id: tc.id,
          name: tc.function.name,
          arguments: parsedArgs
        };
      }),
      rawAssistantTurn: assistantMsg
    };
  }

  return { type: 'text', content: assistantMsg?.content || '' };
}

/**
 * Anthropic Claude Provider Call via /v1/messages API
 */
async function callAnthropic(messages, tools, config, options = {}) {
  const apiKey = config.claudeApiKey;
  if (!apiKey) {
    return { type: 'error', error: 'Missing Anthropic Claude API Key' };
  }

  const model = config.activeModel?.includes('claude') ? config.activeModel : 'claude-3-5-sonnet-20241022';
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const claudeMessages = conversationMessages.map(m => {
    if (m.role === 'tool') {
      return {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: m.tool_call_id || m.id,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        }]
      };
    }
    if (m.role === 'assistant' && m.tool_calls) {
      return {
        role: 'assistant',
        content: m.tool_calls.map(tc => ({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: tc.arguments || {}
        }))
      };
    }
    return { role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' };
  });

  const payload = {
    model,
    max_tokens: 4096,
    system: systemMsg || undefined,
    messages: claudeMessages,
    ...(tools && tools.length > 0 ? { tools } : {})
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload),
    signal: options.signal
  });

  if (!res.ok) {
    const errText = await res.text();
    return { type: 'error', error: `Anthropic API returned ${res.status}: ${errText}` };
  }

  const data = await res.json();
  const toolUseBlocks = (data.content || []).filter(b => b.type === 'tool_use');
  if (toolUseBlocks.length > 0) {
    return {
      type: 'tool_call',
      toolCalls: toolUseBlocks.map(b => ({
        id: b.id,
        name: b.name,
        arguments: b.input || {}
      })),
      rawAssistantTurn: data.content
    };
  }

  const textBlock = (data.content || []).find(b => b.type === 'text');
  return { type: 'text', content: textBlock?.text || '' };
}

/**
 * Deterministic Mock Provider for Offline Execution, CI and Automated Tests
 */
async function callMockProvider(messages, _tools, config) {
  const behavior = config.mockBehavior;
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg?.content || '';

  // 1. If mock behavior explicitly specified
  if (behavior) {
    if (behavior.type === 'tool_call') {
      return {
        type: 'tool_call',
        toolCalls: behavior.toolCalls || [
          { id: 'mock_call_1', name: behavior.toolName || 'patch_block', arguments: behavior.args || {} }
        ]
      };
    }
    if (behavior.type === 'text') {
      return { type: 'text', content: behavior.content || 'Mock synthesized response.' };
    }
  }

  // 2. Check if this is a follow-up turn where tools were executed
  const lastToolMsg = [...messages].reverse().find(m => m.role === 'tool');
  if (lastToolMsg) {
    return {
      type: 'text',
      content: `I have executed the requested workspace operations. The document has been staged and the changes are ready for executive review.`
    };
  }

  // 3. Automated intent recognition in mock mode
  if (/create|document|draft|memo|proposal/i.test(userText)) {
    return {
      type: 'tool_call',
      toolCalls: [
        {
          id: `mock_call_${Date.now()}`,
          name: 'create_document',
          arguments: {
            title: 'Executive Strategic Memo',
            contentHtml: `<h2>Executive Overview</h2><p>Strategic synthesis generated for: "${userText.slice(0, 50)}".</p><h3>Strategic Drivers</h3><ol><li>Market expansion</li><li>Capital efficiency</li></ol>`
          }
        }
      ]
    };
  }

  if (/schedule|meeting|sync|board/i.test(userText)) {
    return {
      type: 'tool_call',
      toolCalls: [
        {
          id: `mock_call_${Date.now()}`,
          name: 'commit_scheduled_event',
          arguments: {
            event: {
              title: 'Executive Sync',
              startTime: new Date().toISOString(),
              durationMin: 45
            }
          }
        }
      ]
    };
  }

  return {
    type: 'text',
    content: `Regaarder Agent analyzed your prompt: "${userText}". All systems operational.`
  };
}

/**
 * Execute a single AI turn against the configured provider.
 */
export async function executeAiTurn(messages = [], tools = [], config = {}, options = {}) {
  const aiConfig = getActiveAiConfig(config);
  const provider = (aiConfig.provider || SUPPORTED_PROVIDERS.MOCK).toLowerCase();
  const formattedTools = formatToolsForProvider(provider, tools);

  switch (provider) {
    case SUPPORTED_PROVIDERS.GEMINI:
      return callGemini(messages, formattedTools, aiConfig, options);
    case SUPPORTED_PROVIDERS.CLAUDE:
    case SUPPORTED_PROVIDERS.ANTHROPIC:
      return callAnthropic(messages, formattedTools, aiConfig, options);
    case SUPPORTED_PROVIDERS.OPENAI:
    case SUPPORTED_PROVIDERS.DEEPSEEK:
    case SUPPORTED_PROVIDERS.OLLAMA:
    case SUPPORTED_PROVIDERS.LMSTUDIO:
    case SUPPORTED_PROVIDERS.CUSTOM:
      return callOpenAiCompatible(messages, formattedTools, aiConfig, options);
    case SUPPORTED_PROVIDERS.MOCK:
    default:
      return callMockProvider(messages, formattedTools, aiConfig, options);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. UNIFIED MULTI-TURN AUTONOMOUS AGENT EXECUTION LOOP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs a complete multi-turn autonomous tool execution loop.
 *
 * Loop Lifecycle:
 * Turn 0: User submits prompt + system instructions + context.
 * Turn 1..maxTurns:
 *   - Call active LLM provider.
 *   - If model returns plain text, loop concludes with final answer.
 *   - If model returns tool calls:
 *     - Execute each tool via docsToolExecutor (or custom executeToolFn).
 *     - Disseminate mutation to workspaceStateBus.
 *     - Append tool response to conversation messages.
 *     - Query model again with updated history until completion or maxTurns.
 *
 * @param {object} params
 * @param {string} params.prompt           - User instruction / query
 * @param {string} params.systemPrompt     - Optional system instruction
 * @param {string} params.context          - Token-dense graph / memory context
 * @param {Array}  params.tools            - Available tool definitions (defaults to canonical)
 * @param {number} params.maxTurns         - Safety guardrail (default: 4)
 * @param {object} params.aiConfig         - Provider configuration
 * @param {Function} params.executeToolFn  - Custom executor override (default: executeTool)
 * @returns {Promise<object>} { success, replyText, executedTools, conversationHistory, turns }
 */
export async function runAgentExecutionLoop({
  prompt = '',
  systemPrompt = '',
  context = '',
  tools = CANONICAL_DOCS_TOOLS,
  maxTurns = 4,
  aiConfig = {},
  executeToolFn = executeTool,
  options = {}
} = {}) {
  const config = getActiveAiConfig(aiConfig);
  const activeSystemPrompt = systemPrompt || getUniversalToolSystemPrompt(tools);
  const combinedSystemText = context ? `${activeSystemPrompt}\n\n${context}` : activeSystemPrompt;

  const conversationHistory = [
    { role: 'system', content: combinedSystemText },
    { role: 'user', content: prompt }
  ];

  const executedTools = [];
  let replyText = '';
  let turnsCount = 0;

  for (let turn = 0; turn < maxTurns; turn++) {
    turnsCount++;
    const turnResult = await executeAiTurn(conversationHistory, tools, config, options);

    if (!turnResult || turnResult.type === 'error') {
      const errMsg = turnResult?.error || 'Unknown AI provider error';
      console.warn(`[AgentLoop] Turn ${turn + 1} provider error: ${errMsg}`);
      
      // If we already executed tools in prior turns, synthesize a summary
      if (executedTools.length > 0) {
        replyText = `Successfully executed ${executedTools.length} workspace action(s).`;
        break;
      }
      return {
        success: false,
        replyText: `Unable to complete AI synthesis: ${errMsg}`,
        error: errMsg,
        executedTools,
        conversationHistory,
        turnsCount
      };
    }

    // A. Model returned text (Terminal state)
    if (turnResult.type === 'text') {
      replyText = turnResult.content || '';
      conversationHistory.push({ role: 'assistant', content: replyText });
      break;
    }

    // B. Model requested tool call(s)
    if (turnResult.type === 'tool_call' && Array.isArray(turnResult.toolCalls)) {
      conversationHistory.push({
        role: 'assistant',
        content: null,
        tool_calls: turnResult.toolCalls
      });

      for (const call of turnResult.toolCalls) {
        console.log(`[AgentLoop] Executing tool '${call.name}' in turn ${turn + 1}...`);
        
        let toolExecution = null;
        try {
          toolExecution = await executeToolFn(call.name, call.arguments || {}, {}, { stage: true, ...options });
        } catch (execErr) {
          toolExecution = {
            success: false,
            error: { code: 'EXECUTION_EXCEPTION', details: execErr.message }
          };
        }

        executedTools.push({
          toolName: call.name,
          arguments: call.arguments,
          result: toolExecution
        });

        // Disseminate to Workspace State Bus so live UI components update immediately
        try {
          dispatchWorkspaceMutation(toolExecution.targetApp || 'compose', {
            action: call.name,
            description: toolExecution.message || `AI Agent executed ${call.name}`,
            isStaged: Boolean(toolExecution.isStaged),
            branchId: toolExecution.branchId || null,
            prNumber: toolExecution.prNumber || null,
            origin: 'relay_agent_loop',
            data: call.arguments
          });
        } catch (_) {}

        // Feed tool result back into history
        conversationHistory.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.name,
          content: JSON.stringify({
            success: toolExecution.success !== false,
            isStaged: toolExecution.isStaged,
            prNumber: toolExecution.prNumber,
            branchId: toolExecution.branchId,
            message: toolExecution.message || `Executed ${call.name}`,
            data: toolExecution.data || toolExecution
          })
        });
      }
    }
  }

  return {
    success: true,
    replyText: replyText || `Executed ${executedTools.length} action(s).`,
    executedTools,
    conversationHistory,
    turnsCount
  };
}
