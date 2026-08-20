import { synthesizeStrategicDecision } from './orbKnowledgeGraphService';

/**
 * Live LLM AI Synthesis Service for Regaarder Orb.
 * Serializes real workspace context (Docs, Sheets, Decks, Tasks, Schedule)
 * and streams/queries live AI endpoints with structured JSON schemas.
 */

export async function generateOrbDecisionSynthesis({
  question,
  entities = [],
  edges = [],
  signal
} = {}) {
  const queryText = (question || '').trim();
  if (!queryText) return null;

  // 1. Read configured AI Provider & API Key from localStorage
  let aiConfig = {
    provider: 'gemini',
    geminiApiKey: '',
    claudeApiKey: '',
    geminiModel: 'gemini-1.5-pro',
    claudeModel: 'claude-3-5-sonnet-20241022'
  };

  try {
    const saved = localStorage.getItem('regaarder_ai_config');
    if (saved) {
      aiConfig = { ...aiConfig, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Failed to read regaarder_ai_config:', err);
  }

  // 2. Serialize full real workspace context
  const contextSummary = entities.map((e, idx) => {
    const ws = (e.workspace || e.type || 'app').toUpperCase();
    const metricsStr = (e.metrics && e.metrics.length > 0) ? `\nKey Metrics: ${e.metrics.join(', ')}` : '';
    const formulaStr = (e.metadata?.formulas && e.metadata.formulas.length > 0) 
      ? `\nFormulas: ${e.metadata.formulas.map(f => f.formula).join('; ')}`
      : '';
    return `[${idx + 1}] (${ws}) "${e.title}" by ${e.author || 'User'}\nContent / Excerpt: ${e.content || e.excerpt}${metricsStr}${formulaStr}`;
  }).join('\n\n');

  const edgesSummary = edges.slice(0, 10).map((edge, idx) => {
    return `Link ${idx + 1}: ${edge.label} (Status: ${edge.epistemicStatus || 'verified'})`;
  }).join('\n');

  const systemPrompt = `You are Orb, the Executive Cross-Workspace Intelligence Layer in Regaarder.
Your job is to analyze real workspace artifacts across Compose Documents, Sheets Financial Models, Presentation Decks, and Task Initiatives to synthesize a rigorous strategic decision briefing.

GROUNDING RULES:
1. Ground every claim, number, constraint, and citation in the actual workspace context provided.
2. If citing numbers, formulas, or deliverables, explicitly quote the document or spreadsheet title.
3. Be direct, executive-tier, decisive, and objective. Avoid filler phrases.
4. Output valid, parseable JSON matching the required schema.`;

  const userPrompt = `STRATEGIC INQUIRY: "${queryText}"

INDEXED WORKSPACE ARTIFACTS (${entities.length} items):
${contextSummary || 'No documents indexed in workspace yet.'}

SEMANTIC RELATIONSHIPS & DATA LINKAGES:
${edgesSummary || 'Direct cross-document references.'}

Please synthesize a comprehensive strategic decision briefing in JSON format with the following keys:
{
  "topic": "${queryText}",
  "status": "AI Recommendation • Generated from Live Intelligence",
  "confidenceScore": 0.95,
  "recommendationTitle": "Concise 5-8 word executive title",
  "recommendedCourse": "Direct 1-2 sentence core recommendation",
  "why": "Evidentiary rationale quoting specific workspace artifacts and numbers",
  "criticalConstraint": "Single biggest blocker, packaging bottleneck, or financial constraint",
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

  const isClaude = aiConfig.provider === 'claude' || aiConfig.provider === 'anthropic';
  const endpoint = isClaude ? '/api/claude' : '/api/gemini';
  const apiKey = isClaude ? aiConfig.claudeApiKey : aiConfig.geminiApiKey;
  const model = isClaude ? aiConfig.claudeModel : aiConfig.geminiModel;

  // 3. Attempt live LLM execution via proxy API
  if (apiKey || endpoint) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        if (isClaude) headers['x-anthropic-api-key'] = apiKey;
        else headers['x-gemini-api-key'] = apiKey;
      }

      const response = await fetch(endpoint, {
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

        // Clean markdown backticks if wrapped in ```json ... ```
        rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(rawText);
        if (parsed && parsed.recommendedCourse) {
          return parsed;
        }
      }
    } catch (apiErr) {
      console.warn('Orb Live LLM call encountered error, falling back to deterministic synthesis:', apiErr);
    }
  }

  // 4. Deterministic Fallback Synthesis
  return synthesizeStrategicDecision(queryText, { entities, edges });
}
