# Field trial report — FT4: ValidationException

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `ValidationException` → 422 + `errors[]`; note/tag empty field tests.
- `tests/validation/validation-exception.test.ts`, HTTP 422 tests.

## Doc updates (docs-first)

- `docs/development/request-validation.md` — 400 vs 422 split with `parseJsonBody`.

## Friction

- _None blocking._

## Adversarial review (FT4 % 4 = 0)

| Phase        | Summary                                                        |
| ------------ | -------------------------------------------------------------- |
| 1 Inference  | Public POST bodies accept JSON; validation returns field codes |
| 2 Probes     | Extra JSON keys ignored; type confusion returns 422 not 500    |
| 3 Resilience | **acceptable** — no mass-assignment surface on note/tag DTOs   |

No exploit recipes recorded. Status codes and `validation-failed` type only.

## DX

Handlers should use `validateNoteBody` / `validateTagBody` patterns before UseCase.

## Follow-up

- None.
