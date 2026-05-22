# Field trial report — FT73: nested orders / order_items (D3)

**Date:** 2026-05-22 | **Issue:** [#57](https://github.com/hideyukiMORI/nene2-node/issues/57) | **Sandbox:** `../nene2-node-FT/ft073-orders-nested/`

## Validated

- Tier A app on MySQL 8.4 (`mysql://ft073:ft073_pass@127.0.0.1:3309/ft073_app`)
- Routes: `POST /orders`, `GET /orders/:id`, `POST /orders/:id/items`, `GET /orders/:id/items`
- `await createApp()` + `nene2.database.executor` for app-owned DDL and repositories
- `npm run check` in framework repo; release **v0.1.4**

## Friction

### F-1: No shared executor on `Nene2App` (severity: high) — **resolved**

**Observed:** Custom business tables required either duplicating `createDatabaseRuntime()` (second pool) or forking framework internals.  
**Action:** Expose `Nene2App.database: { executor, backend }` when `NENE2_NODE_DATABASE_URL` is set.  
**Resolution:** PR for #57.

### F-2: Example schema always bootstrapped (severity: low) — **documented**

**Observed:** `createApp()` still runs `ensureExamplesSchema*` (notes/tags) on the same pool as business DDL.  
**Workaround:** Ignore example routes in production apps; plan app-only bootstrap in a later FT if needed.

### F-3: Nested route wiring is manual (severity: medium) — **accepted**

**Observed:** No `registerOrderRoutes` in framework — app mounts handlers on `nene2.app` after `createApp()`.  
**Workaround:** Sandbox `src/main.ts` pattern; aligns with clean-architecture boundary (app owns domains).

## Probes executed

| Probe                                             | Result                        |
| ------------------------------------------------- | ----------------------------- |
| `docker compose up` + `node probe.mjs`            | 201 order, 201 item, 200 list |
| Framework unit test `create-app-database.test.ts` | pass                          |
| MySQL integration (CI / optional local URL)       | pass when URL set             |

## Follow-up Issues

- None blocking FT74 — Bearer on business routes is planned as FT74
