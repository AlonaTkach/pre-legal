import os
from pathlib import Path

# Project root that holds catalog.json and templates/. Overridable for Docker.
DATA_DIR = Path(
    os.environ.get("PRELEGAL_DATA_DIR", Path(__file__).resolve().parents[2])
)

CATALOG_PATH = DATA_DIR / "catalog.json"
TEMPLATES_DIR = DATA_DIR / "templates"

# Built frontend (Next.js `out/`). Empty/nonexistent in local API-only runs.
STATIC_DIR = Path(os.environ.get("PRELEGAL_STATIC_DIR", DATA_DIR / "frontend" / "out"))

# SQLite database file. Recreated fresh on startup.
DB_PATH = Path(os.environ.get("PRELEGAL_DB_PATH", DATA_DIR / "backend" / "prelegal.db"))
