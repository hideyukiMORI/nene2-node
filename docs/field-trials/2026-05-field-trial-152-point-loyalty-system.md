# Field Trial 152 — Points / Loyalty System

**Date:** 2026-05-27  
**Source FT:** NENE2 FT152  
**Difficulty:** D1 (no framework change, but documents a non-obvious pattern)

## What was verified

Idempotent ledger-based point system. Key insight: `reference_id UNIQUE` as idempotency key, balance derived from last `balance_after` — no separate balance column.

| Pattern                                  | Framework support                              |
| ---------------------------------------- | ---------------------------------------------- |
| Ledger-only balance (no separate column) | ✅ SQL aggregate, app concern                  |
| `reference_id` UNIQUE idempotency        | ✅ `classifyDatabaseError` → 409               |
| Multi-layer balance protection           | ✅ app check + DB `CHECK (balance_after >= 0)` |
| Atomic earn/spend                        | ✅ `runTransaction`                            |
| Per-transaction earn cap                 | ✅ `ValidationException`                       |

## Key finding

The idempotency pattern here differs from `idempotencyMiddleware` (which operates at HTTP layer). For business-level idempotency (same payment/earn event should only apply once), use a `reference_id UNIQUE` column in the ledger and catch duplicates with `classifyDatabaseError`. Documented in how-to.

## Deliverables

- `docs/how-to/point-loyalty-system.md` ✅
