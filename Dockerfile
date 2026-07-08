# --- Stage 1: build the Next.js frontend as a static export ---
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: FastAPI backend serving the API + built frontend ---
FROM python:3.12-slim AS runtime
RUN pip install --no-cache-dir uv
WORKDIR /app

# Backend dependencies (recreated in-image; host .venv is dockerignored).
COPY backend/ ./backend/
RUN cd backend && uv sync --frozen --no-dev

# Data consumed by the API.
COPY catalog.json ./catalog.json
COPY templates/ ./templates/

# Built frontend from stage 1.
COPY --from=frontend /app/frontend/out ./frontend/out

ENV PRELEGAL_DATA_DIR=/app \
    PRELEGAL_STATIC_DIR=/app/frontend/out \
    PRELEGAL_DB_PATH=/app/backend/prelegal.db

EXPOSE 8000
CMD ["sh", "-c", "cd backend && uv run --no-dev uvicorn app.main:app --host 0.0.0.0 --port 8000"]
