# API Error Response Policy

Public JSON API errors use **RFC 9457 Problem Details**, aligned with NENE2 `docs/development/api-error-responses.md`.

## Position

API errors are **contracts**. They must be stable, documented in OpenAPI, and safe for clients, MCP tools, and tests.

## Response format

- `Content-Type: application/problem+json`
- Single factory module in `src/http/` (name TBD in Phase 1) — do not build Problem Details ad hoc in handlers.

### Base shape

```json
{
  "type": "https://nene2.dev/problems/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource was not found.",
  "instance": "/examples/notes/1"
}
```

### Required fields

| Field    | Rule                                  |
| -------- | ------------------------------------- |
| `type`   | Stable URI; not exception class names |
| `title`  | Short English summary                 |
| `status` | HTTP status code                      |

### Optional fields

| Field      | Rule                                 |
| ---------- | ------------------------------------ |
| `detail`   | Safe English detail; no internals    |
| `instance` | Request path or correlation id       |
| `errors`   | Validation failures only (see below) |

## Problem `type` URIs

Canonical pattern (from NENE2):

```text
https://nene2.dev/problems/{problem-name}
```

Examples:

- `https://nene2.dev/problems/not-found`
- `https://nene2.dev/problems/validation-failed`
- `https://nene2.dev/problems/unauthorized`
- `https://nene2.dev/problems/forbidden`
- `https://nene2.dev/problems/internal-server-error`

Do not change canonical URIs after clients depend on them without a compatibility decision (Issue + CHANGELOG).

## Validation failures

Status **422** (or status defined in OpenAPI for the operation). Type `validation-failed`.

```json
{
  "type": "https://nene2.dev/problems/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request body contains invalid values.",
  "errors": [
    {
      "field": "title",
      "message": "Title must not be empty.",
      "code": "required"
    }
  ]
}
```

Each item requires `field`, `message`, and `code` (stable machine-readable English snake_case).

## Exception boundary

| Source                      | Public mapping                               |
| --------------------------- | -------------------------------------------- |
| Domain / application errors | Stable `type` + safe `detail`                |
| Routing                     | `not-found`, `method-not-allowed`            |
| Validation                  | `validation-failed` + `errors`               |
| Unexpected errors           | `internal-server-error` — **no stack trace** |

## Prohibited in public responses

- Stack traces
- SQL or query text
- File system paths
- Secrets, tokens, API keys
- Raw internal exception messages

## Logging

- Log unexpected errors with request id (Phase 2).
- Never log secrets, passwords, or full auth headers.

## Factory usage (handlers and middleware)

Inject `ProblemDetailsFactory` from `createApp()` — do not construct Problem JSON by hand.

```typescript
// createApp returns problems: ProblemDetailsFactory
const body = problems.validationFailed(c, errors);
return c.json(body, 422);
```

Global hooks in `createApp()` use `resolveHttpError()` and `problemDetailsFromContext()` for uncaught errors and 404.

## Testing

Every error path test should assert:

- HTTP status
- `Content-Type` includes `application/problem+json`
- `type` URI
- `title` present
- `errors` structure when applicable

## References

- NENE2: `../NENE2/docs/development/api-error-responses.md`
- OpenAPI source: `../NENE2/docs/openapi/openapi.yaml`
