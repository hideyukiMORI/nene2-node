# FT179 — ORDER BY injection prevention (`parseSortQuery`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT341 (`sortlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do (🔧 framework + 🔒 security)
**Tier:** D3 — framework helper proven by a sandbox attack matrix (executable, not prose)

## Objective

A sortable/filterable list endpoint must interpolate the `ORDER BY` column
(placeholders are not allowed there), which makes ORDER BY injection possible.
node had no helper to enforce a column/direction allowlist. Close that gap and
**prove** the defence with runnable attacks.

## Deliverable

### 🔧 Framework — `src/http/sort-query.ts`

`parseSortQuery(searchParams, { columns, defaultColumn, defaultOrder? })` →
`{ column, order }`:

- `sort` / `order` matched by **exact, case-sensitive `Array.includes`** (O(n),
  no regex → ReDoS-immune). Not in the allowlist → `ValidationException` (422).
- Absent/empty → `defaultColumn` / `defaultOrder` (`desc`).
- Misconfiguration guard: `defaultColumn` outside `columns` throws a plain
  `Error` (programmer error, not user input).

Exported from `src/index.ts`. 27 in-tree Vitest tests
(`tests/http/sort-query.test.ts`).

### 🔒 Sandbox — `../nene2-node-FT/ft179-sort-injection/`

A realistic `GET /articles` endpoint (sort + order + status + pagination) over
an in-memory dataset, with `probe.mjs` running the full FT341 attack matrix via
`app.request`. Run: `npm install && npm run probe`.

## Attack matrix result (executable proof)

| Class             | Examples                                              | Result           |
| ----------------- | ----------------------------------------------------- | ---------------- |
| Valid requests    | defaults, `sort=title&order=asc`, `status=draft`      | **200** ✅       |
| SQLi in `sort`    | `'; DROP TABLE--`, `UNION SELECT…`, `(SELECT…)`, CASE | **422 BLOCKED**  |
| Comment / index   | `created_at--`, `sort=1`                              | **422 BLOCKED**  |
| Wrong case        | `ID`, `Created_At`                                    | **422 BLOCKED**  |
| Whitespace bypass | leading space, TAB                                    | **422 BLOCKED**  |
| `order` injection | `asc; UNION…`, `DESC;`, `ASC`, `rand()`               | **422 BLOCKED**  |
| `status` filter   | `' OR '1'='1`, `UNION`, `1`, `TRUE`                   | **422 BLOCKED**  |
| `limit` injection | `999999`, 22-digit overflow, `-1`, `10.5`             | **422 BLOCKED**  |
| ReDoS             | 50,000-char `sort` payload                            | **422 in ~2 ms** |

All 23 attacks BLOCKED; 4 valid requests 200. No EXPOSED.

## Design notes

- **Allowlist over regex** — `Array.includes` short-circuits; immune to ReDoS and
  it cannot admit unknown columns (`password`) the way `/^[a-z_]+$/` would.
- **Case-sensitive** — `ORDER BY CREATED_AT` is valid SQL, so `Created_At` must
  be rejected, not normalised.
- **Array keys** — `?sort[]=x` parses to key `sort[]`, so `get('sort')` is null
  → default; no multi-column injection path.
- **`status` allowlist stays caller-side** — it is an app-domain value list, not
  a framework concern; the helper owns only `sort`/`order`.

## Friction

None. `parseSortQuery` slotted into the existing `ValidationException` → 422
pipeline with no framework changes elsewhere.

## How-to

[docs/how-to/dynamic-sort-injection.md](../how-to/dynamic-sort-injection.md)
