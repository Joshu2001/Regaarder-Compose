/**
 * Creem.io Checkout & Session Service
 * Base URL: https://test-api.creem.io/v1 (Test Mode) | https://api.creem.io/v1 (Production)
 */

export const CREEM_CONFIG = {
  apiKey: import.meta.env.VITE_CREEM_API_KEY || 'creem_test_2OdWMXSGaUCLddEb65dlYN',
  mode: import.meta.env.VITE_CREEM_MODE || 'test',
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
    const successUrl = `${window.location.origin}/welcome`;

    const payload = {
      product_id: productId,
      success_url: successUrl,
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      metadata: {
        source: 'regaarder_compose_web',
        ...metadata
      }
    };

    const res = await fetch(`${CREEM_CONFIG.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_CONFIG.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Creem checkout session failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  }
};
