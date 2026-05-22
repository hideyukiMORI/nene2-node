# Field trial report — FT40: Multi-domain SQLite

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- Single DB connection shares executor for notes + tags; `ensureExamplesSchema()` runs both DDL modules.
- Repository contract tests pass for both domains on `:memory:`.

## Doc updates (docs-first)

- `database-layer.md` — multi-domain paragraph.

## Adversarial review (FT40 % 4 = 0)

| Probe                          | Outcome                                      |
| ------------------------------ | -------------------------------------------- |
| Cross-table SQL in one handler | pass — no raw cross-domain SQL in HTTP layer |
| Schema partial create          | pass — `ensureExamplesSchema` runs both      |

**Resilience:** acceptable.

## Follow-up

- None.
