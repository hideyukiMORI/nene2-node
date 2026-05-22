# Field trial report — FT54: Logging redaction

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `requestLoggingMiddleware` logs structured fields without Authorization header.
- Policy in `security-policy.md` prohibitions.

## Doc updates (docs-first)

- `observability.md` — redaction checklist table.

## Security diagnosis (FT54 % 3 = 0)

| Area                        | Result                                               |
| --------------------------- | ---------------------------------------------------- |
| API8 Sensitive data in logs | pass — default middleware omits secrets              |
| Custom loggers              | pass with notes — consumer responsibility documented |

**Overall:** pass with notes.

## Follow-up

- None.
