# Field trial report — FT146: BOLA in example note/tag UseCases (D4)

**Date:** 2026-05-22 | **Issue:** [#98](https://github.com/hideyukiMORI/nene2-node/issues/98) | **Difficulty:** D4

## Validated

- Example note/tag CRUD enforces JWT `sub` ownership via `assertResourceOwner`
- Cross-user GET by id → **403** (not 200 leak); list scoped to owner
- Bearer required on `/examples/notes` and `/examples/tags` when examples enabled
- `createResourceAccessDeniedHandler` registered in example module wiring

## Friction

### F-1: FT78 gap — **resolved**

**Observed (FT78/132):** Helper existed but example routes returned cross-user **200**.  
**Resolution:** UseCase + repository `owner_id` + bearer on example paths.

## Probes

| Probe                               | Result                          |
| ----------------------------------- | ------------------------------- |
| `tests/http/bola-ownership.test.ts` | wrong sub → 403; list isolation |

## References

- [resource-ownership.md](../development/resource-ownership.md)
- FT132 helper / FT78 documented gap
