# Field trial report — FT147: Default domain handlers in createApp (D3)

**Date:** 2026-05-22 | **Issue:** [#100](https://github.com/hideyukiMORI/nene2-node/issues/100) | **Difficulty:** D3

## Validated

- `createApp()` wires `TransactionAborted`, `VersionConflict`, and `ResourceAccessDenied` handlers by default
- `runTransaction()` failures → **422** without manual `domainHandlers` option
- Example module no longer duplicates `ResourceAccessDeniedHandler`

## Friction

### F-1: Rollback reason not in Problem Details (FT106) — **resolved**

**Observed:** Handler existed since v0.1.12 but apps without explicit registration still got **500**.  
**Resolution:** `createDefaultDomainHandlers()` in `createApp()` (**v0.1.20**).

## Probes

| Probe                                           | Result                                   |
| ----------------------------------------------- | ---------------------------------------- |
| `tests/app/create-app-default-handlers.test.ts` | tx abort 422, version 409, forbidden 403 |

## References

- [transactions.md](../development/transactions.md)
- FT137 / FT106
