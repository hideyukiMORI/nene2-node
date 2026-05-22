# Request Validation Policy

Layered validation with OpenAPI as the public contract. Adapted from NENE2 `docs/development/request-validation.md`.

## Layers

```text
Middleware:
  request size, content-type, JSON parse failures, auth, CORS, request id

Handler / mapper:
  path / query / body mapping
  readonly input DTO construction
  format validation (types, lengths, enums)

UseCase:
  business invariants
  state-dependent rules
  authorization-sensitive application rules
```

Middleware must **not** encode route-specific business rules (e.g. “email must be unique”).

## Handler boundary

- Parse JSON via `parseJsonBody()`; malformed JSON → `JsonBodyParseException` → **400** Problem Details (`invalid-json` type).
- Field-level rules → `ValidationException` → **422** with `errors[]`.
- Map to readonly input types before `useCase.execute()`.
- Use a schema library at the HTTP boundary when adopted (Zod/Valibot/etc.) — choice via ADR in Phase 1/3.
- Do not pass `c.req` / raw `Request` into UseCases.

## UseCase boundary

- Assume input types are structurally valid.
- Enforce invariants: uniqueness, ownership, state machine, cross-field rules.
- Throw domain exceptions; map to Problem Details at HTTP boundary.

## Validation failures

- Always `validation-failed` Problem Details with `errors[]`.
- English `message` and stable `code` per field.
- Collect **all** field errors when practical (parity with NENE2 layered validation tests).

## Pagination query

List routes use `parsePaginationQuery()` (`src/http/pagination-query.ts`):

| Query    | Default | Max |
| -------- | ------- | --- |
| `limit`  | 20      | 100 |
| `offset` | 0       | —   |

Invalid values → `ValidationException` (422). Example: `GET /examples/notes?limit=20&offset=0`.

## OpenAPI

- Documented request bodies and error responses must match implementation.
- Contract tests compare handler responses to pinned OpenAPI examples/fixtures — see `openapi-contract-testing.md`.

## References

- NENE2: `../NENE2/docs/development/request-validation.md`
- Errors: `api-error-responses.md`
