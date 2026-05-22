# Field trial report — FT141: Redis rate limit storage (D4)

**Date:** 2026-05-22 | **Issue:** [#81](https://github.com/hideyukiMORI/nene2-node/issues/81)

## Validated

- `RedisRateLimitStorage` + `wrapNodeRedisClient`
- `createThrottleStorageFromEnvAsync` when `NENE2_NODE_THROTTLE_STORAGE=redis`

## Friction

### F-1: In-memory not multi-instance (FT95) — **resolved** (with peer `redis`)

### F-2: Sync env factory cannot connect Redis (severity: medium) — **documented**

Use `createThrottleStorageFromEnvAsync()` or wire client in app bootstrap.

## Probes

`tests/middleware/redis-rate-limit-storage.test.ts` (mock client)
