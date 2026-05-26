# Field Trial 158 — CSV Bulk Import

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Partial success: per-row validation + insert; collect errors, continue on failure; return 200 with counts
- Batch-level duplicate detection: `Set<string>` to catch duplicate emails within the same CSV before hitting the DB
- UNIQUE violation on email caught via `classifyDatabaseError` for clean error messages
- HTTP 200 for partial success (import "completed"); 422 only for completely invalid request (missing `csv` field)

## Friction found

None. All primitives available.
