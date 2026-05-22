# Field trial report — FT72: connection pool settings (D0)

**Date:** 2026-05-22 | **Issue:** [#60](https://github.com/hideyukiMORI/nene2-node/issues/60) | **Difficulty:** D0

## Validated

- Desk review of `mysql2` `connectionLimit` and `pg` `max` — previously hard-coded to 10
- Documented env overrides and single-pool guidance for business apps

## Friction

### F-0: No sandbox run (expected for D0)

No Tier A app probe — documentation and env hooks only.

## Deliverables

- `docs/development/database-connection-pool.md`
- `NENE2_MYSQL_POOL_MAX`, `NENE2_POSTGRES_POOL_MAX` in pool constructors
- Link from `database-layer.md`

## Follow-up

- **FT73** — nested orders sandbox; use `Nene2App.database.executor` pattern ([#57](https://github.com/hideyukiMORI/nene2-node/issues/57))
