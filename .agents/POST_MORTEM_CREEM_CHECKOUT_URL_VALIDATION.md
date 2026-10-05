# Post-Mortem & Architecture Directive: Creem.io URL & Checkout Validation

## Context & Problem Description
During desktop or web development, initiating a checkout flow through Creem's Checkout API (`https://api.creem.io/v1/checkouts` or `https://test-api.creem.io/v1/checkouts`) failed with the following error:

```
Error: URL must be valid, e.g., http://localhost or http://example.com
```

This occurred on line 62 of `PricingPage.jsx` when invoking `creemService.createCheckoutSession()`.

---

## Root Cause Analysis
Creem's upstream API enforces strict regex validation on the `success_url` parameter:
1. **Allowed Hostnames:**
   - Standard FQDNs with protocols `http://` or `https://` (e.g. `https://regaarder.com`, `http://example.com`).
   - The literal hostname `localhost` (e.g. `http://localhost:5176/welcome`).
2. **Disallowed Hostnames:**
   - Raw numerical IPv4 / IPv6 addresses such as `http://127.0.0.1:5176` or private network IPs (e.g., `http://192.168.x.x`).
   - Electron local file protocol origins (`file://`).

When running the application locally via Vite in Electron or browser where the active origin was `http://127.0.0.1:5176`, passing `window.location.origin + '/welcome'` produced `http://127.0.0.1:5176/welcome`. Creem's API rejected this numeric IP address with HTTP 400 Bad Request.

---

## Architectural Rules to Prevent Recurrence

### 1. Mandatory `success_url` Normalization
Whenever constructing payloads for Creem checkout sessions, never pass raw `window.location.origin` without hostname normalization:
- If `hostname === '127.0.0.1'`, rewrite the origin to use `localhost`:
  ```javascript
  const portPart = parsedUrl.port ? `:${parsedUrl.port}` : '';
  const successUrl = `${parsedUrl.protocol}//localhost${portPart}/welcome`;
  ```
- If the protocol is `file:` or the origin is an arbitrary IP address, fallback to the canonical domain:
  ```javascript
  const successUrl = 'https://regaarder.com/welcome';
  ```
- Only pass `window.location.origin` if the hostname is explicitly `'localhost'` or a valid non-IP FQDN.

### 2. Multi-Layer Enforcement
This normalization rule must be maintained across all 3 layers of checkout creation:
1. **Frontend Client Service (`creemService.js`)**: Normalizes before dispatching to IPC or fetch relay.
2. **Electron IPC Bridge (`electron/main.cjs` - `creem:create-checkout`)**: Defensively sanitizes `payload.success_url` before calling Creem API.
3. **Backend API Relay (`api/creem/checkout.js`)**: Sanitizes `payload.success_url` for browser deployments.

### 3. External Browser Navigation in Electron
Checkout URLs returned by Creem (`session.checkout_url`) should be opened using `window.electronAPI.openExternal(checkoutUrl)` when inside Electron, preventing external checkout sessions from hijacking the application frame.
