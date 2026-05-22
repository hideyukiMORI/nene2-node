# Field trial report — FT95: Throttle Redis storage

**Date:** 2026-05-22 | **Issue:** [#71](https://github.com/hideyukiMORI/nene2-node/issues/71) | **Difficulty:** D4 | **Campaign:** FT77–126

## Validated

- Theme probe: desk + docs/code path (`production-deployment.md`).
- Parent batch Issue #71.

## Friction

### F-1: In-memory throttle not multi-instance (severity: medium–high)

**Observed:** Exercised or inferred during high-friction campaign FT95.  
**Action:** production-deployment.md  
**Status:** **resolved** — FT141 RedisRateLimitStorage (optional peer `redis`)

## Follow-up

- See [2026-05-phase2-friction-index.md](2026-05-phase2-friction-index.md).
