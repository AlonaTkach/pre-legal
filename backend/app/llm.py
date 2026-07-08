import os
from typing import TypeVar

import litellm
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

# See the `cerebras` skill: LiteLLM -> OpenRouter -> Cerebras provider.
MODEL = "openrouter/openai/gpt-oss-120b"
CEREBRAS_PROVIDER = {"provider": {"order": ["cerebras"], "allow_fallbacks": False}}

T = TypeVar("T", bound=BaseModel)


def complete_structured(messages: list[dict], response_format: type[T]) -> T:
    """One fast call returning a validated Pydantic model (no streaming)."""
    response = litellm.completion(
        model=MODEL,
        messages=messages,
        api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        extra_body=CEREBRAS_PROVIDER,
        response_format=response_format,
    )
    content = response.choices[0].message.content
    return response_format.model_validate_json(content)
