from fastapi.testclient import TestClient

import app.chat as chat_module
from app.chat import ChatResult, LlmChatResult, build_system_prompt, run_chat
from app.main import app

client = TestClient(app)


def _fake_llm_result() -> LlmChatResult:
    return LlmChatResult(
        reply="Great. What is the effective date?",
        document_type="mutual-nda",
        fields_json='{"purpose": "Evaluate a partnership", "governing_law": "New York"}',
        complete=False,
    )


def test_system_prompt_lists_supported_documents():
    prompt = build_system_prompt()
    assert "mutual-nda" in prompt
    # Another catalog document should also be listed.
    assert "cloud-service-agreement" in prompt


def test_run_chat_builds_payload_and_returns_result(monkeypatch):
    captured = {}

    def fake_complete(messages, response_format):
        captured["messages"] = messages
        captured["format"] = response_format
        return _fake_llm_result()

    monkeypatch.setattr(chat_module, "complete_structured", fake_complete)

    result = run_chat([chat_module.Message(role="user", content="I need an NDA")])

    assert captured["messages"][0]["role"] == "system"
    assert captured["messages"][-1] == {"role": "user", "content": "I need an NDA"}
    assert captured["format"] is LlmChatResult
    assert isinstance(result, ChatResult)
    assert result.document_type == "mutual-nda"
    assert result.fields["governing_law"] == "New York"
    assert result.complete is False


def test_parse_fields_ignores_bad_json():
    from app.chat import _parse_fields

    assert _parse_fields("not json") == {}
    assert _parse_fields('{"a": "1", "b": null, "c": ""}') == {"a": "1"}


def test_chat_endpoint(monkeypatch):
    monkeypatch.setattr(
        chat_module, "complete_structured", lambda m, f: _fake_llm_result()
    )

    r = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "I want an NDA"}]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["document_type"] == "mutual-nda"
    assert body["fields"]["purpose"] == "Evaluate a partnership"
    assert body["complete"] is False
