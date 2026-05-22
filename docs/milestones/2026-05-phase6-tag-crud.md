# Milestone — Phase 6: Example Tag CRUD

**Status:** Complete (2026-05-22) — [#25](https://github.com/hideyukiMORI/nene2-node/issues/25)  
**Depends on:** Phase 3 (Note CRUD), Phase 4 (SQLite)

## Goal

Full `/examples/tags` reference domain — same clean-architecture pattern as notes, OpenAPI parity.

## Acceptance criteria

- [x] `src/example/tag/` — entity, UseCases, repository interface
- [x] `InMemoryTagRepository` + `SqliteTagRepository`
- [x] Handlers: list, get, create, update, delete (204 on delete)
- [x] `TagNotFoundError` → 404 Problem Details
- [x] Validation: `name` required (422)
- [x] `ensureExamplesSchema()` — notes + tags tables
- [x] Wired in `createApp()` with shared SQLite executor when `NENE2_NODE_DATABASE_URL` set
- [x] OpenAPI contract tests + HTTP integration tests

## Reference

- NENE2 OpenAPI: `/examples/tags`
- nene2-python: `example/tag/` (parity)
