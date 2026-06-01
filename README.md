# Regaarder Compose

## Setup
1. Install dependencies: npm install
2. Run dev: npm run dev
3. Run full AI-capable dev runtime: npm run dev:ai

## AI Configuration (Secure)
1. In Vercel Project Settings -> Environment Variables, add `GEMINI_API_KEY` (recommended) or `VITE_GEMINI_DEMO_API_KEY`.
2. The frontend sends prompts to `/api/gemini`; the server route reads one of those server env vars.
3. Use `/api/ai-status` to confirm whether the server sees a usable key.

For local testing of the server route, use `npm run dev:ai` (Vercel dev runtime) so `/api/gemini` and `/api/ai-status` are executed as API handlers.
If you run only `npm run dev` (Vite static dev), Smart Assist will fall back because `/api/gemini` is not executed.

## Vercel Deployment
This project is configured for Vercel using `npm run build` as the build command and `dist` as the output directory.

A committed `vercel.json` enforces this so Vercel serves the built app (not source `index.html`), which avoids blank-screen failures from loading raw `/src/main.jsx` in production.
