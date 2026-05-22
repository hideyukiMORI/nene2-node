# Field trial report — FT24: App settings matrix

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** required

## Validated

- Single `loadAppSettings()` reader; typed `AppSettings` interface.
- Throttle `0` disables; empty CORS list disables CORS middleware behavior.

## Doc updates (docs-first)

- `environment-variables.md` expanded (batch 1–3); cross-links in `production-deployment.md`.

## Friction

- F-1 (low): `PROBLEM_DETAILS_BASE_URL` name differs from `NENE2_NODE_*` prefix — documented as legacy parity.

## Security diagnosis (FT24 % 3 = 0)

| Area                  | Result                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| API8 Misconfiguration | pass with notes — wrong env in prod is main risk; checklist doc exists |
| Secret handling       | pass — keys optional; unset disables auth middleware paths             |
| Debug in production   | pass — `appEnv=production` defaults debug false                        |

**Overall:** pass with notes.

## Adversarial review (FT24 % 4 = 0)

| Probe                                | Outcome                                                  |
| ------------------------------------ | -------------------------------------------------------- |
| Missing API key on `/machine/health` | 401 Problem Details                                      |
| Throttle limit unset                 | middleware not registered — no false sense of protection |

**Resilience:** acceptable when production-deployment checklist is followed.

## DX

One table (`environment-variables.md`) for all toggles.

## Follow-up

- None.
