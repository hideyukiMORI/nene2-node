# Field trial report — FT19: resolveHttpError mapping

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** N/A

## Validated

- Dispatch order: JSON 400 → validation 422 → domain handlers → 500.
- `tests/error/domain-exception.test.ts`, validation and HTTP tests.

## Doc updates (docs-first)

- **New:** `docs/development/error-handling.md` — order table and debug policy.

## Friction

- _None blocking._

## DX

Handlers throw domain/validation errors; never map status codes manually in routes.

## Follow-up

- None.
