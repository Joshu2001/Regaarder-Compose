const FALLBACK_MODELS = ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
const ENV_KEY_CANDIDATES = ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'];

const COMPOSE_AGENT_SYSTEM_PROMPT = `You are Regaarder Compose Agent.
Interpret the command as an instruction and apply it to selected text/document content.
Never transform the instruction phrase itself.
If command says translate to a language, translate selected_text first; if missing, use full_document.
When JSON output is requested, return strict JSON only matching the schema format:
{"action": "string", "targetText": "string", "replacementText": "string", "explanation": "string"}`;

const resolveApiKey = (req, body) => {
  const customKey = String(
    body?.apiKey ||
    req?.headers?.['x-anthropic-api-key'] ||
    req?.headers?.['x-claude-api-key'] ||
    req?.headers?.['x-api-key'] ||
    ''
  ).trim();
  if (customKey) {
    return { apiKey: customKey, envKeyName: 'Client-Provided Key' };
  }
  for (const keyName of ENV_KEY_CANDIDATES) {
    const value = String(process.env[keyName] || '').trim();
    if (value) {
      return { apiKey: value, envKeyName: keyName };
    }
  }
  return { apiKey: '', envKeyName: '' };
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

const buildLegacyComposePrompt = (body) => {
  const prompt = String(body?.prompt || '').trim();
  if (!prompt) return null;
  const selectedText = String(body?.selectedText || '').trim();
  const documentText = String(body?.documentText || '').trim();
  return `<user_command>\n${prompt}\n</user_command>\n\n<selected_text>\n${selectedText}\n</selected_text>\n\n<full_document>\n${documentText}\n</full_document>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = readBody(req);
  const { apiKey, envKeyName } = resolveApiKey(req, body);
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: `Anthropic Claude API key is missing. Please configure your API key in Settings -> AI & API Keys or set ${ENV_KEY_CANDIDATES.join(' or ')} on the server.`,
    });
  }

  const legacyPrompt = buildLegacyComposePrompt(body);
  const isLegacyComposeMode = Boolean(legacyPrompt);

  const userPrompt = String(body?.userPrompt || '').trim() || legacyPrompt || '';
  let systemPrompt = String(body?.systemPrompt || '').trim() || (isLegacyComposeMode ? COMPOSE_AGENT_SYSTEM_PROMPT : '');
  const wantsJson = Boolean(body?.schema || isLegacyComposeMode);

  if (wantsJson && !systemPrompt.includes('JSON')) {
    systemPrompt += '\n\nOutput strict valid JSON only without markdown code blocks.';
  }

  if (!userPrompt) {
    return res.status(400).json({ ok: false, error: 'Missing userPrompt' });
  }

  const userSelectedModel = String(body?.model || '').trim();
  const modelCandidates = userSelectedModel
    ? [userSelectedModel, ...FALLBACK_MODELS.filter((m) => m !== userSelectedModel)]
    : FALLBACK_MODELS;

  let lastError = 'No Claude model could generate a response.';

  for (const modelName of modelCandidates) {
    try {
      const payload = {
        model: modelName,
        max_tokens: 4096,
        messages: [{ role: 'user', content: userPrompt }],
      };

      if (systemPrompt) {
        payload.system = systemPrompt;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const providerError = await response.json().catch(() => ({}));
        lastError = `${modelName}: ${providerError?.error?.message || `HTTP ${response.status}`}`;
        continue;
      }

      const result = await response.json();
      const text = String(result?.content?.[0]?.text || '').trim();
      if (!text) {
        lastError = `${modelName}: empty response from Claude`;
        continue;
      }

      const parsed = wantsJson ? parseJsonSafely(text) : null;

      const responsePayload = {
        ok: true,
        text,
        parsed,
        modelName,
        envKeyName,
      };

      if (isLegacyComposeMode) {
        const actionPayload = parsed || parseJsonSafely(text) || {};
        responsePayload.action = String(actionPayload?.action || 'general_chat');
        responsePayload.targetText = String(actionPayload?.targetText || '');
        responsePayload.replacementText = String(actionPayload?.replacementText || '');
        responsePayload.chartData = actionPayload?.chartData || null;
        responsePayload.explanation = String(actionPayload?.explanation || 'Processed command.');
      }

      return res.status(200).json(responsePayload);
    } catch (_error) {
      lastError = `${modelName}: network error while contacting Anthropic Claude`;
    }
  }

  return res.status(502).json({ ok: false, error: lastError });
}
