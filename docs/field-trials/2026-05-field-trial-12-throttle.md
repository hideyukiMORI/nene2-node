# Field trial report — FT12: Throttle middleware

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** required

## Validated

- `throttleMiddleware` → 429 + `Retry-After`; `tests/middleware/throttle.test.ts`.

## Doc updates (docs-first)

- `docs/development/production-deployment.md` — throttle storage guidance (FT#1 F-2 closure).
- `environment-variables.md` — throttle vars.

## Friction

- F-1 (medium, carried): in-memory store — documented; external store deferred.

## Security diagnosis

| Area                       | Result                                                         |
| -------------------------- | -------------------------------------------------------------- |
| API4 Unrestricted resource | pass when limit enabled — 429 after threshold                  |
| DoS                        | pass with notes — single-process memory store not cluster-safe |
| Misconfiguration           | pass — limit unset disables throttle (explicit)                |

**Overall:** pass with notes.

## Adversarial review

| ATK                      | Outcome                                      |
| ------------------------ | -------------------------------------------- |
| Burst requests           | 429 after limit; Problem Details type stable |
| Bypass via excluded path | only configured prefixes — default empty     |

**Resilience:** acceptable for dev/single node; production should use edge limit or shared store.

## DX

Enable via `NENE2_NODE_THROTTLE_LIMIT`; read production-deployment.md before scale-out.

## Follow-up

- Optional Issue: Redis `RateLimitStorage` adapter when multi-instance demand appears.
