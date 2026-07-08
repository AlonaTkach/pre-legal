# PL-4 — Build foundation of V1 product

**Type:** Technical foundation
**Status:** To Do

## Summary

Upgrade the prototype so that it is the proper technical foundation for the full
V1 project, including front end, back end and a temporary database with scripts
to start and stop — but without updating the product features yet.

## Details

- Reorganize into `frontend/` (Next.js) and `backend/` (uv + FastAPI).
- Temporary **SQLite** database, created from scratch each time the container
  starts.
- `scripts/start-mac.sh` and `scripts/stop-mac.sh` to bring the stack up/down.
- Package everything into a **Docker** container (multi-stage build).
- Only have a **fake login screen** for now. **No authentication** — just bring
  the user into the platform.
- Do not change the existing NDA functionality yet.
