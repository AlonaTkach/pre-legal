import json
from functools import lru_cache

from .config import CATALOG_PATH, DATA_DIR


@lru_cache
def load_catalog() -> dict:
    with open(CATALOG_PATH, encoding="utf-8") as f:
        return json.load(f)


def find_template(template_id: str) -> dict | None:
    for t in load_catalog()["templates"]:
        if t["id"] == template_id:
            return t
    return None


def read_template_markdown(template_id: str) -> str | None:
    """Return the standard-terms markdown for a template id, or None."""
    template = find_template(template_id)
    if not template:
        return None
    rel = template["files"].get("standard_terms")
    if not rel:
        return None
    path = DATA_DIR / rel
    if not path.is_file():
        return None
    return path.read_text(encoding="utf-8")
