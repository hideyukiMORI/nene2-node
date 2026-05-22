# Field trial report — FT143: Webhook timestamp replay window (D4)

**Date:** 2026-05-22 | **Issue:** [#81](https://github.com/hideyukiMORI/nene2-node/issues/81)

## Validated

- `X-Webhook-Timestamp` + `maxTimestampSkewSeconds` (default 300)
- Signature payload `${timestamp}.${body}` when timestamp present

## Friction

### F-1: No replay protection (FT125 follow-up) — **resolved**

Stale timestamps → **401**.

## Probes

`tests/middleware/webhook-signature.test.ts` stale timestamp case
