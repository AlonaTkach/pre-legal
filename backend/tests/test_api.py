from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db, get_connection

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_catalog_lists_templates():
    r = client.get("/api/catalog")
    assert r.status_code == 200
    body = r.json()
    assert "templates" in body
    assert len(body["templates"]) >= 1
    ids = {t["id"] for t in body["templates"]}
    assert "mutual-nda" in ids


def test_login_placeholder():
    r = client.post("/api/auth/login", json={"email": "a@b.com", "password": "x"})
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_init_db_creates_users_table(tmp_path):
    db = tmp_path / "test.db"
    init_db(db)
    conn = get_connection(db)
    try:
        row = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
        ).fetchone()
        assert row is not None
    finally:
        conn.close()


def test_init_db_is_fresh_each_time(tmp_path):
    db = tmp_path / "test.db"
    init_db(db)
    conn = get_connection(db)
    conn.execute(
        "INSERT INTO users (email, password_hash) VALUES ('x@y.com', 'h')"
    )
    conn.commit()
    conn.close()

    # Re-initializing must wipe prior rows.
    init_db(db)
    conn = get_connection(db)
    try:
        count = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()["n"]
        assert count == 0
    finally:
        conn.close()
