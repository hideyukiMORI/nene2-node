# Field trial report — FT145: MySQL read replica Compose E2E (D3)

**Date:** 2026-05-22 | **Issue:** [#85](https://github.com/hideyukiMORI/nene2-node/issues/85) | **Sandbox:** `../nene2-node-FT/ft145-mysql-read-replica/`

## Validated

- `NENE2_NODE_DATABASE_READ_URL` with MySQL 8 — `readExecutor !== executor` (separate pools)
- Write via HTTP POST `/examples/notes`, read row via `readExecutor.fetchOne`
- Schema bootstrap on both pools via `createApp()`

## Friction

### F-1: Compose lives outside framework repo — **documented**

Recipe in `docs/development/mysql-read-replica-e2e.md`.

### F-2: Same host for read URL in dev — **documented**

Separate pool objects; production should point read URL at replica hostname.

### F-3: No automatic query routing — **accepted** (unchanged from FT134)

## Probes

| Probe                                     | Result            |
| ----------------------------------------- | ----------------- |
| `ft145-mysql-read-replica/probe.mjs`      | OK (MySQL 23310)  |
| `tests/app/database-read-replica.test.ts` | SQLite alias (CI) |
