const ENV_KEY_CANDIDATES = ['GEMINI_API_KEY', 'VITE_GEMINI_DEMO_API_KEY'];

const resolveApiKey = () => {
  for (const keyName of ENV_KEY_CANDIDATES) {
    const value = String(process.env[keyName] || '').trim();
    if (value) {
      return { apiKey: value, envKeyName: keyName };
    }
  }
  return { apiKey: '', envKeyName: '' };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { apiKey, envKeyName } = resolveApiKey();
  const configured = Boolean(apiKey);
  if (!configured) {
    return res.status(200).json({
      ok: true,
      configured: false,
      usable: false,
      envKeyName: ENV_KEY_CANDIDATES.join(' or '),
      reason: `${ENV_KEY_CANDIDATES.join(' or ')} is missing on the server runtime.`,
    });
  }

  try {
    const probe = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
    if (!probe.ok) {
      const errorBody = await probe.json().catch(() => ({}));
      const providerMessage = String(errorBody?.error?.message || `HTTP ${probe.status}`);
      return res.status(200).json({
        ok: true,
        configured: true,
        usable: false,
        envKeyName,
        reason: providerMessage,
      });
    }

    const payload = await probe.json().catch(() => ({}));
    const models = Array.isArray(payload?.models) ? payload.models : [];
    const usable = models.some((model) => {
      const name = String(model?.name || '');
      const methods = Array.isArray(model?.supportedGenerationMethods) ? model.supportedGenerationMethods : [];
      return name.includes('models/gemini-2.5') && methods.includes('generateContent');
    });

    return res.status(200).json({
      ok: true,
      configured: true,
      usable,
      envKeyName,
      reason: usable ? 'Gemini key is valid and models are available.' : 'Key is valid but no Gemini 2.5 generateContent model is available.',
    });
  } catch (_error) {
    return res.status(200).json({
      ok: true,
      configured: true,
      usable: false,
      envKeyName,
      reason: 'Failed to reach Gemini provider from server runtime.',
    });
  }
}
