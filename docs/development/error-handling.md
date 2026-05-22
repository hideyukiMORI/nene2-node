# Error handling (`resolveHttpError`)

Central mapping from thrown errors to RFC 9457 responses in `createApp()` via Hono `onError`.

## Dispatch order

| Order | Type                           | Status      | Problem `type`                     |
| ----- | ------------------------------ | ----------- | ---------------------------------- |
| 1     | `JsonBodyParseException`       | 400         | `invalid-json`                     |
| 2     | `ValidationException`          | 422         | `validation-failed` (+ `errors[]`) |
| 3     | DB unique constraint           | 409         | `conflict`                         |
| 4     | DB foreign-key constraint      | 422         | `validation-failed`                |
| 5     | `DomainExceptionHandler` chain | per handler | e.g. `not-found`                   |
| 6     | Fallback                       | 500         | `internal-server-error`            |

## Domain handlers

Register with `createApp({ domainHandlers: [...] })`. Built-in handlers cover note/tag not-found. Handlers run in array order; first `supports(error)` wins.

## Debug mode

When `NENE2_NODE_APP_DEBUG=true`, unexpected errors log to stderr and `detail` may include `Error.message`. Production must keep debug **false** to avoid leaking internals.

## 404 routing

`app.notFound` runs for unknown paths — **not** the same as domain not-found:

| Source         | Trigger                                  | `type`      | Typical detail           |
| -------------- | ---------------------------------------- | ----------- | ------------------------ |
| `app.notFound` | No route matched                         | `not-found` | generic resource message |
| Domain handler | `NoteNotFoundError` / `TagNotFoundError` | `not-found` | entity-specific detail   |

Contract test: `tests/fixtures/contract/not-found-problem.json` pins generic 404 shape.

## References

- `src/error/resolve-http-error.ts`
- `api-error-responses.md`
- `domain-layer.md`
- `database-constraint-errors.md`
