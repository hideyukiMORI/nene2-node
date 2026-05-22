# Field trial report — FT144: Redis Compose E2E (D3)

**Date:** 2026-05-22 | **Issue:** [#83](https://github.com/hideyukiMORI/nene2-node/issues/83) | **Sandbox:** `../nene2-node-FT/ft144-redis-compose/`

## Validated

- `createRedisKeyValueClientFromUrl` against Redis 7
- Shared counters via two `RedisRateLimitStorage` handles (multi-process simulation)
- Shared idempotency records via two `RedisIdempotencyStorage` handles
- `createThrottleStorageFromEnvAsync()` with `NENE2_NODE_THROTTLE_STORAGE=redis`

## Friction

### F-1: Compose lives outside framework repo — **documented**

Recipe in `docs/development/redis-compose-e2e.md`; probe in `nene2-node-FT`.

### F-2: Peer `redis` + async wiring still app-owned — **documented** (unchanged from FT141)

## Probes

| Probe                           | Result           |
| ------------------------------- | ---------------- |
| `ft144-redis-compose/probe.mjs` | OK (Redis 26379) |
| Unit mocks FT141–142            | CI on main       |
