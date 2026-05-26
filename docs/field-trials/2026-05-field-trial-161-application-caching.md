# Field Trial 161 — Application Caching

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Cache-Aside pattern: check cache → miss: query DB, populate cache → return
- Write-through invalidation: `cache.delete(key)` after write; next GET repopulates
- List cache invalidation on create/update/delete
- In-memory cache with TTL and stats (hits/misses/size)
- Redis-backed cache for distributed use via `createRedisKeyValueClientFromUrl`

## Friction found

The framework exports `createRedisKeyValueClientFromUrl` and `RedisKeyValueClient` — Redis caching integrates naturally. For in-memory caching, a simple Map-based implementation is documented (no framework wrapper needed for this pattern).

## Version

No framework change. Docs-only (D0).
