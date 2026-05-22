# Milestone — Phase 1: Runtime skeleton

**Status:** Complete (2026-05-22)  
**Issue:** [#7](https://github.com/hideyukiMORI/nene2-node/issues/7)  
**PR:** [#8](https://github.com/hideyukiMORI/nene2-node/pull/8)

## Goal

Smallest Hono HTTP server with NENE2-aligned system endpoints and Problem Details.

## Deliverables

- [x] ADR 0002 Accepted — Hono 4 on Node
- [x] `createApp()` composition root (`src/app/create-app.ts`)
- [x] `loadAppSettings()` — sole `process.env` boundary
- [x] RFC 9457 `ProblemDetailsFactory`
- [x] Routes: `GET /`, `/health`, `/examples/ping`, `/machine/health`
- [x] Middleware: request id, security headers, request size, API key (machine health)
- [x] Vitest HTTP tests (9) — parity with NENE2 `HttpRuntimeTest` subset

## Deferred to Phase 1b

- [ ] OpenAPI contract test harness (pinned fixtures + optional live yaml)
- [ ] `npm run dev` entry
