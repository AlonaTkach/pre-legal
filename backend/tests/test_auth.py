import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def fresh_db():
    # Reset the shared temporary DB before each test.
    init_db()
    yield


def _signup(email="a@b.com", password="secret1"):
    return client.post("/api/auth/signup", json={"email": email, "password": password})


def test_signup_returns_token():
    r = _signup()
    assert r.status_code == 200
    assert r.json()["token"]
    assert r.json()["email"] == "a@b.com"


def test_signup_rejects_short_password():
    r = _signup(password="123")
    assert r.status_code == 400


def test_signup_duplicate_email():
    _signup()
    r = _signup()
    assert r.status_code == 409


def test_login_success_and_failure():
    _signup(email="x@y.com", password="secret1")
    ok = client.post("/api/auth/login", json={"email": "x@y.com", "password": "secret1"})
    assert ok.status_code == 200
    bad = client.post("/api/auth/login", json={"email": "x@y.com", "password": "nope"})
    assert bad.status_code == 401


def test_documents_require_auth():
    assert client.get("/api/documents").status_code == 401


def test_save_list_and_get_document():
    token = _signup().json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    save = client.post(
        "/api/documents",
        headers=headers,
        json={
            "name": "Mutual NDA",
            "document_type": "mutual-nda",
            "fields": {"governing_law": "New York"},
        },
    )
    assert save.status_code == 200
    doc_id = save.json()["id"]

    listing = client.get("/api/documents", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1
    assert listing.json()[0]["name"] == "Mutual NDA"

    fetched = client.get(f"/api/documents/{doc_id}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["fields"]["governing_law"] == "New York"


def test_users_cannot_read_each_others_documents():
    t1 = _signup(email="one@x.com").json()["token"]
    t2 = _signup(email="two@x.com").json()["token"]
    doc_id = client.post(
        "/api/documents",
        headers={"Authorization": f"Bearer {t1}"},
        json={"name": "Doc", "document_type": "mutual-nda", "fields": {}},
    ).json()["id"]

    r = client.get(
        f"/api/documents/{doc_id}", headers={"Authorization": f"Bearer {t2}"}
    )
    assert r.status_code == 404
