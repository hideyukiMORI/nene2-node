# Milestone — Phase 1b: OpenAPI contract and dev server

**Status:** Complete (2026-05-22) — [#9](https://github.com/hideyukiMORI/nene2-node/issues/9) / [#10](https://github.com/hideyukiMORI/nene2-node/pull/10)  
**Depends on:** Phase 1 complete

## Goal

Lock public system endpoint shapes to NENE2 OpenAPI and enable local `createApp` serving.

## Acceptance criteria

- [x] `resolveOpenApiPath()` — `NENE2_NODE_OPENAPI_PATH` with sibling default
- [x] Pinned JSON fixtures under `tests/fixtures/contract/` from OpenAPI examples
- [x] Contract tests: success + Problem Details bodies for system routes
- [x] Optional upstream file probe when sibling `openapi.yaml` present
- [x] `npm run dev` — `@hono/node-server` + `tsx` + `NENE2_NODE_PORT`
- [x] Master plan + phase milestones + roadmap + `docs/todo/current.md`

## Non-goals

- Full OpenAPI response schema validation (ajv) — Phase 2+ if needed
- Note/Tag operations — Phase 3
