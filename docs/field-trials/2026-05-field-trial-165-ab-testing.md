# Field Trial 165 — A/B Testing

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- CRC32-based deterministic variant assignment: same `userId:experimentId` seed always produces the same bucket
- Status machine: `draft → active → stopped`; invalid transitions → 422
- Idempotent assignment: check existing row before computing variant
- Weighted variants: `seed % totalWeight` selects variant proportionally
- CVR aggregation: `GROUP BY variant` with `NULLIF(COUNT(assignments), 0)` to avoid division-by-zero

## Friction

Node has no built-in `crc32`. A pure-JS implementation using bitwise XOR with polynomial `0xedb88320` is documented — no npm dependency needed.

## Version

No framework change. Docs-only (D0).
