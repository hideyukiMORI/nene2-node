# Field trial report — FT108: N+1 list queries

**Date:** 2026-05-22 | **Issue:** [#71](https://github.com/hideyukiMORI/nene2-node/issues/71) | **Difficulty:** D4 | **Campaign:** FT77–126

## Validated

- Theme probe: desk + docs/code path (`parsePaginationQuery`).
- Parent batch Issue #71.

## Friction

### F-1: Unbounded list without pagination (severity: medium–high)

**Observed:** Exercised or inferred during high-friction campaign FT108.  
**Action:** parsePaginationQuery  
**Status:** **documented**

## Follow-up

- See [2026-05-phase2-friction-index.md](2026-05-phase2-friction-index.md).
