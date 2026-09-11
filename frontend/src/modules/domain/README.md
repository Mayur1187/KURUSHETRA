# Domain Module (Frontend)

This folder is the primary place to change things once the hackathon
problem statement is known.

- `config/domainConfig.js` — request type, labels, copy
- `components/DomainInputForm.jsx` — replace with the real input form
- `components/DomainResultCard.jsx` — replace with the real result visualization

The core pages (`WorkspacePage`, `ResultsPage`) import from this
folder, so editing these files (or swapping them out) adapts the app
without touching auth, routing, or the API layer.

See `backend/app/domain/` for the matching backend-side domain module.
