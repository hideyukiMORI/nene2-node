# Field trial report — FT30: Request logging + request id

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `requestIdMiddleware` + `requestLoggingMiddleware`; tests in `runtime.test.ts`, `request-logging.test.ts`.
- Default log exclude `/health`.

## Doc updates (docs-first)

- **New:** `docs/development/observability.md`

## Friction

- _None blocking._

## Security diagnosis (FT30 % 3 = 0)

| Area               | Result                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| Log injection      | pass — structured JSON lines; no raw user input in log format strings             |
| Credential leakage | pass with notes — policy: never log auth headers (documented in observability.md) |
| Disclosure         | pass — logs are stdout only in framework default                                  |

**Overall:** pass with notes.

## DX

Correlate support tickets with `X-Request-Id` from response headers.

## Follow-up

- None.
