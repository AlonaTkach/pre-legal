# pre-legal

This is a SaaS product that lets users draft legal agreements based on the
templates in the `templates/` directory. The user carries out a chat to
establish which document they want and how to fill in the fields. The available
documents are described in the `catalog.json` file in the project root, included
here:

@catalog.json

The initial implementation was a front-end-only prototype; it is being upgraded
into a full-stack V1 product.

## Development process

- Feature instructions live as local task files in `tasks/` (PL-4, PL-5, …).
  Read the relevant one before starting.
- Develop the feature. Do not skip any steps.
- Thoroughly test the feature with unit tests and integration tests. Fix any
  issues.
- Submit a PR using the GitHub CLI (`gh`) when done, then merge and return to
  `main`.

## AI design

- When writing code to make calls to LLMs, use your **cerebras** skill.
- It uses LiteLLM via OpenRouter to the `openai/gpt-oss-120b` model with
  **Cerebras** as the inference provider.
- Use **structured outputs** so you can interpret the results and populate the
  fields in the legal document.
- There is an `OPENROUTER_API_KEY` in the `.env` file in the project root.

## Technical design

- The entire project should be packaged into a **Docker** container.
- The **backend** should be in `backend/` and be a **uv** project using
  **FastAPI**.
- The **frontend** should be in `frontend/` (Next.js).
- There should be `scripts/start-mac.sh` and `scripts/stop-mac.sh` to bring the
  stack up and down.
- The **database** should use **SQLite** and be created from scratch each time
  the Docker container is brought up, going for a `users` table with sign up and
  sign in.

## Code style

- Keep modules short and focused. Do not over-engineer. Do not program
  defensively for cases that cannot happen.
- No emojis in code, print statements, or logging.
- Favor concise comments; only explain the non-obvious "why".

## Brand / color scheme

Professional, trustworthy legal-tech palette:

- Ink / primary text: `#0f172a` (slate-900)
- Surface background: `#f8fafc` (slate-50)
- Accent (actions, links): `#4338ca` (indigo-700)
- Accent hover: `#3730a3` (indigo-800)
- Muted text / borders: `#64748b` / `#e2e8f0` (slate-500 / slate-200)
- Success: `#047857` (emerald-700)
