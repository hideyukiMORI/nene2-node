# Field trial report — FT142: Redis idempotency storage (D4)

**Date:** 2026-05-22 | **Issue:** [#81](https://github.com/hideyukiMORI/nene2-node/issues/81)

## Validated

- `RedisIdempotencyStorage` with TTL (default 24h)

## Friction

### F-1: Multi-instance idempotency (FT136 F-2) — **resolved** when app uses Redis store

## Probes

Unit test with mock `RedisKeyValueClient` (shared with FT141 mock)
