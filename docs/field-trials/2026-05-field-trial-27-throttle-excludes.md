# Field trial report — FT27: Throttle path excludes

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- Default exclude `/health` in `createApp()` when env list empty.
- `NENE2_NODE_THROTTLE_EXCLUDE_PATHS` overrides via `loadAppSettings`.

## Doc updates (docs-first)

- `environment-variables.md`, `production-deployment.md` — exclude path semantics.

## Friction

- _None blocking._

## Security diagnosis (FT27 % 3 = 0)

| Area                        | Result                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| DoS on health               | pass — health excluded from throttle accounting by default                                             |
| Abuse via exclude misconfig | pass with notes — overly broad exclude list could weaken rate limits; document in deployment checklist |

**Overall:** pass with notes.

## DX

Set `NENE2_NODE_THROTTLE_EXCLUDE_PATHS` for probes and static assets; keep list minimal.

## Follow-up

- None.
