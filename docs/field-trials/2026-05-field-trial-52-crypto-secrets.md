# Field trial report — FT52: Crypto secrets discipline

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- Framework uses `node:crypto` for JWT HMAC and timing-safe compare.
- `security-policy.md` prohibits `Math.random()` for secrets.

## Doc updates (docs-first)

- `node-security-practices.md` — crypto table.

## Adversarial review (FT52 % 4 = 0)

| Probe                        | Outcome                             |
| ---------------------------- | ----------------------------------- |
| grep `Math.random` in `src/` | pass — none for auth                |
| Weak patterns in examples    | pass — no generated secrets in repo |

**Resilience:** acceptable.

## Follow-up

- None.
