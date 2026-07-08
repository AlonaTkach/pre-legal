from fastapi.testclient import TestClient

import app.chat as chat_module
from app.chat import ChatResult, NdaFields, run_chat
from app.main import app

client = TestClient(app)


def _fake_result() -> ChatResult:
    return ChatResult(
        reply="Great. What is the effective date?",
        fields=NdaFields(purpose="Evaluate a partnership", governing_law="New York"),
        complete=False,
    )


def test_run_chat_builds_payload_and_returns_result(monkeypatch):
    captured = {}

    def fake_complete(messages, response_format):
        captured["messages"] = messages
        captured["format"] = response_format
        return _fake_result()

    monkeypatch.setattr(chat_module, "complete_structured", fake_complete)

    result = run_chat([chat_module.Message(role="user", content="Hi")])

    # System prompt is prepended, user message preserved.
    assert captured["messages"][0]["role"] == "system"
    assert captured["messages"][-1] == {"role": "user", "content": "Hi"}
    assert captured["format"] is ChatResult
    assert result.fields.governing_law == "New York"
    assert result.complete is False


def test_chat_endpoint(monkeypatch):
    monkeypatch.setattr(chat_module, "complete_structured", lambda m, f: _fake_result())

    r = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "I want an NDA"}]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["complete"] is False
    assert body["fields"]["purpose"] == "Evaluate a partnership"
    assert "effective date" in body["reply"].lower()
