# Field Trial 175 — API Usage Metering

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Append-only `usage_events` table indexed by `(user_id, day_key)` for daily quota queries
- `day_key = YYYY-MM-DD` UTC partitions events by day
- Default quota from `quotas` table; fallback to 1000 if no row exists
- `X-RateLimit-*` response headers for client transparency
- Per-endpoint breakdown via `GROUP BY endpoint`

## Version

No framework change. Docs-only (D0).
