# Deployment Guide

This repo deploys as **two separate Vercel projects** — one for
`frontend/`, one for `backend/` — which is the standard pattern for a
React + Flask app on Vercel and keeps each side's build/env config
clean.

## 0. Push to GitHub first

```bash
cd hackathon-platform
git init
git add .
git commit -m "Initial commit: reusable AI hackathon platform"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.env`, `__pycache__/`,
and `.vercel/`, so secrets and build output won't be committed.

---

## 1. Deploy the backend (Flask) to Vercel

1. On [vercel.com](https://vercel.com) → **Add New → Project** → import
   your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Vercel auto-detects `backend/vercel.json`, which routes every
   request to `backend/api/index.py` (a thin wrapper around the same
   Flask app used locally — see that file's comments).
4. Add environment variables (Project Settings → Environment Variables):

   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_JWT_SECRET=...
   AI_PROVIDER=mock            # or openai / gemini / claude
   AI_MODEL=...
   AI_API_KEY=...
   FLASK_SECRET_KEY=...
   FLASK_ENV=production
   FRONTEND_ORIGIN=https://<your-frontend>.vercel.app
   DEMO_MODE=false             # true only for offline/backup demos
   ```

5. Deploy. Your API will be live at `https://<backend-project>.vercel.app`,
   with routes under `/api/...` (e.g. `/api/health`).

**Know the limits:** Vercel functions are stateless with a request
timeout (10s Hobby / 60s Pro). That's fine for typical hackathon AI
calls through the mock/OpenAI/Gemini/Claude providers here. If your
domain module needs long-running processing (large file/video
analysis, custom ML inference), deploy the backend to
[Render](https://render.com), [Railway](https://railway.app), or
[Fly.io](https://fly.io) instead — no code changes needed, since
`run.py` is a standard Flask entrypoint (`gunicorn run:app` works on
any of them).

---

## 2. Deploy the frontend (React/Vite) to Vercel

1. **Add New → Project** → same repo, **Root Directory** set to `frontend`.
2. Vercel auto-detects Vite via `frontend/vercel.json` (build command
   `npm run build`, output `dist`, with an SPA rewrite so client-side
   routes like `/dashboard` don't 404 on refresh).
3. Add environment variables:

   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_API_BASE_URL=https://<backend-project>.vercel.app/api
   ```

4. Deploy. Your app will be live at `https://<frontend-project>.vercel.app`.

5. Go back to the **backend** project's env vars and set
   `FRONTEND_ORIGIN` to this exact URL (for CORS), then redeploy the
   backend.

---

## 3. Supabase (one-time, before either deploy matters)

Already covered in the root `README.md` §2 — run `backend/supabase/schema.sql`
then `rls_policies.sql` in the Supabase SQL editor, and create the
`uploads`, `user-files`, `generated-results`, `reports` storage buckets.

---

## 4. Continuous deployment

Once both Vercel projects are linked to the GitHub repo, every push to
`main` auto-deploys; every PR gets its own preview URL for both
frontend and backend. `.github/workflows/ci.yml` runs a build/compile
check on PRs so broken code fails fast before merge (Vercel deploys
regardless of CI status — add branch protection in GitHub settings if
you want CI to gate merges).

---

## 5. One-click "Deploy to Vercel" buttons (optional)

Once the repo is pushed to GitHub, you can add buttons like these to
the README, replacing `<your-org>/<your-repo>`:

```md
[![Deploy Frontend](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/<your-org>/<your-repo>&root-directory=frontend&project-name=hackathon-frontend)

[![Deploy Backend](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/<your-org>/<your-repo>&root-directory=backend&project-name=hackathon-backend)
```
