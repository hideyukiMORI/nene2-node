# Field trial report — FT60: Production deployment security pass

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** required

## Validated

- `production-deployment.md` + `production-errors.md` + `environment-variables.md` form a coherent go-live set.
- `createApp()` defaults align with documented checklist.

## Doc updates (docs-first)

- **New:** `production-errors.md`; cross-links in deployment checklist.

## Security diagnosis (FT60 % 3 = 0)

| Area                  | Result                                                            |
| --------------------- | ----------------------------------------------------------------- |
| API8 Misconfiguration | pass with notes — checklist covers CORS, throttle, debug, secrets |
| API2                  | pass — auth env documented                                        |

**Overall:** pass with notes.

## Adversarial review (FT60 % 4 = 0)

| Probe                        | Outcome                              |
| ---------------------------- | ------------------------------------ |
| Deploy with debug true       | documented as unsafe — operator duty |
| Throttle off + no edge limit | documented risk                      |

**Resilience:** acceptable when checklist followed.

## Follow-up

- None.
