# Postmortem: Single Page Application (SPA) Deep Link 404 Routing Resolution

**Date:** October 7, 2026  
**Project:** Regaarder Compose (`regaarder.com`)  
**Status:** Resolved & Operational (HTTP 200 on all deep links)

---

## 1. Executive Summary

When navigating to deep client-side routes such as `https://regaarder.com/download` or `https://regaarder.com/pricing`, the browser received an **HTTP 404 Not Found** response from Vercel. However, appending a hash fragment (e.g. `https://regaarder.com/#/download` or `https://regaarder.com/#/pricing`) loaded the application and rendered the expected view.

Following a configuration refactor of `vercel.json` and promoting the latest deployment to production, all deep routes now correctly return HTTP 200 and route client-side via React and Vite.

---

## 2. Root Cause Analysis

### A. Why Hash URLs Worked (`/#/download`)
In the HTTP specification, URL fragments beginning with `#` are processed purely on the client side:
1. When requesting `https://regaarder.com/#/download`, the browser only asks the server for `/`.
2. Vercel's edge network serves the root `index.html` file (HTTP 200).
3. Once loaded into memory, the browser's JavaScript engine parses `window.location.hash` (`#/download`) and renders `DownloadPage`.

### B. Why Direct Deep URLs Failed (`/download` -> 404)
When requesting `https://regaarder.com/download` without `#`:
1. The browser asks Vercel's server for a physical file at path `/download`.
2. Because Vite generates a Single Page Application with only `dist/index.html` and bundled static assets (`dist/assets/*`), no physical file named `download` or `download.html` exists on the edge filesystem.
3. Without a catch-all rewrite rule, Vercel default behavior is to return **HTTP 404 Not Found**.

### C. The `cleanUrls: true` Conflict
In earlier configurations, `vercel.json` included:
```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/((?!assets/|favicon.ico|.*\\..*$).*)",
      "destination": "/index.html"
    }
  ]
}
```
* `cleanUrls: true` instructs Vercel to strip `.html` extensions and resolve clean URLs.
* When combined with regex negative lookaheads pointing to `/index.html`, Vercel's routing pipeline treated the destination rewrite as conflicting with clean URL rules, causing edge route evaluation to miss `index.html` and fall through to a 404 handler.

### D. Pinned Manual Deployments vs. Automatic Git Deployments
In the Vercel dashboard:
* The active Production deployment was pinned to an older manual rebuild (`Production rebuild of BcBfuthJx`).
* When new commits were pushed to `main` and `master`, Vercel did not automatically promote the builds to the primary `regaarder.com` custom domain.
* The domain remained locked to the legacy build lacking the proper SPA routing configuration.

---

## 3. Implementation & Resolution

### Step 1: Cleaned `vercel.json` SPA Rewrite Rules
Removed `cleanUrls` and replaced the negative lookahead with Vercel's standard Single Page Application rewrite rule:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096",
      "CI": ""
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

* **Static Asset Safety:** On Vercel, physical static files (e.g., `/assets/index-*.js`, `/favicon.svg`) inherently take precedence over rewrites. The catch-all `/(.*)` only activates when no physical file exists at the requested path, routing all deep paths directly to `index.html`.
* **API Isolation:** API endpoints under `/api/*` are preserved and routed before the catch-all.

### Step 2: Harmonized Repository Branches
* Merged and synchronized the local feature branch into both `main` and `master`.
* Deleted obsolete remote branch `download-page-patch` to eliminate confusion across Preview deployment triggers.

### Step 3: Production Deployment Promotion
* Navigated to Vercel Deployments $\rightarrow$ **Create Deployment**.
* Selected the latest commit on `main` (`537bf59`) and triggered **Deploy to Production**.
* The live edge cache invalidated and updated across all global endpoints.

---

## 4. Verification

Live edge checks confirm HTTP 200 response codes on all primary entry points:

| Route | Pre-Fix Status | Post-Fix Status | Render Target |
| :--- | :--- | :--- | :--- |
| `https://regaarder.com/` | 200 OK | 200 OK | `RootApp` |
| `https://regaarder.com/download` | 404 Not Found | **200 OK** | `DownloadPage` |
| `https://regaarder.com/pricing` | 404 Not Found | **200 OK** | `PricingPage` |
| `https://regaarder.com/#/download` | 200 OK | 200 OK | `DownloadPage` |

---

## 5. Architectural Takeaways

1. **Avoid `cleanUrls` in pure Vite SPAs:** SPAs use client-side history routing where all paths are virtual. `cleanUrls` is intended for multi-page static sites with physical `.html` files.
2. **Prefer Simple Catch-Alls:** Use `{ "source": "/(.*)", "destination": "/index.html" }` rather than brittle regex lookaheads for SPAs on Vercel.
3. **Verify Production Branch Pinning:** When pushing code that does not reflect in production, check whether Vercel has pinned a specific manual deployment or detached automatic deployment on the production branch.
