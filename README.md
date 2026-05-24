# Regaarder Compose

## Setup
1. Install dependencies: npm install
2. Run dev: npm run dev

## AI Configuration (Secure)
1. In Vercel Project Settings -> Environment Variables, add `GEMINI_API_KEY`.
2. Do not use `VITE_` for AI secrets.
3. The frontend sends prompts to `/api/gemini`; the server route reads `GEMINI_API_KEY`.
4. Use `/api/ai-status` to confirm whether the server sees `GEMINI_API_KEY`.

For local testing of the server route, use `vercel dev` so `/api/gemini` is available.

## Vercel Deployment
This project is configured for Vercel using `npm run build` as the build command and `dist` as the output directory.
