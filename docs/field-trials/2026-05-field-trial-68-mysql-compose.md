# Field trial report — FT68: MySQL Docker Compose friction

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Sandbox:** `../nene2-node-FT/ft068-mysql-compose/`

## Validated

- `docker compose up` — MySQL 8.4 healthy on port **3308**
- `NENE2_NODE_DATABASE_URL=mysql://...` + `createApp()` — **fails** (expected: no adapter)

## Friction

### F-1: Misleading SQLite error for mysql:// URL (severity: high)

**Observed:** Error was `unable to open database file` (SQLite driver).  
**Action:** [#40](https://github.com/hideyukiMORI/nene2-node/issues/40) — `assertSqliteDatabaseUrl()` with message pointing to #37

### F-2: No MySQL executor (severity: high — known gap)

**Observed:** Framework has port only; no `mysql2` adapter.  
**Action:** [#37](https://github.com/hideyukiMORI/nene2-node/issues/37)

## Doc updates

- `database-layer.md` — non-SQLite URLs
- Compose recipe in sandbox README

## Follow-up Issues

- #37 — MySQL adapter
- #38 — PostgreSQL adapter
- #40 — clear URL validation (fix in PR)
