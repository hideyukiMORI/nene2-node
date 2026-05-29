# How-to: circuit breaker

A circuit breaker prevents cascading failures when calling a flaky dependency.
After repeated failures it "trips open" and rejects calls immediately instead of
letting slow/failed calls pile up, then probes for recovery.

> Parity: PHP NENE2 FT298 (`circuitlog`). node FT180.

## Three states

```
closed ──(N consecutive failures)──▶ open ──(resetTimeoutMs elapsed)──▶ half-open
  ▲                                                                          │
  └──────────────────────(probe succeeds)───────────────────────────────────┘
  half-open ──(probe fails)──▶ open
```

| State         | Behaviour                                                          |
| ------------- | ------------------------------------------------------------------ |
| **closed**    | Calls pass. `failureThreshold` consecutive failures → open.        |
| **open**      | Calls rejected immediately (`CircuitOpenError`) until the timeout. |
| **half-open** | One probe call allowed. Success → closed; failure → open.          |

## Usage

```ts
import { createCircuitBreaker, CircuitOpenError } from '@hideyukimori/nene2-framework';

const breaker = createCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 10_000 });

app.post('/charge', async (c) => {
  try {
    const result = await breaker.execute(() => paymentGateway.charge(/* … */));
    return c.json(result);
  } catch (err) {
    if (err instanceof CircuitOpenError) {
      // Dependency is known-bad — fail fast with a retry hint.
      return problems.jsonResponse(
        c,
        problems.build('service-unavailable', 'Payment gateway unavailable.', 503, {
          extensions: { open_until: err.openUntil },
        }),
      );
    }
    throw err; // a real downstream error — handled normally
  }
});
```

`execute(fn)` runs `fn` when calls are allowed, records the outcome, and drives
the state machine. It rethrows the **original** error from `fn` on failure, and
throws `CircuitOpenError` (carrying `openUntil`, an epoch-ms `Retry-After` hint)
when the circuit is open or a half-open probe is already in flight.

Manual controls (`recordSuccess`, `recordFailure`, `isCallAllowed`, `reset`,
`state`) are available when you drive the call yourself instead of via `execute`.

## Tuning

| Dependency           | `failureThreshold` | `resetTimeoutMs` |
| -------------------- | ------------------ | ---------------- |
| Database (critical)  | 3–5                | 10_000–30_000    |
| External API         | 5–10               | 30_000–60_000    |
| Non-critical service | 10–20              | 60_000–120_000   |

Higher thresholds tolerate transient blips; longer timeouts give the dependency
more recovery time but extend customer-visible degradation.

## Per-failure-domain breakers

Use a separate breaker instance per independent failure domain so one bad path
does not block another:

```ts
const charge = createCircuitBreaker();
const refund = createCircuitBreaker(); // refund outage must not block charges
```

## In-memory vs shared state

This breaker keeps state **in-process**. node runs one long-lived process, so —
unlike PHP-FPM — there is no per-worker state loss to design around. For
multi-instance deployments that must share trip state across nodes, back the
counters with a shared store (the same adapter pattern as
`createThrottleStorage` / Redis). The single-process breaker is sufficient for
most APIs and for protecting a process-local dependency client.

## What NOT to do

| Anti-pattern                                                   | Risk                                            |
| -------------------------------------------------------------- | ----------------------------------------------- |
| No timeout on open                                             | Circuit never recovers                          |
| Skip half-open                                                 | open → closed with no probe; flapping           |
| Return 200 when open                                           | Callers think the call succeeded; errors hidden |
| Omit `open_until` in the 503                                   | Clients retry immediately (thundering herd)     |
| Treat a thrown `CircuitOpenError` as a real downstream failure | Double-counts; mask the open state instead      |
