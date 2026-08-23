import { synthesizeStrategicDecision } from './orbKnowledgeGraphService';

/**
 * Regaarder Orb Multi-Provider Live AI & Local LLM Synthesis Service
 * 
 * Supports:
 * - Local LLMs: Ollama (localhost:11434), LM Studio (localhost:1234), LocalAI, and Custom OpenAI Endpoints
 * - Cloud LLMs: Google Gemini (1.5 Pro / Flash), Anthropic Claude (3.5 Sonnet / Haiku), OpenAI (GPT-4o), DeepSeek (V3/R1)
 * - Auto-discovery for locally running inference servers
 * - Structured JSON schema enforcement with live workspace serialization
 */

export const DEFAULT_AI_CONFIG = {
  provider: 'gemini', // 'gemini' | 'claude' | 'openai' | 'deepseek' | 'ollama' | 'lmstudio' | 'custom'
  activeModel: 'gemini-1.5-pro',
  geminiApiKey: '',
  claudeApiKey: '',
  openaiApiKey: '',
  deepseekApiKey: '',
  geminiModel: 'gemini-1.5-pro',
  claudeModel: 'claude-3-5-sonnet-20241022',
  openaiModel: 'gpt-4o',
  deepseekModel: 'deepseek-chat',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3:latest',
  lmstudioEndpoint: 'http://localhost:1234/v1',
  lmstudioModel: 'local-model',
  customEndpoint: 'http://localhost:8000/v1',
  customModel: 'default',
  customApiKey: ''
};

export const CLOUD_AI_MODELS = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', providerName: 'Google AI', tier: 'High Reasoning', contextWindow: '2M' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', providerName: 'Google AI', tier: 'Fast & Low Latency', contextWindow: '1M' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', providerName: 'Google AI', tier: 'Next-Gen Speed', contextWindow: '1M' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'claude', providerName: 'Anthropic', tier: 'Elite Synthesis', contextWindow: '200k' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', providerName: 'Anthropic', tier: 'Fast & Efficient', contextWindow: '200k' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', providerName: 'OpenAI', tier: 'Omni Reasoning', contextWindow: '128k' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', providerName: 'OpenAI', tier: 'Fast & Lightweight', contextWindow: '128k' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'deepseek', providerName: 'DeepSeek', tier: 'High Efficiency', contextWindow: '64k' },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', providerName: 'DeepSeek', tier: 'Deep Chain-of-Thought', contextWindow: '64k' }
];

/**
 * Load persisted AI Configuration from localStorage
 */
export function getSavedAiConfig() {
  try {
    const raw = localStorage.getItem('regaarder_ai_config');
    if (raw) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to parse regaarder_ai_config from localStorage:', err);
  }
  return { ...DEFAULT_AI_CONFIG };
}

/**
 * Save AI Configuration to localStorage
 */
export function saveAiConfig(newConfig) {
  try {
    const current = getSavedAiConfig();
    const updated = { ...current, ...newConfig };
    localStorage.setItem('regaarder_ai_config', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save regaarder_ai_config:', err);
    return newConfig;
  }
}

/**
 * Autonomous background probe to detect running local LLM servers (Ollama, LM Studio, LocalAI)
 */
export async function detectLocalLLMServers({ timeoutMs = 1500 } = {}) {
  const discovered = [];
  const probeFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      return null;
    }
  };

  // 1. Probe Ollama at default localhost:11434
  try {
    const config = getSavedAiConfig();
    const ollamaUrl = (config.ollamaEndpoint || 'http://localhost:11434').replace(/\/+$/, '');
    const res = await probeFetch(`${ollamaUrl}/api/tags`);
    if (res && res.ok) {
      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models : [];
      discovered.push({
        provider: 'ollama',
        name: 'Ollama (Local)',
        endpoint: ollamaUrl,
        isOnline: true,
        models: models.map(m => ({
          id: m.name,
          name: `${m.name} (Local Ollama)`,
          size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : null,
          modifiedAt: m.modified_at
        }))
      });
    } else {
      discovered.push({
        provider: 'ollama',
        name: 'Ollama (Local)',
        endpoint: ollamaUrl,
        isOnline: false,
        models: []
      });
    }
  } catch (e) {
    discovered.push({ provider: 'ollama', name: 'Ollama (Local)', isOnline: false, models: [] });
  }

  // 2. Probe LM Studio / LocalAI at localhost:1234/v1
  try {
    const config = getSavedAiConfig();
    const lmUrl = (config.lmstudioEndpoint || 'http://localhost:1234/v1').replace(/\/+$/, '');
    const res = await probeFetch(`${lmUrl}/models`);
    if (res && res.ok) {
      const data = await res.json();
      const models = Array.isArray(data.data) ? data.data : [];
      discovered.push({
        provider: 'lmstudio',
        name: 'LM Studio (Local)',
        endpoint: lmUrl,
        isOnline: true,
        models: models.map(m => ({
          id: m.id,
          name: `${m.id} (LM Studio)`
        }))
      });
    } else {
      discovered.push({
        provider: 'lmstudio',
        name: 'LM Studio (Local)',
        endpoint: lmUrl,
        isOnline: false,
        models: []
      });
    }
  } catch (e) {
    discovered.push({ provider: 'lmstudio', name: 'LM Studio (Local)', isOnline: false, models: [] });
  }

  return discovered;
}

/**
 * Main Live Multi-Provider AI Synthesis Function for Orb
 */
export async function generateOrbDecisionSynthesis({
  question,
  entities = [],
  edges = [],
  signal,
  customConfig = null
} = {}) {
  const queryText = (question || '').trim();
  if (!queryText) return null;

  const aiConfig = customConfig || getSavedAiConfig();

  // If no genuine workspace entities exist, return deterministic unavailable state immediately
  if (!entities || entities.length === 0) {
    return synthesizeStrategicDecision(queryText, { entities: [], edges: [] });
  }

  // Serialize genuine workspace context
  const contextSummary = entities.map((e, idx) => {
    const ws = (e.workspace || e.type || 'app').toUpperCase();
    const metricsStr = (e.metrics && e.metrics.length > 0) ? `\nKey Metrics: ${e.metrics.join(', ')}` : '';
    const formulaStr = (e.metadata?.formulas && e.metadata.formulas.length > 0) 
      ? `\nFormulas: ${e.metadata.formulas.map(f => f.formula).join('; ')}`
      : '';
    return `[${idx + 1}] (${ws}) "${e.title}" by ${e.author || 'User'}\nContent / Excerpt: ${e.content || e.excerpt}${metricsStr}${formulaStr}`;
  }).join('\n\n');

  const edgesSummary = edges.slice(0, 15).map((edge, idx) => {
    return `Link ${idx + 1}: ${edge.label} (Status: ${edge.epistemicStatus || 'verified'})`;
  }).join('\n');

  const systemPrompt = `You are Orb, the Executive Cross-Workspace Intelligence Layer in Regaarder.
Your job is to analyze real workspace artifacts across Compose Documents, Sheets Financial Models, Presentation Decks, and Task Initiatives to synthesize a rigorous strategic decision briefing.

STRICT GROUNDING DIRECTIVES:
1. Ground every claim, number, constraint, and citation strictly in the actual workspace context provided.
2. If the user asks for financial data (e.g. losses, dollar metrics, EBITDA) and no such data exists in the context, explicitly set "isUnavailable": true with a clear explanation of what spreadsheet or memo needs to be created. Do NOT hallucinate numbers or mock companies.
3. If citing numbers, formulas, or deliverables, explicitly quote the document or spreadsheet title.
4. Be direct, executive-tier, decisive, and objective.
5. Return ONLY a valid, parseable JSON object matching the schema below. No conversational markdown before or after.`;

  const userPrompt = `STRATEGIC INQUIRY: "${queryText}"

INDEXED WORKSPACE ARTIFACTS (${entities.length} items):
${contextSummary || 'No documents indexed in workspace yet.'}

SEMANTIC RELATIONSHIPS & DATA LINKAGES:
${edgesSummary || 'Direct cross-document references.'}

Please synthesize a comprehensive strategic decision briefing in JSON format with the following keys:
{
  "isUnavailable": false,
  "topic": "${queryText}",
  "status": "AI Recommendation • Generated via ${aiConfig.activeModel || aiConfig.provider}",
  "confidenceScore": 0.95,
  "recommendationTitle": "Concise 5-8 word executive title",
  "recommendedCourse": "Direct 1-2 sentence core recommendation",
  "why": "Evidentiary rationale quoting specific workspace artifacts and numbers",
  "criticalConstraint": "Single biggest blocker, bottleneck, or constraint",
  "requiredCondition": "Pre-execution requirement or validation milestone",
  "coreRecommendation": "Full actionable recommendation summary",
  "executiveSummary": "Concise 3-4 sentence briefing synthesizing findings across Docs, Sheets, Decks, and Tasks",
  "evidenceToChangeRecommendation": [
    {
      "trigger": "Condition that would invalidate this recommendation",
      "currentAssumption": "Active baseline assumption from the workspace",
      "counterEvidence": "Variance threshold or delay trigger",
      "contingentAction": "Action to take if the trigger occurs"
    }
  ],
  "keyEvidence": [
    {
      "source": "Document or Sheet Name (Author)",
      "type": "document" | "sheet" | "slide" | "meeting" | "task",
      "detail": "Explicit quote, cell coordinate, or verified metric"
    }
  ],
  "contradictions": [
    {
      "id": "contra_1",
      "severity": "High" | "Medium" | "Low",
      "title": "Conflict or variance title",
      "description": "Mismatch between sheet numbers, deck projections, or meeting notes",
      "resolution": "Specific resolution action"
    }
  ],
  "dependencies": [
    {
      "item": "Prerequisite deliverable or approval",
      "status": "In Progress" | "Pending Sign-off" | "Blocked",
      "owner": "Assignee name",
      "criticality": "Criticality description"
    }
  ],
  "emergingTrends": ["Trend 1 observed across documents", "Trend 2"],
  "missingInformation": ["Missing benchmark or validation needed"],
  "recommendedActions": [
    {
      "id": "rec_1",
      "title": "Actionable task to execute",
      "assignee": "Assignee",
      "workspace": "tasks" | "compose" | "sheets" | "room",
      "priority": "Urgent" | "High" | "Medium"
    }
  ]
}`;

  const provider = aiConfig.provider || 'gemini';

  // ─── 1. LOCAL OLLAMA EXECUTION ───
  if (provider === 'ollama') {
    try {
      const endpoint = (aiConfig.ollamaEndpoint || 'http://localhost:11434').replace(/\/+$/, '');
      const model = aiConfig.ollamaModel || 'llama3:latest';
      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          format: 'json',
          stream: false
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = parseJsonSafely(data.response);
        if (parsed) {
          parsed.status = `AI Recommendation • Generated via Ollama (${model})`;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Ollama Local LLM query failed, falling back to deterministic synthesis:', err);
    }
  }

  // ─── 2. LOCAL LM STUDIO / OPENAI-COMPATIBLE EXECUTION ───
  if (provider === 'lmstudio' || provider === 'custom') {
    try {
      const endpoint = (provider === 'lmstudio' 
        ? (aiConfig.lmstudioEndpoint || 'http://localhost:1234/v1')
        : (aiConfig.customEndpoint || 'http://localhost:8000/v1')
      ).replace(/\/+$/, '');
      const model = provider === 'lmstudio' ? (aiConfig.lmstudioModel || 'local-model') : (aiConfig.customModel || 'default');
      const apiKey = provider === 'custom' ? aiConfig.customApiKey : 'lm-studio';

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        const parsed = parseJsonSafely(content);
        if (parsed) {
          parsed.status = `AI Recommendation • Generated via ${provider === 'lmstudio' ? 'LM Studio' : 'Custom LLM'} (${model})`;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Local OpenAI-compatible LLM query failed:', err);
    }
  }

  // ─── 3. CLOUD GOOGLE GEMINI DIRECT API ───
  if (provider === 'gemini' && aiConfig.geminiApiKey) {
    try {
      const model = aiConfig.geminiModel || 'gemini-1.5-pro';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2
          }
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = parseJsonSafely(text);
        if (parsed) {
          parsed.status = `AI Recommendation • Generated via Google Gemini (${model})`;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Direct Gemini API call failed:', err);
    }
  }

  // ─── 4. CLOUD ANTHROPIC CLAUDE / OPENAI / PROXY EXECUTION ───
  const isClaude = provider === 'claude' || provider === 'anthropic';
  const isOpenAi = provider === 'openai';
  const isDeepSeek = provider === 'deepseek';

  const proxyEndpoint = isClaude ? '/api/claude' : (isOpenAi ? '/api/openai' : '/api/gemini');
  const apiKey = isClaude ? aiConfig.claudeApiKey : (isOpenAi ? aiConfig.openaiApiKey : (isDeepSeek ? aiConfig.deepseekApiKey : aiConfig.geminiApiKey));
  const model = isClaude ? aiConfig.claudeModel : (isOpenAi ? aiConfig.openaiModel : (isDeepSeek ? aiConfig.deepseekModel : aiConfig.geminiModel));

  if (apiKey || proxyEndpoint) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        if (isClaude) headers['x-anthropic-api-key'] = apiKey;
        else if (isOpenAi || isDeepSeek) headers['Authorization'] = `Bearer ${apiKey}`;
        else headers['x-gemini-api-key'] = apiKey;
      }

      const response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userPrompt,
          systemPrompt,
          model: model || undefined,
          apiKey: apiKey || undefined,
          schema: true
        }),
        signal
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.text || data.response || data.content || '';
        if (typeof rawText === 'object') return rawText;

        const parsed = parseJsonSafely(rawText);
        if (parsed) {
          parsed.status = `AI Recommendation • Generated via ${model || provider}`;
          return parsed;
        }
      }
    } catch (apiErr) {
      console.warn('Cloud LLM proxy encountered error:', apiErr);
    }
  }

  // ─── 5. DETERMINISTIC FALLBACK SYNTHESIS ───
  return synthesizeStrategicDecision(queryText, { entities, edges });
}

/**
 * Utility to extract clean JSON from model output
 */
function parseJsonSafely(rawText) {
  if (!rawText) return null;
  if (typeof rawText === 'object') return rawText;
  try {
    const cleaned = String(rawText)
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt greedy substring match for outer { ... }
    const match = String(rawText).match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
    return null;
  }
}
