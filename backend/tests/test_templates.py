from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_mutual_nda_template():
    r = client.get("/api/template/mutual-nda")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "mutual-nda"
    assert "Standard Terms" in body["markdown"]


def test_get_other_template():
    r = client.get("/api/template/cloud-service-agreement")
    assert r.status_code == 200
    assert len(r.json()["markdown"]) > 100


def test_unknown_template_404():
    r = client.get("/api/template/does-not-exist")
    assert r.status_code == 404
