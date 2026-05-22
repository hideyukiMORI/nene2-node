# Field trial report — FT32: Tag not-found handler

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- `createTagNotFoundHandler` mirrors note pattern; tag HTTP + use-case tests.

## Doc updates (docs-first)

- `domain-layer.md` — Tag row in not-found table.

## Adversarial review (FT32 % 4 = 0)

| Probe                     | Outcome                                                |
| ------------------------- | ------------------------------------------------------ |
| IDOR on sequential ids    | N/A for public example API — no ownership model        |
| 404 vs 403 on missing tag | pass — 404 not-found, no existence leak beyond OpenAPI |

**Resilience:** acceptable.

## Follow-up

- None.
