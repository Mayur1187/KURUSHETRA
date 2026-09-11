# Reusable AI Hackathon Platform

A modular, full-stack foundation for hackathon projects: **React + Flask +
Supabase + a swappable AI provider layer**. The core platform (auth,
dashboard, project workspace, processing pipeline, results, history) is
built and works end-to-end today, using a mock AI provider and demo data
where needed — so it runs with **zero configuration**. When the real
problem statement is announced, you adapt it by editing a small, clearly
marked **domain module**, not by rebuilding the app.

```
User → Login → Dashboard → Create Project → Provide Input →
Flask validates → AI processes → Result stored → Result shown → History
```

## Project layout

```
frontend/   React app (Vite)
backend/    Flask API
backend/supabase/   SQL schema + Row Level Security policies
```

See `frontend/src/modules/domain/README.md` and `backend/app/domain/`
for the two places you'll touch most once the problem statement lands.

---

## 1. Quick start (demo mode, no accounts needed)

The app is runnable immediately with an in-memory mock AI provider and
sample data, even without Supabase or an AI API key.

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The API starts on `http://localhost:5000`. Check `GET /api/health`.

> Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set, project/result
> endpoints fall back to sample data — good for frontend development
> before Supabase is wired up, but **not for real multi-user use**.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

> Auth requires Supabase to be configured (below) — the mock AI provider
> alone doesn't remove the need for real accounts.

---

## 2. Full setup with Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `backend/supabase/schema.sql`, then
   `backend/supabase/rls_policies.sql`.
3. Under **Storage**, create the buckets: `uploads`, `user-files`,
   `generated-results`, `reports`.
4. Under **Project Settings → API**, copy:
   - `Project URL` → `SUPABASE_URL` (backend) and `VITE_SUPABASE_URL` (frontend)
   - `anon public` key → `VITE_SUPABASE_ANON_KEY` (frontend only)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — **never** put this in the frontend)
5. Under **Project Settings → API → JWT Settings**, copy the JWT secret
   into `SUPABASE_JWT_SECRET` (backend) so Flask can verify tokens.

Restart both servers after setting env vars.

---

## 3. Configuring the AI provider

Set in `backend/.env`:

```env
AI_PROVIDER=mock      # mock | openai | gemini | claude
AI_MODEL=gpt-4o-mini  # any model name valid for the chosen provider
AI_API_KEY=...        # not needed for mock
AI_BASE_URL=          # optional, for OpenAI-compatible self-hosted servers
```

The frontend never sees this key — every AI call goes
`React → Flask → provider`. To add a new provider (HuggingFace, a
custom model server, a CV/NLP microservice):

1. Add `backend/app/services/ai/your_provider.py` subclassing `AIProvider`.
2. Register it in `_PROVIDERS` inside `backend/app/services/ai/ai_service.py`.
3. Set `AI_PROVIDER=your_provider`.

No route or frontend code changes needed.

---

## 4. Adapting to the hackathon problem statement (Phase 7)

Once the problem statement is known, you should mostly be editing:

| What changes | Where |
|---|---|
| Branding, copy, feature flags | `frontend/src/config/projectConfig.js` |
| Navigation items | `frontend/src/config/navigationConfig.js` |
| Input form | `frontend/src/modules/domain/components/DomainInputForm.jsx` |
| Result visualization | `frontend/src/modules/domain/components/DomainResultCard.jsx` |
| Request type / labels | `frontend/src/modules/domain/config/domainConfig.js` |
| AI prompt(s) | `backend/app/domain/domain_prompts.py` |
| Input preprocessing / result interpretation | `backend/app/domain/domain_service.py` |
| New domain-specific API endpoints | `backend/app/routes/domain.py` (`/api/domain/*`) |
| New domain-specific DB tables | Add to `backend/supabase/schema.sql` under "DOMAIN TABLES" |

The core platform — auth, project CRUD, the processing pipeline, result
storage, history, RLS — should not need to change.

---

## 5. Architecture at a glance

```
React Frontend (auth, dashboard, workspace, results, history)
        │  REST + Supabase JWT
        ▼
Flask Backend (routes → validation → services → domain → AI service)
        │                                   │
        ▼                                   ▼
   Supabase (auth, Postgres,          AI Providers
   storage, RLS)                      (mock/openai/gemini/claude/...)
```

Key rules baked into the code (see `backend/app/middleware/auth_middleware.py`
and `backend/app/services/supabase_client.py`):

- Flask verifies the Supabase JWT on every protected route; it never
  trusts a `user_id` sent from the client.
- The Supabase **service role** key lives only in the backend and is
  used with explicit `user_id` filters on every query.
- The frontend only ever holds the Supabase **anon** key, which is
  safe by design because Supabase enforces RLS for it.
- API responses always use the same envelope:
  `{ success, message, data }` or `{ success: false, message, error: { code, details } }`.

---

## 6. Deploying (Vercel) & GitHub

This repo is ready to push straight to GitHub and deploy on Vercel:

- `frontend/vercel.json` and `backend/vercel.json` — zero-config Vercel
  deploys for each half of the app (deployed as two separate Vercel
  projects, pointing `Root Directory` at `frontend/` and `backend/`
  respectively).
- `backend/api/index.py` — WSGI entrypoint Vercel's Python runtime
  auto-detects; it wraps the exact same Flask app used locally.
- `.github/workflows/ci.yml` — runs a backend compile check and a
  frontend build on every push/PR.
- `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`,
  `CONTRIBUTING.md`, `LICENSE` (MIT) — so the repo is usable by a team
  from the moment it's pushed.

Full step-by-step instructions (env vars, CORS, one-click deploy
buttons, limits to know about) are in **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**.

## 7. Demo mode

`DEMO_MODE=true` (default) plus `AI_PROVIDER=mock` means the whole
workflow — login through history — works with no external services,
which is a safety net if Wi-Fi or an AI API goes down mid-demo. Turn
off `DEMO_MODE` and set real Supabase + AI credentials for the actual
submission.
