# Field trial report — FT69: PostgreSQL Docker Compose

**Date:** 2026-05-22 | **Issue:** [#47](https://github.com/hideyukiMORI/nene2-node/issues/47) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)) | **Sandbox:** `../nene2-node-FT/ft069-postgres-compose/`

## Validated

- `docker compose up` — PostgreSQL 16 healthy on port **5433**
- `postgresql://ft069:ft069_pass@127.0.0.1:5433/ft069_app` + `await createApp()` — health **200**, note POST **201** with real `id`

## Friction (resolved in PR)

### F-1: `insert()` returned id 0 on PostgreSQL (severity: high)

**Observed:** `PostgresQueryExecutor.insert()` did not read `SERIAL` id without `RETURNING`.  
**Action:** Append `RETURNING id` in executor when SQL omits it.

## Doc updates

- Sandbox README under `ft069-postgres-compose/`
- `database-layer.md` already documents `postgresql://` URLs (PR #42)

## Follow-up Issues

- **None**
