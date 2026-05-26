# Field Trial 164 — Geolocation

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Haversine distance using Node built-in `Math` (sin/cos/asin)
- Two-pass search: SQL bounding-box pre-filter, then exact Haversine in TypeScript
- Coordinate validation: lat ∈ [-90, 90], lng ∈ [-180, 180]; radius clamped to `[0, MAX_RADIUS_KM]`
- Route registration order: literal paths (`/places/nearby`, `/places/bbox`) must precede pattern paths (`/places/:id`)

## Security

VULN-01: Coordinate injection — validate range before use in SQL.  
VULN-02: Radius DoS — server-side clamp to 20,000 km.

## Version

No framework change. Docs-only (D0).
