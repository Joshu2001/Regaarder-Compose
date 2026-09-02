# Postmortem: Vercel Production & Preview Deployment Pipeline

**Date:** September 2, 2026  
**Project:** Regaarder Compose (`Joshu2001/Regaarder-Compose`)  
**Status:** Resolved & Fully Operational  

---

## 1. Executive Summary

During continuous deployment on Vercel, a succession of deployment failures occurred across both Preview (`master`) and Production (`main`) environments. The pipeline encountered a cascade of five distinct failure modes:
1. `sh: line 1: vite: command not found (exit 127)`
2. `npm error 404 Not Found - GET https://registry.npmjs.org/@regaarder%2fui`
3. `[vite]: Rollup failed to resolve import "@regaarder/ui"`
4. `A Serverless Function has an invalid name: '"Regaarder Compose/api/ai-status.js"'`
5. `npm error No workspaces found: --workspace=Regaarder Compose`

This document details the underlying repository topology, each failure mode, the false assumptions made during diagnosis, and the definitive architectural solutions implemented.

---

## 2. Root Cause Analysis & Repository Topology

The root complexity originated from an atypical git and directory hierarchy:
* **The Root Repository (`Project MOAT` / `master` branch)** was structured as an npm workspace container holding `packages/ui` and a git submodule pointer named `Regaarder Compose`.
* **The Inner Repository (`Regaarder Compose` / `main` branch)** had been initialized and pushed as a separate standalone repository to the *same* GitHub remote (`Joshu2001/Regaarder-Compose.git`), with an obsolete duplicate directory named `Regaarder Compose/` nested inside itself.
* **Vercel Environments:**
  * **Preview Environment** was connected to branch `master`.
  * **Production Environment** was connected to branch `main`.

---

## 3. Incident Timeline & Iterative Failure Modes

### Incident 1: Missing `.gitmodules` and Root Build Script (Exit 127)
* **Symptom:** `sh: line 1: vite: command not found` on Vercel `master` branch.
* **Root Cause:** The `master` branch tracked `Regaarder Compose` as a git submodule (mode `160000`), but `.gitmodules` was missing from git. Vercel skipped cloning the submodule, leaving the directory empty. The root `package.json` had no `scripts.build` defined.
* **Initial Mistake:** Assuming Vercel just needed a Root Directory change in the dashboard without recognizing that git submodules were silently failing to clone.
* **Resolution:** 
  1. Created `.gitmodules` mapping `Regaarder Compose` to the remote URL.
  2. Encoded `.gitmodules` as UTF-8 without BOM (preventing GitHub server-side parse warnings).
  3. Added `"build": "npm run build --workspace=\"Regaarder Compose\""` to root `package.json`.

---

### Incident 2: `@regaarder/ui` 404 on npm Registry
* **Symptom:** `npm error 404 Not Found - GET https://registry.npmjs.org/@regaarder%2fui`.
* **Root Cause:** The Production environment deployed branch `main`. On `main`, `package.json` had `"@regaarder/ui": "*"`. However, `@regaarder/ui` was an internal, private monorepo workspace package that only existed in `packages/ui` on `master`. `npm` attempted to fetch it from the public npm registry and 404'd.
* **Resolution:** 
  1. Copied `packages/ui` directly into `Regaarder Compose/packages/ui`.
  2. Changed `package.json` dependency to `"@regaarder/ui": "file:./packages/ui"`.
  3. Updated `vite.config.js` resolve alias to support local file paths.

---

### Incident 3: Rollup Import Failure from Obsolete Nested Copy
* **Symptom:** `[vite]: Rollup failed to resolve import "@regaarder/ui" from "/vercel/path0/Regaarder Compose/src/App.jsx"`.
* **Root Cause:** In Vercel's Project Settings, `Root Directory` was set to `Regaarder Compose`. On branch `main`, this directed Vercel into `/vercel/path0/Regaarder Compose/`—an old, stale nested backup running Vite 4 (`v4.5.14`) from months prior, which lacked the updated alias and components.
* **Initial Mistake:** Instructing the user to change Vercel UI settings without making the repository itself immune to directory routing mismatches.
* **Resolution:** 
  Synchronized the nested `Regaarder Compose/` directory with modern Vite 8 dependencies, `@regaarder/ui`, and all current source components, ensuring the build succeeds regardless of whether Vercel executes at the root or inside the subfolder.

---

### Incident 4: Serverless Function Invalid Name (Directory Space)
* **Symptom:** `A Serverless Function has an invalid name: '"Regaarder Compose/api/ai-status.js"'. Must not contain any space.`
* **Root Cause:** Once the Vite build completed, Vercel's packaging phase scanned the entire directory tree for `api/*.js` files to deploy as serverless lambdas. It discovered `Regaarder Compose/api/ai-status.js`. Because "Regaarder Compose" contains a space, Vercel's lambda router threw a fatal naming error.
* **Resolution:**
  1. Deleted the redundant `Regaarder Compose/api/` folder from git (the actual serverless endpoints are served from `/api/` at the root without spaces).
  2. Added `.vercelignore` to exclude `Regaarder Compose/api/`.

---

### Incident 5: Overbroad `.vercelignore` Deleting Workspaces
* **Symptom:** `npm error No workspaces found: --workspace=Regaarder Compose`.
* **Root Cause:** When `.vercelignore` was initially set to ignore `Regaarder Compose/`, Vercel's pre-build agent purged the entire `Regaarder Compose` workspace folder on `master` prior to running `npm run build`.
* **Resolution:** Scoped `.vercelignore` strictly to `Regaarder Compose/api/` rather than the entire directory.

---

## 4. Key Learnings & Defensive Rules for the Future

| Issue Type | Pitfall | Defensive Principle |
| :--- | :--- | :--- |
| **Monorepo / Workspaces** | Internal packages referenced via `"*"` fail on standalone builds. | Use `"file:./packages/<pkg>"` or publish private packages. |
| **Git Submodules** | Missing or BOM-encoded `.gitmodules` causes silent clone failures on CI. | Ensure `.gitmodules` is committed with valid URLs in UTF-8 (no BOM). |
| **Serverless Lambdas** | Subdirectories containing spaces cannot contain `api/` folders. | Keep all serverless functions in root-level `/api` directories with alphanumeric paths only. |
| **Vercel Ignore** | Broad `.vercelignore` rules delete files before build scripts execute. | Never ignore active workspace directories; scope ignore rules strictly to target files/subpaths. |
| **CI Resilience** | Relying on specific dashboard UI settings creates fragile pipelines. | Structure repository configuration so builds pass cleanly whether executed from root or workspace subdirectories. |