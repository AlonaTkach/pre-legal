import json
from functools import lru_cache

from .config import CATALOG_PATH


@lru_cache
def load_catalog() -> dict:
    with open(CATALOG_PATH, encoding="utf-8") as f:
        return json.load(f)
