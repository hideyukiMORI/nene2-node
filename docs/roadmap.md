# Roadmap

Node.js port of [NENE2](https://github.com/hideyukiMORI/NENE2) with **functional parity** on public OpenAPI, **strict TypeScript**, and **testable clean architecture**. Issue-driven execution: `docs/workflow.md`.

**Master plan:** [docs/milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)  
**Active board:** [docs/todo/current.md](todo/current.md)

## North star

Ship `@hideyukimori/nene2-framework` where a team can run a NENE2-compatible API on Node without PHP — same JSON contracts, Node-idiomatic internals.

**Current release:** [v0.1.26](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.26) (2026-05-29).

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
- [x] `0.1.0` first npm publish ([#21](https://github.com/hideyukiMORI/nene2-node/issues/21))

---

## Phase 6 — Application integration (field trials) ✅

Phase 2 FT campaign **FT67–148** complete (see [backlog](field-trials/backlog.md), [friction index](field-trials/2026-05-phase2-friction-index.md)).

- [x] Greenfield npm install, MySQL/PostgreSQL Compose + CI service jobs (FT67–70, #82)
- [x] Business-app sandboxes: orders, bearer on app routes, transactions, pagination (FT73–76)
- [x] High-friction campaign: idempotency, optimistic concurrency, BOLA, webhooks, Redis, read replica (FT77–145, [#71](https://github.com/hideyukiMORI/nene2-node/issues/71))
- [x] Example hardening: BOLA on note/tag, default domain handlers, UTC `created_at` (FT146–148, v0.1.19–0.1.21)
- [x] Coverage gates 80% / UseCase 90%; commercial readiness (`includeExamples`, Jose JWT, shutdown)

---

## Phase 7 — Application domain parity (FT149–177) ✅

FT campaign **FT149–177** complete (see [backlog](field-trials/ft149-177-backlog.md)) — **NENE2 PHP v1.5.111 / FT177 parity achieved** (v0.1.22–0.1.25, 2026-05-27).

- [x] 29 application-domain how-to docs: collections, coupons, wishlist, loyalty, cart, reviews, file sharing, FTS, CSV import, TOTP/OAuth2, caching, versioning, webhooks, geolocation, A/B testing, workflows, reporting, masking, dedup, hierarchy, scheduling, relations, slugs, metering, delegated grants
- [x] `parseCursorQuery` cursor-based pagination helper (FT153, v0.1.24)
- [x] `parsePaginationQuery` boundary-attack hardening — overflow guard, ReDoS-immune digit check (FT177 🔒, v0.1.25)
- [x] CI `npm audit` job + 0.2.0 breaking inventory draft (v0.1.22); Redis 7 integration test + CI service job (v0.1.23)

---

## Phase 8 — Deep field trials (FT178–187) ✅

Depth over breadth (see [catalog](field-trials/ft178-349-catalog.md)) — 11 new framework helpers, **released as v0.1.26** (2026-05-29).

- [x] HTTP: ETag conditional requests (FT178), `parseSortQuery` ORDER-BY allowlist (FT179), `applyMergePatch` RFC 7396 (FT183)
- [x] Resilience / concurrency: `createCircuitBreaker` (FT180), `createLockManager` (FT181)
- [x] Validation: `createValidationCollector` nested paths (FT182), `validateTextField` Unicode-safe (FT184)
- [x] Security: `checkUrlSafety` SSRF guard (FT185), `assertTenantScope` multi-tenant 404 (FT186), `escapeLikePattern` + SQLi proof sandbox (FT187)
- [x] Auth-flow FTs reclassified as app-domain (out of framework scope); executable-proof sandboxes in `../nene2-node-FT/`

---

## Phase 9 — AI-velocity hardening 🚧

North star: **robust, fast, hesitation-free AI development.** Principle: every
recurring agent decision becomes a rule (doc), guardrail (CI/test), or automation
(script). Full plan: [ADR 0003](adr/0003-ai-velocity-hardening.md).

Prioritised by leverage:

- [x] **A1** Public API surface snapshot test (`tests/api/public-surface.test.ts`) — catches unintended export/type changes; update with `vitest -u`
- [x] **A2** Doc-integrity check (`scripts/check-docs.mjs`, in `npm run check` + CI) — INDEX == reports, no broken intra-repo links, current-release == `package.json`
- [x] **A3** Release-safety audit (`scripts/check-release-safety.mjs` + `release-safety` CI job) — fails on a `vX.Y.Z` tag with no GitHub Release
- [x] **B4** API stability tiers (`docs/STABILITY.md` + `tests/api/stability.test.ts`) — Stable vs Experimental, enforced against the live export surface
- [x] **B5** Path-to-1.0 — [ADR 0004](adr/0004-path-to-1.0.md): `0.1.x → 0.2.0 → 1.0`; freeze a curated Stable core; gates = 0.2.0 shipped (Node 24) + OpenAPI contract coverage + Experimental tier emptied
- [x] **C6** Security proofs in CI — `tests/security/{sql-injection,sort-injection-http}.test.ts` (FT187/FT179 attack matrices run in `npm run check`); `nene2-node-FT` sandboxes demoted to optional companions
- [ ] **D7** Generate `INDEX.md` from frontmatter; consolidate thin FT reports
- [x] **E9** Release automation — `release:prepare` / `release:publish` scripts (CHANGELOG roll, version/tag checks, `gh release create`)
- [x] **E8** `CLAUDE.md` decision trees (FT vs skip; in-tree vs sandbox; release-now vs accumulate; public-export change)

Start order: **A1 → A2 → B4**.

---

## Field trials

See `docs/development/field-trial-culture.md`. **FT1–187** complete; index: `docs/field-trials/INDEX.md`. The FT178–349 catalog's actionable bucket is closed (see [catalog Progress](field-trials/ft178-349-catalog.md)). Next: **Phase 9** AI-velocity hardening (above); optionally a new FT range (PHP FT350+) or **0.2.0** breaking-change inventory ([decisions pending](milestones/semver-0.2.0-breaking-inventory.md)).

---

## Non-goals

See `docs/scope.md` — no nene2-js client, no nene-mcp stdio duplicate, no 165+ PHP FT apps copied verbatim.
