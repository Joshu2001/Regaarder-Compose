const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];

const parseJsonSafely = (rawText) => {
  if (!rawText) {
    return null;
  }

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

const resolveModelCandidates = async (apiKey) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
    if (!response.ok) {
      return FALLBACK_MODELS;
    }

    const payload = await response.json();
    const models = Array.isArray(payload?.models) ? payload.models : [];

    const candidates = models
      .filter((model) => {
        const name = model?.name || '';
        const methods = Array.isArray(model?.supportedGenerationMethods) ? model.supportedGenerationMethods : [];
        return name.includes('models/gemini-2.5') && methods.includes('generateContent');
      })
      .map((model) => String(model?.name || '').replace('models/', ''))
      .filter(Boolean)
      .filter((model, index, arr) => arr.indexOf(model) === index)
      .sort((a, b) => {
        const score = (name) => {
          if (name.includes('flash')) return 0;
          if (name.includes('pro')) return 1;
          return 2;
        };
        return score(a) - score(b);
      });

    return candidates.length ? candidates : FALLBACK_MODELS;
  } catch (_error) {
    return FALLBACK_MODELS;
  }
};

const readBody = (req) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_error) {
      return {};
    }
  }
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return {};
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'Server is missing GEMINI_API_KEY. Set it in Vercel Project Settings -> Environment Variables.',
    });
  }

  const body = readBody(req);
  const userPrompt = String(body?.userPrompt || '').trim();
  const systemPrompt = String(body?.systemPrompt || '').trim();
  const schema = body?.schema;

  if (!userPrompt) {
    return res.status(400).json({ ok: false, error: 'Missing userPrompt' });
  }

  const modelCandidates = await resolveModelCandidates(apiKey);
  let lastError = 'No Gemini model could generate a response.';

  for (const modelName of modelCandidates) {
    try {
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1200,
        },
      };

      if (systemPrompt) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
      }

      if (schema) {
        payload.generationConfig.responseMimeType = 'application/json';
        payload.generationConfig.responseSchema = schema;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const providerError = await response.json().catch(() => ({}));
        lastError = `${modelName}: ${providerError?.error?.message || `HTTP ${response.status}`}`;
        continue;
      }

      const result = await response.json();
      const text = String(result?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      if (!text) {
        lastError = `${modelName}: empty text response`;
        continue;
      }

      const parsed = schema ? parseJsonSafely(text) : null;
      if (schema && !parsed) {
        lastError = `${modelName}: returned invalid JSON for the requested schema`;
        continue;
      }

      return res.status(200).json({
        ok: true,
        text,
        parsed,
        modelName,
      });
    } catch (_error) {
      lastError = `${modelName}: network error while contacting Gemini`;
    }
  }

  return res.status(502).json({ ok: false, error: lastError });
}
