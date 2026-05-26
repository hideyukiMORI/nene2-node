# Field Trial 172 — Content Scheduling

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- `publish_at` column + status machine: draft → scheduled → published → archived
- Transition guard: `VALID_TRANSITIONS` table; invalid transitions → 422
- Validate `publish_at` is in the future on schedule
- Cron-triggered publish endpoint: `WHERE status = 'scheduled' AND publish_at <= NOW()`
- Race-safe publish: `AND status = 'scheduled'` in the UPDATE prevents double-publish

## Version

No framework change. Docs-only (D0).
