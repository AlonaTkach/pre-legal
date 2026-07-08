---
name: cerebras
description: Use this to write code to call an LLM using LiteLLM and OpenRouter with the Cerebras inference provider (very fast). Supports structured outputs via Pydantic.
---

# Calling an LLM via Cerebras

These instructions let you write Python code to call an LLM with **Cerebras**
specified as the inference provider, routed through **OpenRouter** using
**LiteLLM**. Cerebras returns responses extremely fast, so streaming is
unnecessary — a single call returns the full response.

## Setup

- The API key lives in the `OPENROUTER_API_KEY` environment variable (loaded
  from the project-root `.env`). Never hard-code it.
- Model: `openrouter/openai/gpt-oss-120b`.
- Force the Cerebras provider by passing `extra_body={"provider": {"order": ["cerebras"], "allow_fallbacks": false}}`.
- Dependencies (add with `uv add`): `litellm`, `pydantic`, `python-dotenv`.

## Imports and constants

```python
import os
from dotenv import load_dotenv
import litellm

load_dotenv()

MODEL = "openrouter/openai/gpt-oss-120b"
# Route strictly to Cerebras for speed; do not fall back to slower providers.
CEREBRAS_PROVIDER = {"provider": {"order": ["cerebras"], "allow_fallbacks": False}}
```

## Plain call

```python
def call_llm(messages: list[dict]) -> str:
    response = litellm.completion(
        model=MODEL,
        messages=messages,
        api_key=os.environ["OPENROUTER_API_KEY"],
        extra_body=CEREBRAS_PROVIDER,
    )
    return response.choices[0].message.content
```

## Structured outputs

Use a Pydantic model so you can interpret the result and populate fields in the
legal document. Pass the model to `response_format`; LiteLLM enforces the JSON
schema and you parse the returned JSON back into the model.

```python
from pydantic import BaseModel

class ExtractedFields(BaseModel):
    reply: str                 # what to say back to the user
    purpose: str | None = None
    governing_law: str | None = None
    # ...add the fields your document needs...

def call_llm_structured(messages: list[dict]) -> ExtractedFields:
    response = litellm.completion(
        model=MODEL,
        messages=messages,
        api_key=os.environ["OPENROUTER_API_KEY"],
        extra_body=CEREBRAS_PROVIDER,
        response_format=ExtractedFields,
    )
    content = response.choices[0].message.content
    return ExtractedFields.model_validate_json(content)
```

## Notes

- One call returns both the assistant's reply text and the extracted fields —
  keep the `reply` field in the schema so you avoid a second round-trip.
- Do not add streaming; Cerebras is fast enough that it adds complexity for no
  benefit.
- For testing, mock `litellm.completion` so tests never make live paid calls.
