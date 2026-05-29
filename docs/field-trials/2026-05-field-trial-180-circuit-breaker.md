# FT180 — Circuit Breaker

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT298 (`circuitlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔧new
**Tier:** pure framework primitive — in-tree unit tests (no sandbox needed)

## Objective

node had no resilience primitive to stop cascading failures when a dependency
(payment gateway, external API, DB) goes bad. Add a three-state circuit breaker.

## Deliverable (🔧new framework)

`src/resilience/circuit-breaker.ts`, exported from `src/index.ts`:

- `createCircuitBreaker({ failureThreshold=5, resetTimeoutMs=30000, now=Date.now })`
  → `CircuitBreaker`.
- `execute<T>(fn)`: runs `fn` when allowed; records outcome; rethrows the
  **original** error on failure; throws `CircuitOpenError` (with `openUntil`)
  when open or when a half-open probe is already running.
- `isCallAllowed()`, `recordSuccess()`, `recordFailure()`, `reset()`, `state`.

### State machine

| From      | Trigger                          | To                   |
| --------- | -------------------------------- | -------------------- |
| closed    | `failureThreshold` consec. fails | open                 |
| closed    | success                          | closed (count reset) |
| open      | `resetTimeoutMs` elapsed (lazy)  | half-open            |
| half-open | probe success                    | closed               |
| half-open | probe failure                    | open                 |

## Design notes

- **In-memory, in-process.** node runs one long-lived process, so PHP's reason
  for DB-backed state (cross-PHP-FPM-worker sharing, restart survival) does not
  apply. The how-to documents backing it with a shared store (Redis adapter
  pattern) for multi-instance deployments.
- **Lazy half-open** — the open→half-open transition happens on the next
  `state`/`isCallAllowed`/`execute` access after the cooldown; no background
  timer.
- **Single half-open probe** — while a probe is in flight, concurrent calls get
  `CircuitOpenError`, so only one trial hits the recovering dependency.
- **Injectable clock** (`now`) makes the time-based transitions deterministic in
  tests — no fake timers.
- **Original error preserved** — `execute` rethrows exactly what `fn` threw, so
  callers can distinguish a real downstream failure from a fast-fail
  (`CircuitOpenError`).

## Verification

`npm run check` green. 13 in-tree tests
(`tests/resilience/circuit-breaker.test.ts`) cover closed/open/half-open
transitions, threshold, lazy timeout, single-probe concurrency, manual controls,
and original-error propagation.

## Friction

None. New `src/resilience/` module; no changes elsewhere.

## How-to

[docs/how-to/circuit-breaker.md](../how-to/circuit-breaker.md)
