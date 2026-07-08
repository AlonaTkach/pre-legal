import json

from pydantic import BaseModel

from .catalog import load_catalog
from .llm import complete_structured


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class LlmChatResult(BaseModel):
    """Schema the LLM fills. `fields_json` is a JSON object string because the
    Cerebras structured-output API rejects open-ended objects."""

    reply: str
    document_type: str | None = None
    fields_json: str = "{}"
    complete: bool = False


class ChatResult(BaseModel):
    """Public API shape returned to the frontend."""

    reply: str
    document_type: str | None = None
    fields: dict[str, str] = {}
    complete: bool = False


def _available_documents() -> str:
    catalog = load_catalog()
    return "\n".join(
        f"- {t['id']}: {t['name']} — {t['description']}" for t in catalog["templates"]
    )


def build_system_prompt() -> str:
    return f"""\
You are pre-legal's drafting assistant. You help a user draft a legal agreement
by chatting with them.

These are the ONLY document types we support (use the id as document_type):
{_available_documents()}

Flow:
1. First determine which supported document the user wants. Set `document_type`
   to its catalog id once it is clear.
2. If the user asks for a document we do NOT support, explain that we can't
   generate that one, and offer the closest supported document from the list.
   Leave `document_type` null until they pick a supported one.
3. Once a document is chosen, collect the fields needed to fill it in, asking
   for ONE piece of information at a time.

`fields_json` must be a JSON object string mapping snake_case field keys to
string values, e.g. {{"purpose": "Evaluate a partnership", "governing_law": "New York"}}.
- Always carry forward everything gathered earlier.
- For the mutual NDA (document_type = "mutual-nda") use exactly these keys:
  purpose, effective_date (ISO yyyy-mm-dd), mnda_term_years,
  confidentiality_term_years, governing_law, jurisdiction,
  party1_company, party1_name, party1_title, party1_notice,
  party2_company, party2_name, party2_title, party2_notice.
- For other documents choose sensible snake_case keys (party names,
  effective_date, term, governing_law, amounts, and other specifics).

Rules:
- Keep replies short and friendly. ALWAYS end with the next question while
  information is still missing — never leave the user without a next step.
- Set `complete` to true only when you have enough to draft the document; then
  `reply` should confirm it is ready to download.
- Return the full current state every turn.\
"""


def _parse_fields(fields_json: str) -> dict[str, str]:
    try:
        data = json.loads(fields_json or "{}")
    except json.JSONDecodeError:
        return {}
    if not isinstance(data, dict):
        return {}
    return {str(k): str(v) for k, v in data.items() if v not in (None, "")}


def run_chat(messages: list[Message]) -> ChatResult:
    payload = [{"role": "system", "content": build_system_prompt()}]
    payload += [{"role": m.role, "content": m.content} for m in messages]
    llm = complete_structured(payload, LlmChatResult)
    return ChatResult(
        reply=llm.reply,
        document_type=llm.document_type,
        fields=_parse_fields(llm.fields_json),
        complete=llm.complete,
    )
