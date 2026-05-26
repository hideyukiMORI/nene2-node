# Field Trial 170 — Request Deduplication

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- `idempotencyMiddleware` from the framework is the recommended approach — zero boilerplate
- Manual DB-backed pattern documented for cases needing cross-service queries or audit
- `replayed: true` in response body signals cache hit to clients
- Race condition safety net: UNIQUE violation caught via `classifyDatabaseError`
- Key scoping: consider `(user_id, idempotency_key)` for multi-tenant systems

## Friction

None — `idempotencyMiddleware` with `FileIdempotencyStorage` and `RedisIdempotencyStorage` are already in the framework. FT170 is purely pattern documentation.

## Version

No framework change. Docs-only (D0).
