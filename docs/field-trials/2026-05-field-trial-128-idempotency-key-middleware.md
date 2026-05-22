# Field trial report — FT128: Idempotency-Key middleware (D4)

**Date:** 2026-05-22 | **Issue:** [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) | **Sandbox:** `../nene2-node-FT/ft128-idempotency/`

## Validated

- `idempotencyMiddleware()` replays first **201** for same key + body
- Different body + same key → **409**
- Vitest: `tests/middleware/idempotency.test.ts`

## Friction

### F-1: No built-in idempotency (severity: medium–high) — **resolved**

**Observed:** Payment-style POST retries duplicated side effects.  
**Resolution:** Opt-in middleware + `InMemoryIdempotencyStorage` (**v0.1.9**).

### F-2: In-memory store not multi-instance safe (severity: medium) — **open**

**Observed:** FT95 Redis throttle pattern applies — durable store is app-owned.  
**Status:** **open** (FT131+)

### F-3: Concurrent duplicate requests may both execute (severity: low) — **open**

No distributed lock; document for high-traffic endpoints.

## Probes

| Probe                         | Result                        |
| ----------------------------- | ----------------------------- |
| `ft128-idempotency/probe.mjs` | replay 201, body mismatch 409 |

## Follow-up

- Durable `IdempotencyStorage` adapter (Redis) — backlog
