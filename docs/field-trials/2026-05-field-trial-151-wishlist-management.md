# Field Trial 151 — Wishlist Management

**Date:** 2026-05-27  
**Source FT:** NENE2 FT151  
**Difficulty:** D0 (no framework changes)

## What was verified

Same existence-privacy and idempotent-add patterns as FT149 (Content Collection) but without position management. Priority enum validation with optional fallback-to-default documented.

| Pattern                                        | Framework support           |
| ---------------------------------------------- | --------------------------- |
| Existence-privacy (GET → 404, mutations → 403) | ✅ same as FT149            |
| Idempotent item add 201/200                    | ✅ app-layer pre-check      |
| Priority enum validation                       | ✅ `ValidationException`    |
| No position management                         | ✅ N/A — simpler than FT149 |

## Friction log

None.

## Deliverables

- `docs/how-to/wishlist-management.md` ✅
