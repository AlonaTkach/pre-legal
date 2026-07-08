#!/usr/bin/env bash
# Stop the pre-legal stack.
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose down

echo "pre-legal stopped."
