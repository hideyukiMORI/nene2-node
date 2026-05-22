# Field trial report — FT33: Validation field errors shape

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `ValidationError` enforces non-empty field/message/code; snake_case codes.
- 422 responses include `errors[]` in `resolveHttpError` and contract tests.

## Doc updates (docs-first)

- `api-error-responses.md` — `errors[]` item JSON shape.

## Security diagnosis (FT33 % 3 = 0)

| Area                     | Result                                               |
| ------------------------ | ---------------------------------------------------- |
| API3 Mass assignment     | pass — only declared fields validated at handler     |
| Disclosure               | pass — messages are English safe strings, no stack   |
| Injection via field name | pass — field names are simple strings in JSON output |

**Overall:** pass.

## Follow-up

- None.
