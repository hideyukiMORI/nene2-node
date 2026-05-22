# Field trial report — FT6: Bearer JWT

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `bearerTokenMiddleware` on `/examples/protected`; `tests/http/bearer-protected.test.ts`.
- `LocalBearerTokenVerifier` unit tests.

## Doc updates (docs-first)

- `docs/development/middleware-security.md` — Bearer paths and env var.
- `docs/development/environment-variables.md` — `NENE2_LOCAL_JWT_SECRET`.

## Friction

- F-1 (low): Example CRUD routes remain public by design — called out in middleware-security.md.

## Security diagnosis

| Area             | Result                                           |
| ---------------- | ------------------------------------------------ |
| API2 Auth        | pass — missing Bearer → 401; invalid token → 401 |
| API2 alg none    | pass — verifier rejects malformed JWT            |
| Secrets in query | pass — not supported                             |
| Logging          | pass — tests do not log Authorization header     |

**Overall:** pass for documented protected route.

## DX

Set secret in env; use same HS256 test tokens as `bearer-protected.test.ts` for local dev.

## Follow-up

- None.
