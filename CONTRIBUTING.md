# Contributing

This is a hackathon project foundation — contributions should keep that
in mind: favor working, simple changes over large refactors.

## Local setup

See the root `README.md` for full setup. Short version:

```bash
# backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env && python run.py

# frontend
cd frontend && npm install && cp .env.example .env && npm run dev
```

## Branching

- `main` — always deployable.
- Feature branches: `feature/short-description`.
- Fix branches: `fix/short-description`.

## Before opening a PR

- Backend: `python -m py_compile $(find backend -name "*.py")` should pass.
- Frontend: `npm run build` inside `frontend/` should pass.
- Keep domain-specific logic inside `backend/app/domain/` and
  `frontend/src/modules/domain/` rather than the core platform files,
  so the core stays reusable for future hackathons.
- Never commit `.env` files or API keys.

## Commit messages

Keep them short and imperative, e.g. `Add CSV upload to domain input form`.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/`.
