# Field trial report — FT3: Domain exception handlers

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `DomainExceptionHandler`, note/tag not-found → 404 Problem Details.
- Tests: `tests/error/domain-exception.test.ts`; `npm run check` — 66 passed.

## Doc updates (docs-first)

- `docs/development/domain-layer.md` — registration steps for domain handlers.

## Friction

- _None blocking._

## Security diagnosis (FT3 % 3 = 0)

| Area                  | Result                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| API1 BOLA             | N/A — not-found only; no cross-user data in examples                     |
| API2 Auth             | pass — domain errors do not bypass Bearer on protected routes            |
| API5 Function auth    | pass — 404 does not leak existence of protected resources beyond OpenAPI |
| API8 Misconfiguration | pass — handlers registered in composition root only                      |
| Disclosure            | pass — no stack traces in Problem Details in tests                       |

**Overall:** pass with notes — example routes are public; production apps must register handlers per domain.

## DX

Copy `createNoteNotFoundHandler` pattern for new entities; document in domain-layer.md.

## Follow-up

- None.
