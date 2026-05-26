# Field Trial 149 — Content Collection

**Date:** 2026-05-27  
**Source FT:** [NENE2 FT149](../../../NENE2/docs/field-trials/2026-05-field-trial-149.md)  
**Difficulty:** D0 (no framework changes needed)

---

## What was verified

Content collection pattern — public/private curation list with ordered items, idempotent add, and position compaction after delete.

| Pattern                                             | Framework support                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| Nested routes (`/collections/:id/items/:articleId`) | ✅ Hono `c.req.param()`                                               |
| Existence-privacy (GET → 404, mutations → 403)      | ✅ `assertResourceOwner` + custom not-found error                     |
| Idempotent add (201 new / 200 already-added)        | ✅ app-layer `findItem` check; or DB `classifyDatabaseError` → 409    |
| Capacity limit (max 50 items)                       | ✅ app-layer count check before insert                                |
| Position compact after delete                       | ✅ single `UPDATE ... SET position = position - 1 WHERE position > ?` |
| UTC timestamps                                      | ✅ `utcNowIso()`                                                      |
| Atomic delete + compact                             | ✅ `runTransaction`                                                   |

---

## Architecture decisions for nene2-node

### Existence-privacy split

NENE2 uses 404 for GET on non-public collections and 403 for mutations. This maps cleanly:

- GET path: throw a custom `CollectionNotFoundError` (→ 404 via `createSimpleDomainHandler`)
- Mutation paths: `assertResourceOwner()` (→ `ResourceAccessDeniedError` → 403)

No new framework primitives needed.

### Idempotent add — two valid approaches

1. **App-layer pre-check** (`findItem` before `insert`): gives clean 201 / 200 split.
2. **DB UNIQUE constraint** + `classifyDatabaseError`: simpler, returns 409 on duplicate.

Both work equally well with nene2-framework. Document which to prefer in the how-to.

### Position compact atomicity

`DELETE` + `UPDATE position` should be wrapped in `runTransaction` to prevent a partial state if the process crashes between the two statements. nene2-node's `SqliteTransactionManager` / `MysqlTransactionManager` supports this natively.

---

## Friction log

| #   | Friction                                         | Resolution                                                                                |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1   | No built-in "existence-privacy" helper           | Covered by combining `assertResourceOwner` + custom not-found error; documented in how-to |
| 2   | Position management is entirely application code | Expected — no framework change needed; pattern documented                                 |

---

## Deliverables

- `docs/how-to/content-collection.md` ✅
- This report ✅

---

## Conclusion

D0 — nene2-node supports all content collection patterns without framework changes.
`assertResourceOwner`, `classifyDatabaseError`, `runTransaction`, and `utcNowIso` cover every requirement.
