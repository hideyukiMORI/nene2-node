# Roadmap

Node.js port of [NENE2](https://github.com/hideyukiMORI/NENE2) with **functional parity** on public OpenAPI, **strict TypeScript**, and **testable clean architecture**. Issue-driven execution: `docs/workflow.md`.

**Master plan:** [docs/milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)  
**Active board:** [docs/todo/current.md](todo/current.md)

## North star

Ship `@hideyukimori/nene2-framework@0.1.0` where a team can run a NENE2-compatible API on Node without PHP — same JSON contracts, Node-idiomatic internals.

| Principle           | Practice                                         |
| ------------------- | ------------------------------------------------ |
| OpenAPI is contract | Pin and test against NENE2 `openapi.yaml`        |
| Parity reference    | nene2-python module layout                       |
| Loose coupling      | Composition root only; UseCases free of Hono/SQL |
| Tests first         | Vitest HTTP + UseCase unit tests per PR          |

---

## Phase 0 — Governance ✅

[Milestone](milestones/2026-05-initial-bootstrap.md)

- [x] Scope, workflow, engineering policy, FT culture
- [x] ADR 0001, ADR 0002 (Hono)

---

## Phase 1 — Runtime skeleton ✅

[Milestone](milestones/2026-05-phase1-runtime-skeleton.md)

- [x] Hono `createApp()`, Problem Details, system routes
- [x] 9 HTTP tests (NENE2 `HttpRuntimeTest` subset)

---

## Phase 1b — OpenAPI contract and dev server ✅

[Milestone](milestones/2026-05-phase1b-contract-and-dev.md)

- [x] Contract fixtures + tests for system routes (14 tests total)
- [x] `resolveOpenApiPath()` policy
- [x] `npm run dev`

---

## Phase 2 — Middleware and auth ✅

[Milestone](milestones/2026-05-phase2-middleware-auth.md)

- [x] Domain exception → Problem Details registry ([#11](https://github.com/hideyukiMORI/nene2-node/issues/11))
- [x] Validation layer (`validation-failed`)
- [x] Bearer JWT + `/examples/protected`
- [x] Throttle (429), CORS, structured logging ([#15](https://github.com/hideyukiMORI/nene2-node/issues/15))

---

## Phase 3 — Example Note CRUD ✅

[Milestone](milestones/2026-05-phase3-note-crud.md)

- [x] UseCase / Repository / Handler ([#13](https://github.com/hideyukiMORI/nene2-node/issues/13))
- [x] SQLite + in-memory repositories
- [x] `/examples/notes` OpenAPI coverage

---

## Phase 4 — Database and health ✅

[Milestone](milestones/2026-05-phase4-database-health.md)

- [x] Query executor + transactions ([#16](https://github.com/hideyukiMORI/nene2-node/issues/16))
- [x] Database health check → degraded `/health`

---

## Phase 5 — MCP and publish ✅

[Milestone](milestones/2026-05-phase5-mcp-publish.md)

- [x] MCP HTTP boundary ([#17](https://github.com/hideyukiMORI/nene2-node/issues/17))
- [x] `0.1.0` publish candidate (`npm run build`, checklist)

---

## Field trials

See `docs/development/field-trial-culture.md`. **FT1–15** done; **FT2–100 backlog:** `docs/field-trials/backlog.md`. Docs-first: `docs/development/README.md`, `production-deployment.md`, `environment-variables.md`.

---

## Non-goals

See `docs/scope.md` — no nene2-js client, no nene-mcp stdio duplicate, no 165+ PHP FT apps copied verbatim.
