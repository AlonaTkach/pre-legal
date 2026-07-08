#!/usr/bin/env bash
# Build and start the full pre-legal stack (frontend + backend) in Docker.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found. Copy .env.example to .env and add your OPENROUTER_API_KEY." >&2
  exit 1
fi

docker compose up --build -d

echo
echo "pre-legal is starting at http://localhost:8000"
echo "Stop it with scripts/stop-mac.sh"
