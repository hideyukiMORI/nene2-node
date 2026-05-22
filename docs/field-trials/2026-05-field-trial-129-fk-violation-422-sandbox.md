# Field trial report — FT129: FK violation → 422 (D4)

**Date:** 2026-05-22 | **Issue:** [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) | **Sandbox:** `../nene2-node-FT/ft129-fk-422/`

## Validated

- FK errors map to **422 Validation Failed** via `resolveHttpError`
- SQLite requires `PRAGMA foreign_keys = ON` (documented)

## Friction

### F-1: No FK mapper (severity: medium–high) — **resolved**

**Resolution:** `classifyDatabaseError` + **422** (**v0.1.9**).

### F-2: SQLite FK off by default (severity: medium) — **documented**

**Observed:** Without PRAGMA, invalid parent_id insert may not throw.  
**Action:** [database-constraint-errors.md](../development/database-constraint-errors.md)

## Probes

| Probe                    | Result (with PRAGMA) |
| ------------------------ | -------------------- |
| `ft129-fk-422/probe.mjs` | bad parent → 422     |
