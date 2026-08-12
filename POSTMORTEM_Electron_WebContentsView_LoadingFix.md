# Postmortem: Electron WebContentsView Infinite Spinner and Navigation Hang

**Date:** 2026-08-12  
**Severity:** High (P1) — Embedded research browser stuck spinning with no results when searching/navigating inside Electron  
**Status:** Resolved  

---

## Summary

When running Regaarder inside the Electron desktop container, performing web searches or navigating to external websites (e.g. `google.com`, `youtube.com`, or search queries) resulted in an infinite loading spinner and a blank browser canvas without rendering results.

The root cause was a combination of a missing preload script bridge (`preload.cjs`), security header blocking (`X-Frame-Options` returning `ERR_BLOCKED_BY_RESPONSE`), unhandled `did-fail-load` events in `BrowserViewManager`, invalid protocol formatting for search queries, and orphaned background Electron processes locking cache and GPU resources.

---

## Timeline

| Time | Event |
|------|-------|
| Bug reported | User reported "why m not seeing any results even when running in electron ? like it spins without stopping with no results". |
| Diagnostic Investigation | Inspected Electron entry point `main.cjs` and discovered it pointed to `preload.cjs`, which did not exist on disk. |
| Fallback Analysis | Confirmed that missing `preload.cjs` caused `window.electronAPI` to be undefined, forcing React to fall back to an `<iframe>` renderer. |
| Console Trace Analysis | Captured terminal output showing `ERR_BLOCKED_BY_RESPONSE` on `google.com` / `youtube.com` and `ERR_CONNECTION_REFUSED` on port `5173`. |
| Root Cause Identified | 1. `preload.cjs` missing; 2. `X-Frame-Options` on sub-views causing `ERR_BLOCKED_BY_RESPONSE`; 3. `did-fail-load` not clearing `isLoading`; 4. Search terms converted to invalid `https://query` URLs; 5. 12 orphaned `electron.exe` background processes locking cache. |
| Fix Applied | 1. Created `electron/preload.cjs`; 2. Added `session.defaultSession.webRequest.onHeadersReceived` header interceptor in `main.cjs`/`main.js`; 3. Added `did-fail-load` listener in `browserViewManager.cjs`/`browserViewManager.js`; 4. Implemented smart URL vs search term parsing; 5. Killed orphaned background processes. |
| Verification | Built project with `npm run build` (passed in 14s & 22s with 0 errors). |
| Resolution | Documented postmortem, committed, and pushed changes. |

---

## Root Cause Analysis

### 1. Missing Preload Script Bridge (`preload.cjs`)
`package.json` specifies `"main": "electron/main.cjs"`. In `electron/main.cjs`, `webPreferences.preload` was configured as `path.join(__dirname, 'preload.cjs')`. However, only `preload.js` existed in the `electron/` directory. Consequently:
- Electron failed to load the preload script on window boot.
- `window.electronAPI` was undefined in the renderer window context.
- `isElectron` in React evaluated to `false` (`Boolean(window.electronAPI?.isElectron) === false`).

### 2. Security Header Blocking (`ERR_BLOCKED_BY_RESPONSE`)
Because `isElectron` evaluated to `false`, React fell back to rendering an HTML `<iframe>` container. When navigating to major web domains (like `google.com` or `youtube.com`), the remote servers returned `X-Frame-Options: SAMEORIGIN` or `Content-Security-Policy` headers. Electron's default web request handler enforced these framing restrictions on sub-views, causing Chromium to cancel sub-view navigations with `ERR_BLOCKED_BY_RESPONSE`.

### 3. Missing `did-fail-load` Listener in `BrowserViewManager`
`BrowserViewManager` registered listeners for `did-start-loading` and `did-stop-loading`, but omitted a listener for `did-fail-load`. Whenever a sub-view encountered a network, DNS, or CORS policy error, `did-stop-loading` was bypassed, leaving `tabState.isLoading = true` permanently stuck in React state.

### 4. Search Query Protocol Formatting
In `BrowserWorkspace.jsx`, input from the address bar that lacked a protocol (`!/^https?:\/\//i.test(targetUrl)`) was prepended with `https://`. Search phrases like `"react hooks"` or `"apple market cap"` became invalid URLs (`https://react hooks`), which failed DNS resolution immediately.

### 5. Orphaned Background Process Lock
Multiple orphaned `electron.exe` background processes were left running in Windows memory from previous debugging sessions. These processes held exclusive locks on the user data cache directory (`Unable to move the cache: Access is denied (0x5)`) and caused Chromium GPU process crashes (`exit_code=34`).

---

## Fix Details

### 1. Created Preload Script Bridge
**File Created:** [`electron/preload.cjs`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/electron/preload.cjs)  
Exposed `window.electronAPI` IPC bridge methods (`createTab`, `selectTab`, `navigate`, `onTabUpdated`, `updateViewportBounds`, `setBrowserVisibility`) to renderer process.

### 2. Intercepted Framing Headers in Main Process
**Files Modified:** [`electron/main.cjs`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/electron/main.cjs), [`electron/main.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/electron/main.js)  
Added `session.defaultSession.webRequest.onHeadersReceived` to strip `x-frame-options` and `content-security-policy` headers for embedded Chromium sub-views.

### 3. Handled Navigation Failures
**Files Modified:** [`electron/browserViewManager.cjs`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/electron/browserViewManager.cjs), [`electron/browserViewManager.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/electron/browserViewManager.js)  
Added `did-fail-load` event listener to reset `tabState.isLoading = false` on navigation errors.

### 4. Smart URL and Search Query Parsing
**File Modified:** [`src/components/browser/BrowserWorkspace.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/browser/BrowserWorkspace.jsx)  
Updated `handleNavigate` to detect whether address bar input is a valid domain or a search phrase. Search queries are automatically formatted as `https://www.google.com/search?q=${encodeURIComponent(query)}`.

### 5. Process Cleanup
Executed `taskkill /F /IM electron.exe /T` to terminate 12 hanging background processes and release disk cache locks.

---

## Key Lessons & Preventative Guidelines

1. **Preload File Synchronization:** Ensure CommonJS (`.cjs`) and ES Module (`.js`) entry points reference valid, existing preload file paths.
2. **Header Interception for Embedded Browser Views:** When embedding Chromium sub-views (`WebContentsView` / `BrowserView`) inside a browser app shell, strip framing headers via `session.defaultSession.webRequest.onHeadersReceived` to prevent `ERR_BLOCKED_BY_RESPONSE`.
3. **Comprehensive WebContents Event Coverage:** Always register `did-fail-load` alongside `did-start-loading` and `did-stop-loading` to prevent asynchronous UI state deadlocks.
4. **Orphaned Process Hygiene:** Regularly check for and clean up orphaned desktop binary processes when testing desktop containers.
