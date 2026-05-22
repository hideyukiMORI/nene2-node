# Field trial report — FT136: Idempotency in-flight dedupe (D3)

**Date:** 2026-05-22 | **Issue:** [#77](https://github.com/hideyukiMORI/nene2-node/issues/77)

## Validated

- Concurrent POSTs with same `Idempotency-Key` await first handler; **one** side effect
- Vitest: `idempotency.test.ts` concurrent case

## Friction

### F-1: Concurrent duplicate execution (FT128 F-3) — **resolved** (single process)

### F-2: Multi-instance still needs shared storage (severity: medium) — **open**

In-memory `IdempotencyStorage` + in-flight map are per process.

## Follow-up

- Redis idempotency store (FT137+)
