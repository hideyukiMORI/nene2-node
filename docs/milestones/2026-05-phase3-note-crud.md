# Milestone — Phase 3: Example Note CRUD

**Status:** Complete (2026-05-22) — [#13](https://github.com/hideyukiMORI/nene2-node/issues/13)  
**Depends on:** Phase 2

## Goal

Full `/examples/notes` reference domain — clean architecture, SQLite tests, OpenAPI parity.

## Acceptance criteria

- [x] `src/example/note/` — entity, `*Input`/`*Output`, UseCases, repository interface
- [x] `InMemoryNoteRepository` + `SqliteNoteRepository` (`node:sqlite`)
- [x] Handlers: list, get, create, update, delete (204 on delete)
- [x] `NoteNotFoundError` → 404 Problem Details
- [x] Validation at HTTP boundary (manual, parity with NENE2 PHP)
- [x] OpenAPI contract tests for note list + create/get
- [x] UseCase unit tests without DB; adapter tests with SQLite
- [x] No Hono imports in UseCase or repository interfaces

## Reference

- NENE2: `src/Example/Note/`
- nene2-python: `nene2/example/note/` (if present) or `example/note`
