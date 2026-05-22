# Field trial report — FT20: OpenAPI contract fixtures

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `tests/contract/system-endpoints.test.ts`, `note-endpoints.test.ts`, `tag-endpoints.test.ts`.
- Fixtures under `tests/fixtures/contract/`.

## Doc updates (docs-first)

- **New:** `docs/development/openapi-contract-testing.md`
- `environment-variables.md` — `NENE2_NODE_OPENAPI_PATH`

## Friction

- F-1 (low): Fixtures can drift from NENE2 OpenAPI — README asks manual sync; consider `openapi-pin.txt` revision file in batch 4 (FT38).

## Adversarial review (FT20 % 4 = 0)

| Probe                                       | Outcome                        |
| ------------------------------------------- | ------------------------------ |
| Contract tests skipped in CI                | pass — part of `npm run check` |
| Fixture omits auth headers on public routes | pass — intentional             |

**Resilience:** acceptable.

## DX

Add fixture + test when exposing new OpenAPI-documented routes.

## Follow-up

- FT38: contract maintenance checklist.
