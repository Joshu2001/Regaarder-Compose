const GEMINI_ENV_KEYS = ['GEMINI_API_KEY', 'VITE_GEMINI_DEMO_API_KEY'];
const ANTHROPIC_ENV_KEYS = ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'];

const probeLocalOllama = async () => {
  const endpoints = ['http://127.0.0.1:11434/api/tags', 'http://localhost:11434/api/tags'];
  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(ep, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const models = Array.isArray(data.models) ? data.models : [];
        if (models.length > 0) {
          return {
            online: true,
            endpoint: ep.replace('/api/tags', ''),
            models: models.map((m) => m.name),
            activeModel: models[0].name,
          };
        }
      }
    } catch (_e) {}
  }
  return { online: false };
};

const probeLocalLmStudio = async () => {
  const endpoints = ['http://127.0.0.1:1234/v1/models', 'http://localhost:1234/v1/models'];
  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(ep, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const models = Array.isArray(data.data) ? data.data : [];
        if (models.length > 0) {
          return {
            online: true,
            endpoint: ep.replace('/models', ''),
            models: models.map((m) => m.id),
            activeModel: models[0].id,
          };
        }
      }
    } catch (_e) {}
  }
  return { online: false };
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const provider = (req.query?.provider || req.body?.provider || 'gemini').toLowerCase();

  // 1. Explicit Local Model (Ollama / LM Studio) Probe
  if (provider === 'ollama' || provider === 'lmstudio' || provider === 'local') {
    if (provider === 'lmstudio') {
      const lm = await probeLocalLmStudio();
      if (lm.online) {
        return res.status(200).json({
          ok: true,
          configured: true,
          usable: true,
          provider: 'lmstudio',
          isLocal: true,
          activeModel: lm.activeModel,
          models: lm.models,
          reason: `LM Studio is online with ${lm.models.join(', ')}.`,
        });
      }
    }

    const ollama = await probeLocalOllama();
    if (ollama.online) {
      return res.status(200).json({
        ok: true,
        configured: true,
        usable: true,
        provider: 'ollama',
        isLocal: true,
        activeModel: ollama.activeModel,
        models: ollama.models,
        reason: `Local Ollama is online with ${ollama.models.join(', ')}.`,
      });
    }

    return res.status(200).json({
      ok: true,
      configured: false,
      usable: false,
      provider: provider,
      isLocal: true,
      reason: 'Local inference server (Ollama or LM Studio) is not reachable on localhost.',
    });
  }
  
  // 2. Anthropic Claude Status Check
  if (provider === 'claude' || provider === 'anthropic') {
    const customKey = String(
      req.body?.apiKey ||
      req.query?.apiKey ||
      req.headers?.['x-anthropic-api-key'] ||
      req.headers?.['x-claude-api-key'] ||
      ''
    ).trim();

    let apiKey = customKey;
    let envKeyName = customKey ? 'Client-Provided Key' : '';
    if (!apiKey) {
      for (const k of ANTHROPIC_ENV_KEYS) {
        if (process.env[k]) {
          apiKey = process.env[k].trim();
          envKeyName = k;
          break;
        }
      }
    }

    if (!apiKey) {
      // Check local Ollama fallback if cloud key is not set
      const local = await probeLocalOllama();
      if (local.online) {
        return res.status(200).json({
          ok: true,
          configured: true,
          usable: true,
          provider: 'ollama',
          isLocal: true,
          activeModel: local.activeModel,
          models: local.models,
          reason: `Anthropic key missing, but local Ollama is active with ${local.models.join(', ')}.`,
        });
      }

      return res.status(200).json({
        ok: true,
        configured: false,
        usable: false,
        provider: 'claude',
        envKeyName: ANTHROPIC_ENV_KEYS.join(' or '),
        reason: 'Anthropic API key is not configured. Enter your API key in Settings -> AI & API Keys.',
      });
    }

    try {
      const probe = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });

      if (!probe.ok) {
        const errorBody = await probe.json().catch(() => ({}));
        const providerMessage = String(errorBody?.error?.message || `HTTP ${probe.status}`);
        return res.status(200).json({
          ok: true,
          configured: true,
          usable: false,
          provider: 'claude',
          envKeyName,
          reason: providerMessage,
        });
      }

      return res.status(200).json({
        ok: true,
        configured: true,
        usable: true,
        provider: 'claude',
        envKeyName,
        reason: 'Anthropic Claude API key is valid and connected.',
      });
    } catch (_err) {
      return res.status(200).json({
        ok: true,
        configured: true,
        usable: false,
        provider: 'claude',
        envKeyName,
        reason: 'Network error contacting Anthropic API.',
      });
    }
  }

  // 3. Google Gemini Status Check
  const customGeminiKey = String(
    req.body?.apiKey ||
    req.query?.apiKey ||
    req.headers?.['x-gemini-api-key'] ||
    req.headers?.['x-api-key'] ||
    ''
  ).trim();

  let geminiKey = customGeminiKey;
  let geminiEnvKey = customGeminiKey ? 'Client-Provided Key' : '';
  if (!geminiKey) {
    for (const keyName of GEMINI_ENV_KEYS) {
      const value = String(process.env[keyName] || '').trim();
      if (value) {
        geminiKey = value;
        geminiEnvKey = keyName;
        break;
      }
    }
  }

  if (!geminiKey) {
    // Check local Ollama fallback if cloud key is not set
    const local = await probeLocalOllama();
    if (local.online) {
      return res.status(200).json({
        ok: true,
        configured: true,
        usable: true,
        provider: 'ollama',
        isLocal: true,
        activeModel: local.activeModel,
        models: local.models,
        reason: `Gemini key missing, but local Ollama is active with ${local.models.join(', ')}.`,
      });
    }

    return res.status(200).json({
      ok: true,
      configured: false,
      usable: false,
      provider: 'gemini',
      envKeyName: GEMINI_ENV_KEYS.join(' or '),
      reason: 'Gemini API key is not configured. Enter your API key in Settings -> AI & API Keys.',
    });
  }

  try {
    const probe = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`);
    if (!probe.ok) {
      const errorBody = await probe.json().catch(() => ({}));
      const providerMessage = String(errorBody?.error?.message || `HTTP ${probe.status}`);
      return res.status(200).json({
        ok: true,
        configured: true,
        usable: false,
        provider: 'gemini',
        envKeyName: geminiEnvKey,
        reason: providerMessage,
      });
    }

    const payload = await probe.json().catch(() => ({}));
    const models = Array.isArray(payload?.models) ? payload.models : [];
    const usable = models.some((model) => {
      const name = String(model?.name || '');
      const methods = Array.isArray(model?.supportedGenerationMethods) ? model.supportedGenerationMethods : [];
      return (name.includes('models/gemini-2.5') || name.includes('models/gemini-1.5') || name.includes('models/gemini-')) && methods.includes('generateContent');
    });

    return res.status(200).json({
      ok: true,
      configured: true,
      usable,
      provider: 'gemini',
      envKeyName: geminiEnvKey,
      reason: usable ? 'Gemini API key is valid and connected.' : 'Key is valid but no Gemini generateContent model was returned.',
    });
  } catch (_error) {
    return res.status(200).json({
      ok: true,
      configured: true,
      usable: false,
      provider: 'gemini',
      envKeyName: geminiEnvKey,
      reason: 'Failed to reach Gemini provider.',
    });
  }
}
