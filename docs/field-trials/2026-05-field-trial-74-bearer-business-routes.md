# Field trial report — FT74: Bearer on business routes (D4)

**Date:** 2026-05-22 | **Issue:** [#63](https://github.com/hideyukiMORI/nene2-node/issues/63) | **Sandbox:** `../nene2-node-FT/ft074-orders-bearer/`

## Validated

- `CreateAppOptions.bearerIncludePaths` merges with `/examples/protected`
- `POST /orders` returns **401** without Bearer; **201** with valid local JWT
- Reuses FT73 MySQL sandbox pattern on port **3309** (shared compose) or standalone README

## Friction

### F-1: Bearer paths were hard-coded (severity: high) — **resolved**

**Observed:** Only `/examples/protected` was in `includePaths`; business apps could not protect `/orders` without duplicating middleware.  
**Resolution:** `bearerIncludePaths` option on `createApp()`.

### F-2: Verifier required for protected paths (severity: low) — **documented**

**Observed:** Without `NENE2_LOCAL_JWT_SECRET` / `tokenVerifier`, protected paths return 401 (fail-closed).  
**Workaround:** Set secret in `.env` for sandboxes; production uses real `TokenVerifier`.

## Probes

| Probe                                    | Result       |
| ---------------------------------------- | ------------ |
| Unit test `bearer-include-paths.test.ts` | pass         |
| `ft074-orders-bearer/probe.mjs`          | 401 then 201 |

## Follow-up

- **FT75** — order + line items in one transaction ([#29](https://github.com/hideyukiMORI/nene2-node/issues/29))
