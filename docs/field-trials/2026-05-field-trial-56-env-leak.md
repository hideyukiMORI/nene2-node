# Field trial report — FT56: Env leak prevention

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `.env` gitignored; tests use explicit `loadAppSettings({ ... })`.
- No secrets in contract fixtures (FT#39).

## Doc updates (docs-first)

- `node-security-practices.md` — env leak section.

## Adversarial review (FT56 % 4 = 0)

| Probe                                 | Outcome     |
| ------------------------------------- | ----------- |
| grep for hardcoded API keys in `src/` | pass — none |
| Fixtures contain tokens               | pass        |

**Resilience:** acceptable.

## Follow-up

- None.
