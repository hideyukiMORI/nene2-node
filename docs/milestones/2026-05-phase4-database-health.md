# Milestone — Phase 4: Database and health

**Status:** Complete (2026-05-22) — [#16](https://github.com/hideyukiMORI/nene2-node/issues/16)  
**Depends on:** Phase 3

## Goal

Database adapter boundaries and degradable `/health` when DB check fails.

## Acceptance criteria

- [x] `DatabaseQueryExecutor` / `DatabaseTransactionManager` interfaces
- [x] SQLite executor for tests and local dev (`node:sqlite`)
- [x] `DatabaseHealthCheck` integrated into `/health` → 503 degraded
- [ ] Optional Docker MySQL job in CI (stretch)

## Reference

- NENE2: `src/Database/`
- nene2-python: `nene2/database/`
