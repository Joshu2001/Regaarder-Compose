# Regaarder Compose

## Setup
1. Install dependencies: npm install
2. Run dev: npm run dev

## AI Configuration (Secure)
1. In Vercel Project Settings -> Environment Variables, add `GEMINI_API_KEY` (recommended) or `VITE_GEMINI_DEMO_API_KEY`.
2. The frontend sends prompts to `/api/gemini`; the server route reads one of those server env vars.
3. Use `/api/ai-status` to confirm whether the server sees a usable key.

For local testing of the server route, use `vercel dev` so `/api/gemini` is available.

## Vercel Deployment
This project is configured for Vercel using `npm run build` as the build command and `dist` as the output directory.
