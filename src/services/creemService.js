/**
 * Creem.io Checkout & Session Service
 * Automatically dispatches through Electron IPC bridge or local backend proxy to bypass CORS and network sandboxing.
 */

export const CREEM_CONFIG = {
  apiKey: import.meta.env.VITE_CREEM_API_KEY || 'creem_3Hq2kAdIwW8b1dbigjxOIq',
  mode: import.meta.env.VITE_CREEM_MODE || 'production',
  get baseUrl() {
    return this.mode === 'production'
      ? 'https://api.creem.io/v1'
      : 'https://test-api.creem.io/v1';
  }
};

export const creemService = {
  /**
   * Create a Creem Checkout session
   */
  async createCheckoutSession({ productId, customerEmail = null, metadata = {} }) {
    // Creem API requires a valid FQDN (e.g. https://regaarder.com) or http://localhost.
    // IP-based origins like http://127.0.0.1:5176 fail Creem's regex validation with:
    // "URL must be valid, e.g., http://localhost or http://example.com"
    let successUrl = 'https://regaarder.com/welcome';
    if (typeof window !== 'undefined' && window.location?.origin) {
      try {
        const urlObj = new URL(window.location.origin);
        if (urlObj.hostname === 'localhost') {
          successUrl = `${window.location.origin}/welcome`;
        } else if (urlObj.hostname === '127.0.0.1') {
          // Normalize 127.0.0.1 to localhost which is explicitly supported by Creem
          const portPart = urlObj.port ? `:${urlObj.port}` : '';
          successUrl = `${urlObj.protocol}//localhost${portPart}/welcome`;
        } else if (urlObj.protocol.startsWith('http') && !/^\d{1,3}(\.\d{1,3}){3}$/.test(urlObj.hostname)) {
          // Valid domain name over HTTP/HTTPS
          successUrl = `${window.location.origin}/welcome`;
        }
      } catch (_) {}
    }

    const payload = {
      product_id: productId,
      success_url: successUrl,
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      metadata: {
        source: 'regaarder_compose',
        ...metadata
      }
    };

    // 1. Electron Desktop Bridge: bypasses all renderer sandbox / CORS restrictions
    if (window.electronAPI?.createCreemCheckout) {
      try {
        const res = await window.electronAPI.createCreemCheckout(payload);
        if (res?.success && res.data) {
          return res.data;
        }
        if (res?.error && !res.error.includes('No handler registered')) {
          throw new Error(res.error);
        }
      } catch (ipcErr) {
        // If main process was not restarted yet and handler is not registered, fall through
        if (!ipcErr.message?.includes('No handler registered')) {
          throw ipcErr;
        }
      }
    }

    // 2. Web / Browser: call local backend relay (/api/creem/checkout)
    try {
      const relayRes = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (relayRes.ok) {
        return await relayRes.json();
      }

      const relayErr = await relayRes.json().catch(() => ({}));
      if (relayErr.message || relayErr.error) {
        throw new Error(relayErr.message || relayErr.error);
      }
    } catch (err) {
      // If server relay failed with a non-404 error, rethrow
      if (err.message && !err.message.includes('404')) {
        throw err;
      }
    }

    // 3. Fallback direct fetch (if standalone static deployment without backend)
    const directRes = await fetch(`${CREEM_CONFIG.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_CONFIG.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!directRes.ok) {
      const err = await directRes.json().catch(() => ({}));
      const errMsg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || `HTTP ${directRes.status}`);
      throw new Error(errMsg);
    }

    return await directRes.json();
  }
};
