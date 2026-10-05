/**
 * Creem.io Checkout Server Handler
 * Proxies checkout creation requests to Creem API using server credentials.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.VITE_CREEM_API_KEY || 'creem_3Hq2kAdIwW8b1dbigjxOIq';
  const mode = process.env.VITE_CREEM_MODE || 'production';
  const baseUrl = mode === 'production'
    ? 'https://api.creem.io/v1'
    : 'https://test-api.creem.io/v1';

  try {
    const payload = { ...(req.body || {}) };
    let validSuccessUrl = 'https://regaarder.com/welcome';
    if (payload.success_url && typeof payload.success_url === 'string') {
      try {
        const parsed = new URL(payload.success_url);
        if (parsed.hostname === 'localhost') {
          validSuccessUrl = payload.success_url;
        } else if (parsed.hostname === '127.0.0.1') {
          const portPart = parsed.port ? `:${parsed.port}` : '';
          validSuccessUrl = `${parsed.protocol}//localhost${portPart}${parsed.pathname || '/welcome'}`;
        } else if (parsed.protocol.startsWith('http') && !/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
          validSuccessUrl = payload.success_url;
        }
      } catch (_) {}
    }
    payload.success_url = validSuccessUrl;

    const upstreamRes = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error || `HTTP ${upstreamRes.status}`);
      return res.status(upstreamRes.status).json({ message: errMsg, ...data });
    }

    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    console.error('[API Creem Checkout Error]', err);
    return res.status(500).json({ message: err.message || 'Failed to communicate with payment provider' });
  }
}
