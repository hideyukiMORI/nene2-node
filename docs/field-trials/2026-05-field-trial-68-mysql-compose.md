# Field trial report — FT68: MySQL Docker Compose friction

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Sandbox:** `../nene2-node-FT/ft068-mysql-compose/`

## Validated

- `docker compose up` — MySQL 8.4 healthy on port **3308**
- `mysql://ft068:ft068_pass@127.0.0.1:3308/ft068_app` + `await createApp()` — **works** (health 200, note CRUD 201)

## Friction (resolved)

### F-1: Misleading SQLite error for mysql:// URL (severity: high)

**Observed:** Error was `unable to open database file` (SQLite driver).  
**Action:** [#40](https://github.com/hideyukiMORI/nene2-node/issues/40) — interim `assertSqliteDatabaseUrl()` (PR #41)  
**Resolution:** MySQL adapter + `createDatabaseRuntime()` — no longer rejects `mysql://`

### F-2: No MySQL executor (severity: high)

**Observed:** Framework had port only; no `mysql2` adapter.  
**Action:** [#37](https://github.com/hideyukiMORI/nene2-node/issues/37)  
**Resolution:** `MysqlQueryExecutor`, async `createApp()`

## Doc updates

- `database-layer.md` — MySQL/PostgreSQL URLs
- `consumer-quickstart.md` — async `createApp`, peer dep
- Compose recipe in sandbox README

## Follow-up Issues

- **None** — #37, #38, #39, #40 addressed in framework PR (closes via PR body)
