# Field trial report — FT67: npm greenfield install

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Sandbox:** `../nene2-node-FT/ft067-greenfield-install/`

## Validated

- `npm install @hideyukimori/nene2-framework@0.1.0` + `@hono/node-server` + `tsx`
- `createApp()` + custom route `/ft067/hello` — **works**
- `npm run type-check` strict — **pass**

## Friction

### F-1: `@hono/node-server` not bundled (severity: medium)

**Observed:** Consumer must install `@hono/node-server` separately to call `serve()`.  
**Action:** [#39](https://github.com/hideyukiMORI/nene2-node/issues/39) — `docs/how-to/consumer-quickstart.md`

### F-2: `node:sqlite` ExperimentalWarning on startup (severity: low)

**Observed:** Warning even without `NENE2_NODE_DATABASE_URL` (static import chain).  
**Action:** follow-up Issue optional; documented in `quality-tools.md`

### F-3: No consumer template on npm (severity: medium)

**Observed:** Package `files` = dist + README only; `.env.example` not on npm.  
**Action:** [#39](https://github.com/hideyukiMORI/nene2-node/issues/39) quickstart doc + sandbox in nene2-node-FT

## Doc updates

- `docs/how-to/consumer-quickstart.md`
- `.env.example` — `file:` not `sqlite://`

## Follow-up Issues

- #39 — consumer quickstart
- #37 — MySQL adapter (Phase 2)
