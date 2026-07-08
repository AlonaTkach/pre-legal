# PL-5 — Add AI chat (still just mutual NDA)

**Type:** Feature
**Status:** Done

## Summary

Change the way the platform interacts with a user. Instead of a series of form
questions, this should be a free-form chat with an AI. The AI asks questions
related to the document fields and populates the document based on the
responses.

## Details

- The chat UI **replaces** the form entirely.
- The document preview updates **live** as fields are filled.
- The AI **greets and asks the first question**; it always asks a follow-on
  question when it needs more information.
- When all required fields are filled, the AI confirms and the download becomes
  available.
- Scope: still only the **mutual NDA** document.
- Use the **cerebras** skill: a single LLM call with **structured outputs**
  returning both the assistant reply and the extracted fields (no streaming).
