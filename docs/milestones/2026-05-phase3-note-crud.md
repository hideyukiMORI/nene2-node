# Milestone — Phase 3: Example Note CRUD

**Status:** Planned  
**Depends on:** Phase 2

## Goal

Full `/examples/notes` reference domain — clean architecture, SQLite tests, OpenAPI parity.

## Acceptance criteria

- [ ] `src/example/note/` — entity, `*Input`/`*Output`, UseCases, repository interface
- [ ] `InMemoryNoteRepository` + `SqliteNoteRepository`
- [ ] Handlers: list, get, create, update, delete (204 on delete)
- [ ] `NoteNotFoundError` → 404 Problem Details
- [ ] Validation at HTTP boundary (Zod or Valibot — ADR if needed)
- [ ] OpenAPI contract tests for all note operations
- [ ] UseCase unit tests without DB; adapter tests with SQLite
- [ ] No Hono imports in UseCase or repository interfaces

## Reference

- NENE2: `src/Example/Note/`
- nene2-python: `nene2/example/note/` (if present) or `example/note`
