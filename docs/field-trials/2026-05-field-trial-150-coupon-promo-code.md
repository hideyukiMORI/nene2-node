# Field Trial 150 — Coupon / Promo Code System

**Date:** 2026-05-27  
**Source FT:** NENE2 FT150  
**Difficulty:** D0 (no framework changes)

## What was verified

| Pattern                                                 | Framework support                  |
| ------------------------------------------------------- | ---------------------------------- |
| Admin RBAC via JWT `role` claim                         | ✅ `c.get('authClaims')`           |
| State-check ordering (exists→active→expired→used→limit) | ✅ app-layer, documented in how-to |
| User-ID from JWT only (no body injection)               | ✅ `authSubFromContext`            |
| UNIQUE(coupon_id, user_id) → 409                        | ✅ `classifyDatabaseError`         |
| Atomic use + count increment                            | ✅ `runTransaction`                |
| ISO-8601 expiry check                                   | ✅ `utcNowIso` + string compare    |

## Friction log

None — all patterns already covered by framework primitives.

## Deliverables

- `docs/how-to/coupon-promo-code.md` ✅
