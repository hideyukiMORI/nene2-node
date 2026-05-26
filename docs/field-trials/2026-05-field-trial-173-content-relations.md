# Field Trial 173 — Content Relations

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Typed M:N self-referential link table with `relation_type` CHECK constraint
- Automatic inverse insertion: sequel → prequel, prequel → sequel, related → related
- Self-relation guard: reject `article_id === related_id`
- Remove both directions atomically
- Filter relations by type for endpoint-specific queries

## Version

No framework change. Docs-only (D0).
