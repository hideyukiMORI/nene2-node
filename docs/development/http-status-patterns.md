# HTTP status patterns (framework defaults)

Documented behaviors from `createApp()` and example routes.

| Status | Problem `type`          | When                                                  |
| ------ | ----------------------- | ----------------------------------------------------- |
| 400    | `invalid-json`          | Malformed JSON body                                   |
| 401    | `unauthorized`          | Missing/invalid Bearer or API key                     |
| 404    | `not-found`             | Unknown route or domain entity missing                |
| 405    | `method-not-allowed`    | Known path, disallowed verb (includes `Allow` header) |
| 422    | `validation-failed`     | Field validation errors                               |
| 429    | `rate-limit-exceeded`   | Throttle limit hit                                    |
| 500    | `internal-server-error` | Unhandled exception (safe detail in production)       |
| 503    | — (health JSON)         | Degraded `/health` when dependency check fails        |

## 405 pattern

System routes register `POST` handlers that return 405 with `Allow: GET` — see `methodNotAllowed` in `create-app.ts`. Example CRUD routes use route-level method binding (only declared verbs accepted).

## References

- `api-error-responses.md`
- `error-handling.md`
