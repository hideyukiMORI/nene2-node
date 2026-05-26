# Field Trial 168 — Admin Report Aggregation

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Date validation: regex `^\d{4}-\d{2}-\d{2}$` + `new Date()` round-trip to reject invalid dates like `2026-13-01`
- `COALESCE(SUM(...), 0)` and `COALESCE(AVG(...), 0)` for zero-safe aggregation when there are no matching rows
- Dynamic WHERE clause with bound parameters — never string interpolation
- Limit clamped server-side (not from client query param)

## Security

VULN-01: Date injection — format + value validated before use in query.  
VULN-02: Admin-only access — JWT role check before any aggregation query.

## Version

No framework change. Docs-only (D0).
