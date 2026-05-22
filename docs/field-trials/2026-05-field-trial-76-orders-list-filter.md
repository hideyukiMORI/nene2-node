# Field trial report — FT76: list / filter / pagination (D4)

**Date:** 2026-05-22 | **Issue:** [#68](https://github.com/hideyukiMORI/nene2-node/issues/68) | **Sandbox:** `../nene2-node-FT/ft076-orders-list-filter/`

## Validated

- `GET /orders?limit=&offset=&label=` on MySQL (**host port 23309**)
- 25 seeded rows; page `limit=10` returns 10; `label=filter-hit` filters
- Invalid `limit=500` → **422**

## Friction

### F-1: `parsePaginationQuery` not exported (severity: medium) — **resolved**

**Observed:** Business apps duplicated pagination parsing or imported deep paths.  
**Resolution:** Export from `@hideyukimori/nene2-framework` package root (**v0.1.7**).

### F-2: Filter SQL is app-owned (severity: low) — **accepted**

Framework provides pagination helper only; `WHERE label = ?` remains in sandbox route handlers.

## Probes

| Probe                                | Result                                      |
| ------------------------------------ | ------------------------------------------- |
| `ft076-orders-list-filter/probe.mjs` | page1 200×10, filtered 200×5, bad limit 422 |

## Follow-up

- **FT77** — compose app+DB+env template
