# Field trial report — FT138: UTC timestamp helpers (D3)

**Date:** 2026-05-22 | **Issue:** [#79](https://github.com/hideyukiMORI/nene2-node/issues/79)

## Validated

- `parseUtcIsoTimestamp`, `formatUtcIsoTimestamp`, `utcNowIso`
- [timestamps.md](../development/timestamps.md)

## Friction

### F-1: UTC vs local undocumented (FT115) — **resolved**

Offset-less ISO strings rejected with explicit error.

## Probes

Vitest `tests/domain/timestamps.test.ts`
