/**
 * parseAgentResponse.js
 *
 * Safely parses structured JSON responses from each AI agent.
 * Returns null / [] on parse failure rather than throwing — the UI
 * always handles nulls gracefully.
 */

// Strip markdown fences and find the JSON object/array within raw text
const extractJSON = (raw) => {
  let text = String(raw || '').trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  }
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text;
};

const tryParse = (raw) => {
  try { return JSON.parse(extractJSON(raw)); }
  catch { return null; }
};

// ── Per-agent parsers ──────────────────────────────────────────────

export const parseHealthResponse = (raw) => {
  const json = tryParse(raw);
  if (!json) return null;
  const cat = (key) => ({ score: json[key]?.score ?? 0, issues: json[key]?.issues ?? [] });
  return {
    overall:     json.overall     ?? 0,
    grammar:     cat('grammar'),
    logic:       cat('logic'),
    formatting:  cat('formatting'),
    evidence:    cat('evidence'),
    readability: cat('readability'),
    consistency: cat('consistency'),
  };
};

export const parseSuggestionsResponse = (raw) => {
  const json = tryParse(raw);
  if (!json) return [];
  const list = Array.isArray(json.suggestions) ? json.suggestions : [];
  return list.map((s, idx) => ({
    id:             s.id           || `sug_${idx}`,
    excerpt:        s.excerpt      || '',
    issue:          s.issue        || 'Issue',
    fix:            s.fix          || '',
    explanation:    s.explanation  || '',
    severity:       s.severity     || 'info',
    category:       s.category     || 'general',
    fallacy:        s.fallacy,
    canonical:      s.canonical,
    variants:       s.variants,
    recommendation: s.recommendation,
    standard:       s.standard,
  }));
};

export const parseDesignerResponse = (raw) => {
  const json = tryParse(raw);
  if (!json) return null;
  return {
    detectedType:  json.detectedType  || 'Document',
    confidence:    json.confidence    ?? 0,
    suggestions:   parseSuggestionsResponse(raw),
  };
};

export const parseReviewerResponse = (raw) => {
  const json = tryParse(raw);
  if (!json) return null;
  return {
    score:      Number(json.score)  || 0,
    strengths:  Array.isArray(json.strengths)  ? json.strengths  : [],
    weaknesses: Array.isArray(json.weaknesses) ? json.weaknesses : [],
    summary:    json.summary || '',
  };
};

export const parseDNAResponse = (raw) => {
  const json = tryParse(raw);
  return json && json.vocabulary ? json : null;
};

// ── Unified dispatcher ─────────────────────────────────────────────
export const parseForAgent = (agentId, rawText) => {
  switch (agentId) {
    case 'health':        return parseHealthResponse(rawText);
    case 'reviewer':      return parseReviewerResponse(rawText);
    case 'designer':      return parseDesignerResponse(rawText);
    case 'dna':           return parseDNAResponse(rawText);
    case 'editor':
    case 'logic':
    case 'research':
    case 'consistency':
    case 'compliance':
    case 'knowledge-gap': return parseSuggestionsResponse(rawText);
    // Writing and Audience agents return plain text for direct use
    default:              return rawText;
  }
};
