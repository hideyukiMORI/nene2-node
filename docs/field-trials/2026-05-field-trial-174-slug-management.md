# Field Trial 174 — Slug Management

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Slug generation: lowercase, diacritic-strip, non-alphanumeric remove, whitespace → hyphen
- Collision resolution: append `-2`, `-3`, … until unique
- History table `slug_history` for 301 redirects of old slugs
- `INSERT OR IGNORE` to safely re-record already-historicized slugs
- Redirect lookup: check canonical → check history → 301 or 404

## Version

No framework change. Docs-only (D0).
