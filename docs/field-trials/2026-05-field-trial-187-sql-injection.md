# FT187 — SQL injection defence (`escapeLikePattern` + proof sandbox)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT264 (`injectionlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔒
**Tier:** D2 — real-SQLite sandbox attack matrix (executable proof) + a small 🔧 helper

## Objective

Prove node's query layer defeats the three classic SQL injection surfaces, and
close the one gap the proof surfaced.

## Outcome

Started as a proof-only FT. The sandbox **surfaced a real gap**: parameterizing a
`LIKE` value blocks SQL injection but not **wildcard injection** — a bound `%`
still matched every row. Fixed by adding a framework helper.

### 🔧 Framework — `escapeLikePattern`

`src/database/escape-like-pattern.ts`, exported from `src/index.ts`:
`escapeLikePattern(value, escapeChar='\\')` escapes `%` / `_` / the escape char
(O(n), no regex). Pair with a SQL `ESCAPE` clause so user `%`/`_` match
literally. 7 in-tree tests.

### 🔒 Executable proof — `tests/security/sql-injection.test.ts` (CI)

A products API on `SqliteQueryExecutor` (in-memory DB) built with `createApp`,
asserting the FT264 attack matrix and **data integrity** — run in `npm run check`
/ CI (ported in C6 from the local `../nene2-node-FT/ft187-sql-injection/` sandbox,
which remains as an optional `npm run probe` companion):

| Surface            | Attack                                             | Result                          |
| ------------------ | -------------------------------------------------- | ------------------------------- |
| Value injection    | `1; DROP TABLE products; --`                       | 404, **table intact** (4 rows)  |
| Boolean injection  | `1 OR 1=1`                                         | 404 (no bypass)                 |
| LIKE injection     | `' OR '1'='1`                                      | 0 literal matches               |
| Wildcard injection | `%`, `_`                                           | 0 (escaped, no full-table leak) |
| ORDER BY           | `id; DROP TABLE`, `(SELECT 1)`, `price); DELETE--` | 422                             |
| Integrity          | row count after all attacks                        | unchanged (4)                   |
| Positive controls  | `/products/1`, `sort=price`                        | 200 / all rows                  |

## Design notes

- **Parameterization ≠ wildcard safety** — the key teaching. `?` binding stops
  injection; `escapeLikePattern` + `ESCAPE` stops wildcard injection.
- **Three layers reuse prior FTs** — value (executors), ORDER BY (`parseSortQuery`,
  FT179), mass-assignment (`applyMergePatch`, FT183). Only the LIKE-escape helper
  was new.
- **Proof drove the helper** — the executable sandbox, not prose, exposed the gap;
  exactly the deep-FT doctrine in action.

## Friction

`SqliteQueryExecutor` has no built-in LIKE escaping (by design — it can't know
which `?` feeds a LIKE). `escapeLikePattern` makes the secure pattern a one-liner.

## How-to

[docs/how-to/sql-injection-defence.md](../how-to/sql-injection-defence.md)
