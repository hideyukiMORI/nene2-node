# Field trial report — FT9: Security headers

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `securityHeadersMiddleware` in pipeline; `tests/http/runtime.test.ts` asserts baseline headers.

## Doc updates (docs-first)

- Cross-link `middleware-security.md` ↔ `middleware-pipeline.md` (batch 1).

## Friction

- _None blocking._

## Security diagnosis

| Header / control       | Result                           |
| ---------------------- | -------------------------------- |
| X-Content-Type-Options | pass                             |
| Frame / referrer / CSP | pass per implementation          |
| API8                   | pass — headers on JSON responses |

**Overall:** pass.

## DX

Headers apply globally after request id — do not disable in production without ADR.

## Follow-up

- None.
