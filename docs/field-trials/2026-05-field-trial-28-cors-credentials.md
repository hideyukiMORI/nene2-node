# Field trial report — FT28: CORS credentials edge cases

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `tests/middleware/cors.test.ts` — allowed origin reflection, credentials flag.
- Empty origins → middleware still runs but allows no cross-origin browser calls.

## Doc updates (docs-first)

- `middleware-security.md` — credentials + explicit origins rule.

## Friction

- _None blocking._

## Adversarial review (FT28 % 4 = 0)

| Probe                              | Outcome                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| Credentials without allowed origin | browser blocks — server does not emit `*` with credentials |
| Random Origin header               | pass — not reflected unless listed                         |

**Resilience:** acceptable.

## DX

Set `NENE2_NODE_CORS_ORIGINS` and only enable credentials when browsers need cookies.

## Follow-up

- None.
