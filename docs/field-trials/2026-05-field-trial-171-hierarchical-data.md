# Field Trial 171 — Hierarchical Data

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Self-referential FK (`parent_id`) + materialized path (`/1/3/7/`) in one table
- INSERT placeholder trick: insert with `'__tmp__'`, then UPDATE path once `id` is known
- Subtree query: `LIKE '/root/%'` in one query — no recursive CTE needed
- Subtree delete: delete descendants first (FK constraint order)
- Move subtree: update all descendant paths in a loop

## Version

No framework change. Docs-only (D0).
