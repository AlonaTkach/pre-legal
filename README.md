# pre-legal

A platform for drafting common legal agreements through a guided AI chat.

> pre-legal does **not** replace a lawyer. It does the pre-work so that an
> attorney or paralegal can be best set up — or serves as a tool a lawyer uses.
> All generated documents are drafts and are subject to legal review.

## What it does

Chat with an assistant to pick a supported agreement and fill in its fields; a
live preview updates as you go, and you can download the finished document as a
PDF. Sign in to save documents and revisit them later.

## Structure

- `frontend/` — Next.js app (static export): AI chat, live preview, PDF export,
  auth screens.
- `backend/` — FastAPI (uv) app: chat, catalog/template, auth and saved-document
  APIs; serves the built frontend. Temporary SQLite DB, recreated on startup.
- `templates/` — legal agreement templates (Markdown) from
  [Common Paper](https://github.com/CommonPaper) under CC BY 4.0.
- `catalog.json` — machine-readable index of the available templates.
- `scripts/` — `start-mac.sh` / `stop-mac.sh` to bring the Docker stack up/down.
- `tasks/` — local task descriptions (used in place of a Jira board).

## Running

Requires Docker and an OpenRouter API key.

```bash
cp .env.example .env   # then add your OPENROUTER_API_KEY
scripts/start-mac.sh   # builds and starts the stack at http://localhost:8000
scripts/stop-mac.sh    # stops it
```

The AI chat calls an LLM via LiteLLM → OpenRouter → Cerebras (see the
`cerebras` skill and `CLAUDE.md`).

## License

Project code: MIT (see `LICENSE`).
Legal templates: Creative Commons — see `templates/LICENSE.txt`.
