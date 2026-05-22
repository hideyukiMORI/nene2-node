# Field trial report — FT137: Transaction aborted → 422 (D4)

**Date:** 2026-05-22 | **Issue:** [#79](https://github.com/hideyukiMORI/nene2-node/issues/79) | **Sandbox:** `../nene2-node-FT/ft137-tx-abort/`

## Validated

- `runTransaction()` wraps rollback errors as `TransactionAbortedError`
- `createTransactionAbortedHandler` → **422** `transaction-aborted`

## Friction

### F-1: Rollback reason not in Problem Details (FT106) — **resolved**

**Observed:** `throw new Error('…')` inside TX → **500**.  
**Resolution:** `runTransaction` + handler (**v0.1.12**).

## Probes

| Probe                      | Result      |
| -------------------------- | ----------- |
| `ft137-tx-abort/probe.mjs` | abort → 422 |
