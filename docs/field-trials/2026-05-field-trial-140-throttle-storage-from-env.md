# Field trial report — FT140: Throttle storage from env (D2)

**Date:** 2026-05-22 | **Issue:** [#79](https://github.com/hideyukiMORI/nene2-node/issues/79)

## Validated

- `createThrottleStorageFromEnv()` — `memory` | `file`
- Env: `NENE2_NODE_THROTTLE_STORAGE`, `NENE2_NODE_THROTTLE_STORAGE_DIR`

## Friction

### F-1: No env-driven storage (FT95) — **partial**

`file` kind only; **redis** value throws helpful error at runtime if added later.

## Probes

Unit tests + docs
