# Field trial report — FT44: invalid-json body parse

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `parseJsonBody` → `JsonBodyParseException` → 400 `invalid-json`.
- Covered in HTTP tests for malformed JSON on POST routes.

## Doc updates (docs-first)

- `http-status-patterns.md`, `error-handling.md` cross-links.

## Adversarial review (FT44 % 4 = 0)

| Probe                  | Outcome                             |
| ---------------------- | ----------------------------------- |
| Huge invalid JSON      | pass — size limit runs before parse |
| Unicode / escape abuse | pass — 400, no 500 leak             |

**Resilience:** acceptable.

## Follow-up

- None.
