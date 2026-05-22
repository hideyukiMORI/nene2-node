# Field trial report — FT75: order + items in one transaction (D4)

**Date:** 2026-05-22 | **Issue:** [#65](https://github.com/hideyukiMORI/nene2-node/issues/65) | **Sandbox:** `../nene2-node-FT/ft075-order-transaction/`

## Validated

- `MysqlTransactionManager.transactional()` — commit on success, rollback on error
- Exposed via `nene2.database.transactionManager` (MySQL + SQLite; PostgreSQL not yet)
- CI / local MySQL integration test + `ft075-order-transaction/probe.mjs`

## Friction

### F-1: No transaction manager on `Nene2App` (severity: high) — **resolved**

**Observed:** Apps could not run multi-statement business writes atomically on MySQL without raw `mysql2` connections.  
**Resolution:** `MysqlTransactionManager` wired in `createDatabaseRuntime()` / `Nene2App.database`.

### F-2: PostgreSQL lacks `transactionManager` (severity: medium) — **open**

**Observed:** `database.transactionManager` is undefined for `postgresql://` URLs.  
**Follow-up:** Add `PostgresTransactionManager` in a later FT.

## Probes

| Probe                               | Result                             |
| ----------------------------------- | ---------------------------------- |
| `mysql-integration` rollback test   | pass (CI)                          |
| `ft075-order-transaction/probe.mjs` | commit 201, rollback leaves 0 rows |
