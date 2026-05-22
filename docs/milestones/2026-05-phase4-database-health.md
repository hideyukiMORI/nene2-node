# Milestone — Phase 4: Database and health

**Status:** Planned  
**Depends on:** Phase 3

## Goal

Database adapter boundaries and degradable `/health` when DB check fails.

## Acceptance criteria

- [ ] `DatabaseQueryExecutor` / `DatabaseTransactionManager` interfaces
- [ ] SQLite executor for tests and local dev
- [ ] `DatabaseHealthCheck` integrated into `/health` → 503 degraded
- [ ] Optional Docker MySQL job in CI (stretch)

## Reference

- NENE2: `src/Database/`
- nene2-python: `nene2/database/`
