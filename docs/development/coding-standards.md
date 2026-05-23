# Coding Standards

Implementation style for nene2-node. These rules inherit intent from NENE2 `docs/development/coding-standards.md` and nene2-python `CLAUDE.md`, adapted to TypeScript and Node.js.

**Policy index:** `engineering-policy.md`

## TypeScript baseline

- **Strict** compiler options in `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- ESLint `strictTypeChecked` on `src/**/*.ts` (see `quality-tools.md`).
- **`any` is forbidden** in `src/` except with ADR + `@ts-expect-error` and issue reference.
- Prefer `readonly` properties, `interface` for DTOs, and narrow unions over loose strings.
- Use `unknown` + type guards at HTTP/JSON boundaries; never trust `as Foo` without validation.
- Avoid `!` non-null assertions; narrow instead.
- Prefer named exports; no default exports on **library public API** unless an ADR allows.
- Target **Node.js LTS** (`engines` in `package.json`).

## Naming

| Kind                        | Convention                                              | Example                   |
| --------------------------- | ------------------------------------------------------- | ------------------------- |
| Classes / types             | PascalCase                                              | `CreateNoteUseCase`       |
| Functions / variables       | camelCase                                               | `findById`                |
| Constants                   | UPPER_SNAKE_CASE                                        | `MAX_PAGE_SIZE`           |
| Private fields              | `_` prefix optional; prefer `private` keyword           | `_repository`             |
| Repository interface        | `NoteRepository`                                        |                           |
| UseCase input / output      | `CreateNoteInput`, `CreateNoteOutput`                   |                           |
| HTTP body schema (boundary) | `CreateNoteBody`                                        |                           |
| Domain errors               | `NoteNotFoundError`                                     |                           |
| Files                       | kebab-case or match export name consistently per folder | `create-note-use-case.ts` |

**No cryptic abbreviations:** use `manager` not `mgr`, `context` not `ctx`.

## Size limits (AI readability)

| Unit           | Guideline                       |
| -------------- | ------------------------------- |
| Function       | ~30 lines — split if longer     |
| Class / module | ~150 lines                      |
| File           | ~300 lines — split by subdomain |

## Architecture

- **Clean architecture** — domain and UseCase modules must not import HTTP framework types (Hono, Express, etc.).
- **OpenAPI-compatible** — documented JSON matches NENE2 OpenAPI schemas.
- **Problem Details** — single factory; map domain errors in HTTP layer only (`api-error-responses.md`).
- **Configuration** — `process.env` only in `src/config/` (or bootstrap); never in UseCases or domain types.
- **Constructor injection** — required dependencies via constructors; no service locator in domain code.
- **Thin handlers** — parse → UseCase → response only (`domain-layer.md`).
- **Layered validation** — format at handler, invariants in UseCase (`request-validation.md`).

## File layout (target)

```text
src/
  http/           # adapters, Problem Details, pagination
  middleware/     # security, auth, throttle, logging
  config/         # typed settings from env
  database/       # executor, transactions, health
  auth/           # verifiers and middleware wiring
  example/        # Note/Tag reference (unstable public API)
  mcp/            # MCP HTTP client boundary (FetchMcpHttpClient)
tests/
  http/           # request-level tests
  fixtures/       # JSON from OpenAPI examples
```

Group features by domain under `src/example/{domain}/`, not by layer at `src/` root.

## Testing

- **Vitest** for unit and HTTP-level tests.
- UseCase tests: in-memory repositories, no network.
- HTTP tests: in-process server or handler harness; avoid flaky fixed ports in CI.
- Contract tests against pinned OpenAPI fixtures in `tests/fixtures/contract/` (see `openapi-contract-testing.md`).
- Coverage gate (v0.1.14+): **≥80%** overall, **≥90%** for example UseCase modules (`vitest.config.ts`).
- Test descriptions in English; behavior-focused names.

## Dependencies

- Minimize **runtime** dependencies; justify each in PR (Issue link).
- Commit `package-lock.json`.
- See `quality-tools.md` for audit policy.

## Documentation and comments

- **English** for README, `docs/`, ADRs, public TSDoc, Problem Details, validation messages.
- TSDoc on **public** exports and non-obvious behavior only.
- Do not duplicate types already in signatures.
- Record major decisions in `docs/adr/`.

## Security

Follow `security-policy.md` — parameterized SQL, no secret logging, explicit CORS, crypto from `node:crypto`.

## AI readability

- Name files and symbols after their role.
- Prefer explicit return types on exported functions.
- Keep control flow inspectable — avoid hidden magic middleware side effects.
- Use self-review checklists under `docs/review/` before PR.

## References

- NENE2: `../NENE2/docs/development/coding-standards.md`
- nene2-python: `../nene2-python/CLAUDE.md`
