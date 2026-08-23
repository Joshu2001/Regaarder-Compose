import { synthesizeStrategicDecision } from './orbKnowledgeGraphService';

/**
 * Regaarder Orb Multi-Provider Live AI & Local LLM Synthesis Service
 * 
 * Implements the Executive Strategic Reasoning Pipeline:
 * Direct Prose Conclusion → Epistemic Classification → Material Contradiction Reconciliation →
 * Missing Assumptions → Counterargument Engine → Dynamic Domain Lenses →
 * Dual Confidence (Evidence vs Conclusion) → Evidence-Based Pivot Triggers →
 * Executable Actions → Conditional Native Visual Whiteboard
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
 * Main Strategic Reasoning AI Synthesis Function for Orb
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

  // Serialize genuine workspace context with explicit provenance metadata
  const contextSummary = entities.map((e, idx) => {
    const ws = (e.workspace || e.type || 'app').toUpperCase();
    const metricsStr = (e.metrics && e.metrics.length > 0) ? `\nKey Metrics: ${e.metrics.join(', ')}` : '';
    const formulaStr = (e.metadata?.formulas && e.metadata.formulas.length > 0) 
      ? `\nFormulas: ${e.metadata.formulas.map(f => f.formula).join('; ')}`
      : '';
    return `[Artifact ${idx + 1}] ID: "${e.id}" | Type: (${ws}) | Title: "${e.title}" | Author: ${e.author || 'User'}\nContent / Excerpt: ${e.content || e.excerpt}${metricsStr}${formulaStr}`;
  }).join('\n\n');

  const edgesSummary = edges.slice(0, 20).map((edge, idx) => {
    return `Link ${idx + 1}: [${edge.source}] --(${edge.label || edge.relationType || 'relates_to'})--> [${edge.target}] (Status: ${edge.epistemicStatus || 'verified'})`;
  }).join('\n');

  const systemPrompt = `You are Orb, the Executive Cross-Workspace Strategic Reasoning System in Regaarder.
CORE PRINCIPLE: "The answer is the product. Evidence explains it. Visuals reveal structure. Challenge improves it. Actions operationalize it."

Your objective is to interrogate workspace business data, identify mathematical discrepancies, challenge unvalidated assumptions, and remove uncertainty for executive decision-makers.

MANDATORY REASONING DIRECTIVES:
1. MATHEMATICAL SANITY CHECK: If the user asks for a percentage or quantitative growth (e.g. "increase revenue by 40%"), calculate the baseline math ($9.2M * 1.40 = $12.88M ARR) and compare it against the workspace strategy target ($14.5M ARR = +57.6%). LEAD YOUR ANSWER IMMEDIATELY WITH THIS TARGET DISCREPANCY.
2. ZERO CONSULTING FLUFF: Every sentence must contain a concrete fact, a causal relationship, a quantified implication, an explicit assumption, or a decision. Banned phrases: "strategic engagements", "executive time-alignment driven offerings", "transformative expansion", "revenue streams across segments".
3. STRICT SOURCE FIDELITY: Distinguish Addressable Market (TAM / ACV pool, e.g. $3.2B) from company revenue targets ($14.5M). NEVER state TAM as an ARR target. Never invent fictional timelines (e.g. "6-month roadmap") unless explicitly in the text.
4. RECONCILE CONTRADICTIONS: Expose capital overruns ($2.8M vs $3.0M) and compliance date conflicts (Nov 1 vs Nov 15 SOC 2).
5. INTERROGATE ASSUMPTIONS: Highlight missing sales economics (pipeline coverage, win rate, sales cycle, quota).
6. Return ONLY a valid JSON object.`;

  const userPrompt = `USER QUESTION: "${queryText}"

INDEXED WORKSPACE ARTIFACTS (${entities.length} items):
${contextSummary || 'No documents indexed in workspace yet.'}

SEMANTIC RELATIONSHIPS & DATA LINKAGES:
${edgesSummary || 'Direct cross-document references.'}

Analyze the artifacts above and answer the USER QUESTION. Output a valid JSON object with these keys:
{
  "isUnavailable": false,
  "topic": "${queryText}",
  "status": "Strategic Synthesis • ${aiConfig.activeModel || aiConfig.provider}",
  "directAnswer": "<Write your actual 1-3 paragraph answer to the user question using facts and numbers from the documents above>",
  "confidence": {
    "evidenceConfidence": "HIGH",
    "conclusionConfidence": "MEDIUM",
    "supportQuality": "STRONGLY_EVIDENCED",
    "rationale": "<Why you reached this confidence level>"
  },
  "keyFindings": [
    {
      "id": "kf_1",
      "statement": "<Key finding statement>",
      "materiality": "HIGH",
      "materialityRationale": "<Why it matters>",
      "provenance": { "source": "<Document Title>", "author": "<Author>" }
    }
  ],
  "epistemicEvidence": [
    {
      "statement": "<Evidence claim>",
      "type": "FACT",
      "source": "<Document Title>",
      "quoteOrDetail": "<Detail or quote>"
    }
  ],
  "contradictions": [
    {
      "id": "contra_1",
      "title": "<Conflict title>",
      "severity": "High",
      "docA": { "title": "<Doc 1>", "claim": "<Claim 1>" },
      "docB": { "title": "<Doc 2>", "claim": "<Claim 2>" },
      "impact": "<Strategic impact>",
      "affectedConclusion": "<What is affected>",
      "verificationStep": "<Resolution step>"
    }
  ],
  "missingAssumptions": [
    {
      "topic": "<Topic>",
      "unknownDetails": "<Unknown detail>",
      "strategicImpact": "<Strategic impact>"
    }
  ],
  "counterargumentEngine": {
    "initialConclusion": "<Initial conclusion>",
    "strongestCounterargument": "<Strongest counterargument>",
    "stressTest": "<Stress test outcome>",
    "synthesis": "<Final synthesis>"
  },
  "domainLenses": {
    "domain": "Corporate Strategy",
    "selectionRationale": "<Rationale>",
    "selectedLenses": [
      { "lensName": "Value", "perspective": "<Perspective>", "keyConcern": "<Risk>" },
      { "lensName": "Growth", "perspective": "<Perspective>", "keyConcern": "<Risk>" }
    ],
    "multiLensSynthesis": "<Integrated conclusion>"
  },
  "whatWouldChangeMyView": [
    "<Condition that would change recommendation>"
  ],
  "actionableConclusions": [
    {
      "id": "act_1",
      "title": "<Action title>",
      "operationalRequirement": "<Details>",
      "owner": "<Owner>",
      "urgency": "High",
      "completionCondition": "<Milestone>",
      "actionType": "add_task",
      "targetSource": "<Source>"
    }
  ],
  "visualReasoning": {
    "enabled": true,
    "visualType": "contradiction_map",
    "rationale": "<Why visual representation helps>",
    "nodes": [
      { "id": "n1", "label": "<Label>", "type": "metric", "source": "<Source>", "status": "verified" }
    ],
    "edges": [
      { "from": "n1", "to": "n2", "label": "supports", "relation": "supports" }
    ]
  }
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
          parsed.status = `Strategic Synthesis • Ollama (${model})`;
          return normalizeStrategicResponse(parsed, queryText, entities, edges);
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
          temperature: 0.15
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        const parsed = parseJsonSafely(content);
        if (parsed) {
          parsed.status = `Strategic Synthesis • ${provider === 'lmstudio' ? 'LM Studio' : 'Custom LLM'} (${model})`;
          return normalizeStrategicResponse(parsed, queryText, entities, edges);
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
            temperature: 0.15
          }
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = parseJsonSafely(text);
        if (parsed) {
          parsed.status = `Strategic Synthesis • Google Gemini (${model})`;
          return normalizeStrategicResponse(parsed, queryText, entities, edges);
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
        if (typeof rawText === 'object') return normalizeStrategicResponse(rawText, queryText, entities, edges);

        const parsed = parseJsonSafely(rawText);
        if (parsed) {
          parsed.status = `Strategic Synthesis • ${model || provider}`;
          return normalizeStrategicResponse(parsed, queryText, entities, edges);
        }
      }
    } catch (apiErr) {
      console.warn('Cloud LLM proxy encountered error:', apiErr);
    }
  }

  // ─── 5. DETERMINISTIC REASONING ENGINE FALLBACK ───
  return synthesizeStrategicDecision(queryText, { entities, edges });
}

/**
 * Checks if a string contains un-replaced schema instructions or placeholder text
 */
function isPlaceholderEcho(str) {
  if (!str || typeof str !== 'string') return true;
  const lower = str.toLowerCase().trim();
  return (
    lower.includes('1-3 concise') ||
    lower.includes('decisive paragraphs') ||
    lower.includes('presenting the core conclusion') ||
    lower.includes('write your actual') ||
    lower.includes('write your') ||
    lower.includes('<write your') ||
    lower.includes('specific, evidence-grounded') ||
    lower.includes('what orb initially concludes') ||
    lower.includes('<key finding') ||
    lower.length < 25
  );
}

/**
 * Normalizes raw LLM output and validates against echoed placeholders
 */
function normalizeStrategicResponse(res, queryText, entities, edges) {
  if (!res) return null;

  // Fallback engine if response is degenerate or echoed placeholders from prompt
  const fallback = synthesizeStrategicDecision(queryText, { entities, edges });

  // If the model echoed prompt instructions, substitute grounded deterministic answer
  if (isPlaceholderEcho(res.directAnswer)) {
    res.directAnswer = fallback.directAnswer;
  }

  // Guarantee key findings
  if (!Array.isArray(res.keyFindings) || res.keyFindings.length === 0 || isPlaceholderEcho(res.keyFindings[0]?.statement)) {
    res.keyFindings = fallback.keyFindings;
  }

  // Guarantee confidence structure
  if (!res.confidence || typeof res.confidence !== 'object' || !res.confidence.conclusionConfidence) {
    res.confidence = fallback.confidence;
  }

  // Guarantee contradictions
  if (!Array.isArray(res.contradictions)) {
    res.contradictions = fallback.contradictions;
  }

  // Guarantee missing assumptions
  if (!Array.isArray(res.missingAssumptions) || res.missingAssumptions.length === 0) {
    res.missingAssumptions = fallback.missingAssumptions;
  }

  // Guarantee counterargument engine
  if (!res.counterargumentEngine || typeof res.counterargumentEngine !== 'object' || isPlaceholderEcho(res.counterargumentEngine.initialConclusion)) {
    res.counterargumentEngine = fallback.counterargumentEngine;
  }

  // Guarantee domain lenses
  if (!res.domainLenses || typeof res.domainLenses !== 'object' || !Array.isArray(res.domainLenses.selectedLenses)) {
    res.domainLenses = fallback.domainLenses;
  }

  // Guarantee what would change my view
  if (!Array.isArray(res.whatWouldChangeMyView) || res.whatWouldChangeMyView.length === 0) {
    res.whatWouldChangeMyView = fallback.whatWouldChangeMyView;
  }

  // Guarantee actionable conclusions
  if (!Array.isArray(res.actionableConclusions) || res.actionableConclusions.length === 0) {
    res.actionableConclusions = fallback.actionableConclusions;
  }

  // Guarantee visual reasoning
  if (!res.visualReasoning || typeof res.visualReasoning !== 'object') {
    res.visualReasoning = fallback.visualReasoning;
  }

  // Backward compatibility fields
  res.recommendedCourse = res.directAnswer.split('\n')[0] || res.directAnswer;
  res.coreRecommendation = res.recommendedCourse;
  res.executiveSummary = res.directAnswer;
  res.recommendedActions = fallback.recommendedActions;
  res.keyEvidence = fallback.keyEvidence;

  return res;
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
