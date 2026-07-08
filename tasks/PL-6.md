# PL-6 — Support all legal document types

**Type:** Feature
**Status:** Done

## Summary

Expand the functionality so it supports all legal document types for which we
have templates (see `catalog.json`). Engage with the user if they want an
unsupported document: explain we can't generate that, but offer the closest
document that we can generate.

## Details

- The AI first helps the user choose which supported document they need.
- Field extraction adapts to the chosen document type.
- Live preview and PDF download work for every document type.
- Enhancements: after answering, UI focus returns to the text input; the AI
  always asks a follow-on question when it needs more information.
