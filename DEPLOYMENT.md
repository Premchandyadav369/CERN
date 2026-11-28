# Deploying PARTON

PARTON is an **npm workspaces monorepo** (`apps/web`, `packages/sim-core`, `packages/content-schema`) requiring **no database and no mandatory API keys** (`/api/arxiv` and `/api/cern-live` work out of the box; optional `GROQ_API_KEY` in `apps/web/.env.local` enables live GroqCloud `openai/gpt-oss-120b` & `openai/gpt-oss-20b` inference on `/api/groq` with automatic deterministic fallback).

## 1. Recommended Hosting Targets

| Platform | Best For | Cost Tier | How It Works |
| :--- | :--- | :--- | :--- |
| **Vercel** *(Recommended)* | Fast global Edge/Serverless Next.js deployment with automatic Git previews | **Free (Hobby)** | Connect your GitHub repo (`vercel.json` is preconfigured at repo root!) |
| **Cloudflare Pages / Render / Railway** | Always-on Node server or one-click container | Free / Low-cost | Render reads `render.yaml`; Railway uses `Dockerfile` or `npm run build && npm run start` |
| **Google Cloud Run / Fly.io** | Serverless auto-scaling Docker container with `/api/health` checks | Pay-per-use / Free tier | Builds directly from the multi-stage `Dockerfile` (`NEXT_STANDALONE=1`) |

## 2. Option A: Deploy to Vercel (Fastest — ~2 Minutes)
1. Push your repository to GitHub (`git push origin main`).
2. Visit **https://vercel.com/new** and import your GitHub repo.
3. Keep the **Root Directory** at `.` (monorepo root) — `vercel.json` automatically configures:
   - Install Command: `npm ci`
   - Build Command: `npm run build` *(builds `@cern-x/content-schema` → `@cern-x/sim-core` → `@cern-x/web` in exact dependency order)*
   - Output Directory: `apps/web/.next`
4. Click **Deploy** (zero environment secrets needed!).

## 3. Option B: Deploy via Docker (`Cloud Run`, `Fly.io`, `Railway`, VPS)
```sh
docker build -t parton .
docker run -p 3000:3000 parton
```
Health check probe endpoint: `GET /api/health` (returns HTTP `200`).

## 4. Option C: Deploy to Render (`render.yaml`)
1. Connect your GitHub repo in Render → **New Blueprint Instance**.
2. Render reads `render.yaml`, runs `npm ci && npm run verify:all`, boots `npm run start`, and monitors `/api/health`.

## 5. Pre-Deployment Verification Command
Run locally before pushing:
```sh
npm run verify:all
```
This runs:
1. `npm run verify:manifest` (`scripts/verify_manifest.js`)
2. `npm run test:physics` (`29` Vitest physics assertions in `@cern-x/sim-core`)
3. `npm run typecheck` (TypeScript strict check across all 3 workspaces)
4. `npm run build` (topological workspace build + Next.js production bundle)
