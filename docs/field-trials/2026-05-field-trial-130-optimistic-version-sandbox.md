# Field trial report — FT130: Optimistic version / If-Match (D4)

**Date:** 2026-05-22 | **Issue:** [#75](https://github.com/hideyukiMORI/nene2-node/issues/75) | **Sandbox:** `../nene2-node-FT/ft130-optimistic-version/`

## Validated

- `parseIfMatchVersion`, `assertRowsAffected`, `VersionConflictError` + `createVersionConflictHandler` → **409**
- Vitest + `ft130-optimistic-version/probe.mjs`

## Friction

### F-1: No ETag/version helper (FT85) — **resolved**

**Observed:** Stale `UPDATE` returned 0 rows → **500** or silent no-op.  
**Resolution:** `assertRowsAffected` + domain handler (**v0.1.10**).

### F-2: SQL still app-owned (severity: low) — **accepted**

Framework does not generate `UPDATE … WHERE version = ?` strings.

## Probes

| Probe                                | Result              |
| ------------------------------------ | ------------------- |
| `ft130-optimistic-version/probe.mjs` | stale version → 409 |

## Follow-up

- Postgres/MySQL sandbox parity (optional)
