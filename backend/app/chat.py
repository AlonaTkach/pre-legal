from pydantic import BaseModel

from .llm import complete_structured


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class NdaFields(BaseModel):
    purpose: str | None = None
    effective_date: str | None = None  # ISO yyyy-mm-dd
    mnda_term_years: int | None = None
    confidentiality_term_years: int | None = None
    governing_law: str | None = None  # US state
    jurisdiction: str | None = None  # city/county and state
    party1_company: str | None = None
    party1_name: str | None = None
    party1_title: str | None = None
    party1_notice: str | None = None
    party2_company: str | None = None
    party2_name: str | None = None
    party2_title: str | None = None
    party2_notice: str | None = None


class ChatResult(BaseModel):
    reply: str
    fields: NdaFields
    complete: bool


SYSTEM_PROMPT = """\
You are pre-legal's drafting assistant. You help a user complete a Mutual
Non-Disclosure Agreement (MNDA) by chatting with them.

Collect these fields:
- purpose (how confidential information may be used)
- effective_date (ISO yyyy-mm-dd; interpret "today" using the user's intent)
- mnda_term_years (integer number of years)
- confidentiality_term_years (integer number of years)
- governing_law (a US state)
- jurisdiction (city/county and state)
- party1_company, party1_name, party1_title, party1_notice (email or address)
- party2_company, party2_name, party2_title, party2_notice

Rules:
- Ask for ONE piece of information at a time. Keep replies short and friendly.
- ALWAYS extract everything the user has stated so far into `fields`, and
  ALWAYS carry forward values already provided earlier in the conversation.
- ALWAYS end your reply by asking the next question when information is still
  missing. Never leave the user without a next step.
- Set `complete` to true only once every field above has a value. When
  complete, `reply` should confirm the MNDA is ready to download.
- Return the full current field state every turn.\
"""


def run_chat(messages: list[Message]) -> ChatResult:
    payload = [{"role": "system", "content": SYSTEM_PROMPT}]
    payload += [{"role": m.role, "content": m.content} for m in messages]
    return complete_structured(payload, ChatResult)
