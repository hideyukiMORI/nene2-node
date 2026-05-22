# Field trial report — FT57: Throttle exclude bypass

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `throttleExcludePaths` skips middleware entirely for matching paths.
- Default `/health` exclude documented.

## Doc updates (docs-first)

- `node-security-practices.md` — throttle bypass section.

## Security diagnosis (FT57 % 3 = 0)

| Area                  | Result                                             |
| --------------------- | -------------------------------------------------- |
| DoS via broad exclude | pass with notes — misconfiguration risk documented |
| API4                  | pass when throttle enabled and excludes minimal    |

**Overall:** pass with notes.

## Follow-up

- None.
