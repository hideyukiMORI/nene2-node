# Field trial report — FT148: UTC `created_at` on example note/tag (D3)

**Date:** 2026-05-22 | **Issue:** [#102](https://github.com/hideyukiMORI/nene2-node/issues/102) | **Difficulty:** D3

## Validated

- Example note/tag schema includes `created_at` (TEXT/VARCHAR, UTC ISO string)
- Repositories set `created_at` via `utcNowIso()` on insert; preserved on update
- JSON responses expose `created_at` ending with `Z`

## Friction

### F-1: UTC vs local undocumented (FT115) — **resolved**

**Observed:** Helpers existed (FT138) but example CRUD did not persist timestamps.  
**Resolution:** Example repositories + schema (**v0.1.21**).

## Probes

| Probe                                        | Result                   |
| -------------------------------------------- | ------------------------ |
| `tests/example/note/note-repository.test.ts` | UTC ISO on save/update   |
| `tests/http/notes.test.ts`                   | `created_at` in POST/GET |

## References

- [timestamps.md](../development/timestamps.md)
- FT115 / FT138
