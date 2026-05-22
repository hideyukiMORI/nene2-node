# Field trial report — FT127: Unique violation → 409 (D4)

**Date:** 2026-05-22 | **Issue:** [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) | **Sandbox:** `../nene2-node-FT/ft127-unique-409/`

## Validated

- `classifyDatabaseError()` + `resolveHttpError` maps MySQL `ER_DUP_ENTRY` / SQLite UNIQUE → **409 Conflict**
- Vitest: `tests/error/database-constraint-http.test.ts`, MySQL CI `ft127-dup` route

## Friction

### F-1: No standard unique mapper (severity: medium–high) — **resolved**

**Observed:** Duplicate insert surfaced as **500** before 0.1.9.  
**Resolution:** Framework maps unique constraints to Problem Details **409** (`v0.1.9`).

### F-2: Mapper only runs when error reaches `onError` (severity: low) — **accepted**

Repositories that catch and swallow driver errors bypass mapping — app must rethrow or map locally.

## Probes

| Probe                        | Result    |
| ---------------------------- | --------- |
| `ft127-unique-409/probe.mjs` | dup → 409 |

## Follow-up

- **FT130** — Postgres unique in sandbox (optional)
