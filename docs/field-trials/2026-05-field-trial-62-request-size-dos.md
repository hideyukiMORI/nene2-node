# Field trial report — FT62: Request size DoS edge

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `requestSizeLimitMiddleware` before handlers; default 1 MiB.
- Oversized body rejected with Problem Details.

## Doc updates (docs-first)

- `http-status-patterns.md` / `middleware-pipeline.md` order confirms size limit before throttle.

## Adversarial review (FT62 % 4 = 0)

| Probe               | Outcome                              |
| ------------------- | ------------------------------------ |
| Body > max bytes    | rejected before handler              |
| Many small requests | throttle optional — separate control |

**Resilience:** acceptable.

## Follow-up

- None.
