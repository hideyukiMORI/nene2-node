# Domain Layer Policy

Application logic (UseCases, repository interfaces, domain types) stays independent of HTTP frameworks and database drivers. Adapted from NENE2 `docs/development/domain-layer.md` and nene2-python `CLAUDE.md` §2.

## Layer diagram

```text
HTTP Handler (thin adapter)
  → UseCase (business invariants)
    → RepositoryInterface (data contract)
      → ConcreteRepository (SQLite / SQL adapter)
```

Framework infrastructure lives under `src/http/`, `src/middleware/`, `src/config/`, `src/database/`, etc. Example domains live under `src/example/` and are **not** stability-guaranteed public API.

## Domain exception → HTTP

1. Define `DomainError` subclass (e.g. `NoteNotFoundError`).
2. Implement `DomainExceptionHandler` (see `createSimpleDomainHandler` pattern in `note-not-found-handler.ts`).
3. Register in `createApp({ domainHandlers })` — default app includes note + tag not-found handlers.

Handlers call UseCases; catch is not required when the handler is registered.

### Per-entity not-found (Note / Tag)

| Entity | Error               | Handler factory             | Detail message |
| ------ | ------------------- | --------------------------- | -------------- |
| Note   | `NoteNotFoundError` | `createNoteNotFoundHandler` | note-specific  |
| Tag    | `TagNotFoundError`  | `createTagNotFoundHandler`  | tag-specific   |

UseCases throw the error; routes do not catch — `onError` → `resolveHttpError` → handler → 404 `not-found` type.

## UseCase rules

- One public method per use case: `execute(input): output`.
- Input and output are **readonly** TypeScript types (interfaces or classes with `readonly` fields) — never raw `Request`, `Response`, or unstructured `Record<string, unknown>` inside UseCases.
- UseCases do not import Hono, Express, Fastify, or SQL drivers.
- UseCases do not call a DI container or global singletons.
- UseCases may throw **domain exceptions** for invariant violations callers must handle.
- UseCases do not call other UseCases; orchestration belongs in a higher application layer (future) or a thin application service documented in an ADR.

### Input / output DTOs

```typescript
export interface CreateNoteInput {
  readonly title: string;
  readonly body: string;
}

export interface CreateNoteOutput {
  readonly id: number;
  readonly title: string;
  readonly body: string;
}
```

- Format validation (required fields, max length) happens in the **handler** or a dedicated mapper before `execute`.
- Business invariants (uniqueness, state transitions) happen **inside** the UseCase.

## Repository rules

- Interface names: `NoteRepository` or `NoteRepositoryInterface` (pick one style per domain folder and stay consistent).
- Methods use domain language: `findById`, not `selectById`.
- Return `null` or `undefined` for missing entities when absence is normal; throw domain exceptions only when absence indicates a bug or forbidden action.
- All SQL (or query builder usage) stays in concrete repositories under `src/database/` or `src/example/*/repository/`.
- Provide **in-memory** implementations for tests; do not mock the database driver in UseCase tests.

## Handler rules

Handlers are thin: **parse → use case → map response**.

- No business logic in handlers.
- Handlers do not call repositories directly.
- Handlers receive UseCases via constructor injection (composition root / factory module).
- Map domain exceptions to Problem Details at the HTTP error boundary (middleware or handler adapter), not inside UseCases.

## Module layout

Group by **domain concept**, not by technical layer at repo root:

```text
src/example/note/
  create-note-input.ts
  create-note-output.ts
  create-note-use-case.ts
  note-repository.ts
  sqlite-note-repository.ts
  in-memory-note-repository.ts
  create-note-handler.ts
  note-not-found-error.ts
```

Avoid top-level `usecases/`, `repositories/`, `handlers/` directories that scatter one feature.

## Size limits (AI readability)

Inherited from nene2-python:

| Unit                      | Limit               | If exceeded            |
| ------------------------- | ------------------- | ---------------------- |
| One function              | ~30 lines           | Split responsibilities |
| One class / module file   | ~150 lines          | Split module           |
| One domain folder concern | ~300 lines per file | Subfolder              |

## Testing

- **UseCase tests:** no network, no DB — use in-memory repositories.
- **Repository adapter tests:** real SQL against SQLite (test DB); optional MySQL in CI later.
- **HTTP tests:** invoke app in-process (Vitest + fetch to test server or handler test harness); assert status, Problem Details `type`, and body shape.

Test names: `describe('CreateNoteUseCase')` + `it('throws when title is duplicate')` — behavior-oriented English.

## Error handling

- Domain errors: `NoteNotFoundError`, `NoteAlreadyExistsError` — extend a small `DomainError` base if useful.
- Register mappings in a single error middleware module (Phase 2).
- Never expose SQL, stack traces, or secrets in public JSON.

## Non-goals

- Active-record ORM models in domain code.
- OpenAPI or DB schema codegen as the source of truth for domain types.
- Service locator inside UseCases.
- Business logic in middleware.

## References

- NENE2: `../NENE2/docs/development/domain-layer.md`
- nene2-python: `../nene2-python/CLAUDE.md` §2
