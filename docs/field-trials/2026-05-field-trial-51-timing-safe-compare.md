# Field trial report — FT51: Timing-safe secret compare

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `apiKeyAuthMiddleware` uses `timingSafeEqual` for API key comparison.
- Length mismatch short-circuits before compare.

## Doc updates (docs-first)

- `node-security-practices.md` — timing-safe table.
- `security-policy.md` cross-link.

## Security diagnosis (FT51 % 3 = 0)

| Area                | Result                                            |
| ------------------- | ------------------------------------------------- |
| Timing side channel | pass — `timingSafeEqual` used for machine API key |

**Overall:** pass.

## Follow-up

- None.
