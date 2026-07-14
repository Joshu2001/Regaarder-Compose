const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];
const ENV_KEY_CANDIDATES = ['GEMINI_API_KEY', 'VITE_GEMINI_DEMO_API_KEY'];

const COMPOSE_AGENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    action: { type: 'STRING' },
    targetText: { type: 'STRING' },
    replacementText: { type: 'STRING' },
    chartData: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING' },
        title: { type: 'STRING' },
        labels: { type: 'ARRAY', items: { type: 'STRING' } },
        datasets: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              label: { type: 'STRING' },
              data: { type: 'ARRAY', items: { type: 'NUMBER' } },
            },
          },
        },
      },
    },
    explanation: { type: 'STRING' },
  },
  required: ['action', 'explanation'],
};

const COMPOSE_AGENT_SYSTEM_PROMPT = `You are Regaarder Compose Agent.
Interpret the command as an instruction and apply it to selected text/document content.
Never transform the instruction phrase itself.
If command says translate to a language, translate selected_text first; if missing, use full_document.
Return strict JSON only matching schema.`;

const resolveApiKey = () => {
  for (const keyName of ENV_KEY_CANDIDATES) {
    const value = String(process.env[keyName] || '').trim();
    if (value) {
      return { apiKey: value, envKeyName: keyName };
    }
  }
  return { apiKey: '', envKeyName: '' };
};

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

const resolveModelCandidates = async (apiKey, options = {}) => {
  const hasAudioAttachment = Array.isArray(options.attachments)
    && options.attachments.some((item) => String(item?.mimeType || '').toLowerCase().startsWith('audio/'));

  const prioritize = (modelNames) => {
    const preferred = [];
    const remaining = [];
    for (const modelName of modelNames) {
      const lower = modelName.toLowerCase();
      const isFlash = lower.includes('flash');
      const wantsFlash = hasAudioAttachment || options.task === 'transcription';
      if ((wantsFlash && isFlash) || (!wantsFlash && !isFlash)) {
        preferred.push(modelName);
      } else {
        remaining.push(modelName);
      }
    }
    return [...preferred, ...remaining];
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
    );

    if (!response.ok) {
      return prioritize(FALLBACK_MODELS);
    }

    const payload = await response.json().catch(() => ({}));
    const dynamic = Array.isArray(payload?.models)
      ? payload.models
          .filter((model) => Array.isArray(model?.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent'))
          .map((model) => String(model?.name || '').replace(/^models\//, '').trim())
            .filter((name) => name.startsWith('gemini-2.5'))
      : [];

    const candidateSet = new Set([...dynamic, ...FALLBACK_MODELS]);
    return prioritize(Array.from(candidateSet));
  } catch (_error) {
    return prioritize(FALLBACK_MODELS);
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

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map((item) => ({
      name: String(item?.name || 'attachment'),
      mimeType: String(item?.mimeType || 'application/octet-stream'),
      data: String(item?.data || ''),
    }))
    .filter((item) => item.data)
    .slice(0, 8);
};

const buildLegacyComposePrompt = (body) => {
  const prompt = String(body?.prompt || '').trim();
  if (!prompt) {
    return null;
  }
  const selectedText = String(body?.selectedText || '').trim();
  const documentText = String(body?.documentText || '').trim();
  return `<user_command>\n${prompt}\n</user_command>\n\n<selected_text>\n${selectedText}\n</selected_text>\n\n<full_document>\n${documentText}\n</full_document>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { apiKey, envKeyName } = resolveApiKey();
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: `Server is missing ${ENV_KEY_CANDIDATES.join(' or ')}. Set one of them in Vercel Project Settings -> Environment Variables.`,
    });
  }

  const body = readBody(req);
  const task = String(body?.task || '').toLowerCase();
  
  let attachments = normalizeAttachments(body?.attachments);
  if (task === 'transcription' && body?.audio && attachments.length === 0) {
    attachments = [{
      name: 'audio.webm',
      mimeType: 'audio/webm',
      data: String(body.audio)
    }];
  }

  const legacyPrompt = buildLegacyComposePrompt(body);
  const isLegacyComposeMode = Boolean(legacyPrompt);

  let userPrompt = String(body?.userPrompt || '').trim() || legacyPrompt || '';
  if (!userPrompt && task === 'transcription') {
    userPrompt = 'Transcribe this audio accurately. If the audio is silent or contains no speech, respond with exactly: [SILENCE]';
  }

  let systemPrompt = String(body?.systemPrompt || '').trim() || (isLegacyComposeMode ? COMPOSE_AGENT_SYSTEM_PROMPT : '');
  if (!systemPrompt && task === 'transcription') {
    systemPrompt = 'You are an expert audio transcription tool. Output only clean text with proper capitalization and punctuation. If there is no speech in the audio, respond with exactly: [SILENCE].';
  }

  const schema = body?.schema || (isLegacyComposeMode ? COMPOSE_AGENT_SCHEMA : undefined);

  if (!userPrompt) {
    return res.status(400).json({ ok: false, error: 'Missing userPrompt' });
  }

  const modelCandidates = await resolveModelCandidates(apiKey, {
    attachments,
    task: String(body?.task || '').toLowerCase(),
  });
  let lastError = 'No Gemini model could generate a response.';

  for (const modelName of modelCandidates) {
    try {
      const parts = [{ text: userPrompt }];
      attachments.forEach((attachment) => {
        parts.push({
          text: `Attachment: ${attachment.name} (${attachment.mimeType}). Use this as source context.`,
        });
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
          temperature: 0.5,
          maxOutputTokens: 4096,
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
      lastError = `${modelName}: network error while contacting Gemini`;
    }
  }

  return res.status(502).json({ ok: false, error: lastError });
}
