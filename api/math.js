const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];
const ENV_KEY_CANDIDATES = ['GEMINI_API_KEY', 'VITE_GEMINI_DEMO_API_KEY'];

const MATH_AGENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    latex: { type: 'STRING' },
    explanation: { type: 'STRING' },
  },
  required: ['latex', 'explanation'],
};

const MATH_AGENT_SYSTEM_PROMPT = `You are an expert mathematician and LaTeX rendering engine.
Your task is to take a user's natural language request or an image containing a mathematical formula and output perfectly formatted LaTeX code for it.
- Use standard LaTeX math mode syntax.
- Do NOT wrap the latex string in \`$$...$$\` or \`\\[...\\]\`. Just provide the raw math content (e.g. \`\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\`).
- Ensure complex symbols, integrals, summations, matrices, and greek letters are properly formatted.
- Return strict JSON matching the schema.`;

// In-memory sliding window rate limiter
const rateLimitMap = new Map();
const checkRateLimit = (ip, maxPerMinute = 20) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= maxPerMinute) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
};

const resolveApiKey = (req, body) => {
  const customKey = String(
    body?.apiKey ||
    req?.headers?.['x-gemini-api-key'] ||
    req?.headers?.['x-api-key'] ||
    ''
  ).trim();
  if (customKey) {
    return { apiKey: customKey, envKeyName: 'Client-Provided Key', isClientKey: true };
  }
  for (const keyName of ENV_KEY_CANDIDATES) {
    const value = String(process.env[keyName] || '').trim();
    if (value) {
      return { apiKey: value, envKeyName: keyName, isClientKey: false };
    }
  }
  return { apiKey: '', envKeyName: '', isClientKey: false };
};

const parseJsonSafely = (rawText) => {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch (_error) {
    const first = rawText.indexOf('{');
    const last = rawText.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(rawText.slice(first, last + 1));
      } catch (_nestedError) {
        return null;
      }
    }
    return null;
  }
};

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((item) => ({
      name: String(item?.name || 'attachment'),
      mimeType: String(item?.mimeType || 'application/octet-stream'),
      data: String(item?.data || ''),
    }))
    .filter((item) => item.data)
    .slice(0, 8);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? parseJsonSafely(req.body) || {} : req.body || {};
  const { apiKey, envKeyName, isClientKey } = resolveApiKey(req, body);

  // Rate limit guard: protect server shared quota from automated scraping or exhaustion
  const clientIp = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const maxRequests = isClientKey ? 60 : 20; // 60/min for client keys, 20/min for server shared quota
  if (!checkRateLimit(clientIp, maxRequests)) {
    return res.status(429).json({
      ok: false,
      error: 'Rate limit exceeded for Math AI generation. Please provide your own API key in Settings -> AI & API Keys or try again in a minute.'
    });
  }

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: `Server is missing ${ENV_KEY_CANDIDATES.join(' or ')}. Configure your API key in Settings -> AI & API Keys.`,
    });
  }
  const userPrompt = String(body?.prompt || '').trim() || 'Extract or generate the mathematical formula.';
  const attachments = normalizeAttachments(body?.attachments);

  let targetModel = 'gemini-2.5-flash';
  
  try {
    const parts = [{ text: userPrompt }];
    attachments.forEach((attachment) => {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data,
        },
      });
    });

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: MATH_AGENT_SCHEMA,
      },
      systemInstruction: { parts: [{ text: MATH_AGENT_SYSTEM_PROMPT }] },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!response.ok) {
      const providerError = await response.json().catch(() => ({}));
      return res.status(502).json({ ok: false, error: providerError?.error?.message || `HTTP ${response.status}` });
    }

    const result = await response.json();
    const text = String(result?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) {
      return res.status(502).json({ ok: false, error: 'Empty response from AI.' });
    }

    const parsed = parseJsonSafely(text);
    if (!parsed || !parsed.latex) {
      return res.status(502).json({ ok: false, error: 'AI failed to generate valid LaTeX JSON.' });
    }

    return res.status(200).json({
      ok: true,
      latex: parsed.latex,
      explanation: parsed.explanation || '',
      modelName: targetModel,
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'Network error while contacting Gemini' });
  }
}
