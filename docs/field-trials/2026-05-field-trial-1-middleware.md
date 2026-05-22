# Field trial report — FT1: Middleware stack validation

**Date:** 2026-05-22  
**Theme:** Validate Phase 2b middleware pipeline order, configuration, and automated coverage in `createApp()`  
**Security diagnosis:** N/A — FT#1 % 3 ≠ 0  
**Adversarial review:** N/A — FT#1 % 4 ≠ 0

**Issue:** [#26](https://github.com/hideyukiMORI/nene2-node/issues/26)  
**Upstream (parity):** nene2-python framework FT tradition (middleware / integration); NENE2 Phase 2 middleware docs

---

## Context

| Item                         | Notes                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| nene2-node branch / tag      | `main` @ post-PR #27 (Tag CRUD); FT branch `docs/26-field-trial-1-middleware`                                                              |
| Node.js version              | `>=22` (CI and local `node -v` 22.x)                                                                                                       |
| OpenAPI operations exercised | `/health`, `/examples/ping`, `/examples/protected`, `/examples/notes`, `/examples/tags`, `/machine/health` (indirect via middleware paths) |
| Sandbox path                 | `src/app/create-app.ts`, `src/middleware/*`, `tests/middleware/*`, `tests/http/*`                                                          |

## Goal

Prove that the documented middleware pipeline (request id → security headers → logging → CORS → size limit → throttle → API key → Bearer → routes) is implemented consistently, configurable via `app-settings`, and covered by Vitest without requiring a separate sandbox repo.

## Implementation summary

No new runtime code in this FT. Evidence gathered from:

- `docs/development/middleware-pipeline.md` (order table)
- `src/app/create-app.ts` (actual `app.use` sequence)
- Unit tests: `tests/middleware/throttle.test.ts`, `cors.test.ts`, `request-logging.test.ts`
- Integration tests: `tests/http/bearer-protected.test.ts`, `tests/http/runtime.test.ts`, `tests/http/health-database.test.ts`
- Phase 2b deliverables (PR #18): throttle, CORS, request logging

## Commands run

```bash
npm run check
node -v
```

## Test results

```text
66 passed (20 test files) — lint, typecheck, vitest, build
```

## Friction points

### F-1: Pipeline doc lags route registration (severity: low)

**Observed:** `middleware-pipeline.md` listed only `registerNoteRoutes` until Phase 6; Tag routes were added without updating the table in the same PR initially.  
**Cause:** Example domains grow faster than the single pipeline doc line.  
**Action:** Keep pipeline doc row 10 as “example route registrars” or auto-check in review checklist; fixed in PR #27 follow-up.

### F-2: Throttle defaults are easy to misread (severity: medium)

**Observed:** Throttle is optional and uses in-memory storage; production deployers must set explicit limits and external store — not obvious from `createApp()` alone.  
**Cause:** Dev-friendly defaults in `app-settings`.  
**Action:** Already documented in `middleware-pipeline.md` and `middleware-security.md`; consider a short “production checklist” Issue if friction repeats.

If none beyond above: _No blocking implementation friction._

## Developer Experience (DX) review

### Persona 1 — Beginner backend

| Question                  | Notes                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Documentation clarity** | `middleware-pipeline.md` gives order and env vars; `app-settings.ts` is the source of truth. Beginners can trace `createApp()` top-to-bottom. |
| **Accident risk**         | **medium** — reordering `app.use` breaks auth/CORS expectations.                                                                              |
| **Convention ergonomics** | Once order is learned, adding a middleware module + one `use` line is mechanical.                                                             |

### Persona 2 — Low-skill maintainer

| Question                   | Notes                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Copy-paste safety**      | Copying a single middleware file is safe; copying partial `createApp` blocks is not. |
| **Extension traps**        | Placing Bearer before API key or skipping size limit breaks parity tests.            |
| **Security accident risk** | **medium** — disabling throttle/CORS via env without reading security doc.           |

### Persona 3 — Frontend-leaning full stack

| Question                        | Notes                                                                    |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Error response quality**      | 429 throttle and 401/403 auth return Problem Details with stable `type`. |
| **Node-specific learning cost** | Hono `app.use` order vs Express — doc table reduces surprise.            |
| **Accident risk**               | **low** for read-only API consumers.                                     |

### Persona 4 — Experienced backend

| Question                   | Notes                                                                     |
| -------------------------- | ------------------------------------------------------------------------- |
| **Framework differences**  | Explicit wiring vs Nest guards — aligns with nene2-python thin framework. |
| **Thin-framework opinion** | Acceptable; middleware modules are small and testable in isolation.       |
| **Production readiness**   | Review `NENE2_NODE_*` env matrix and rate-limit storage before scale-out. |

### Persona 5 — Senior engineer / reviewer

| Question                        | Notes                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Review checkpoints**          | (1) `createApp` order, (2) CORS origin allowlist, (3) Bearer path prefix, (4) API key on `/machine/health`, (5) throttle key extractor |
| **Static analysis gaps**        | ESLint cannot detect wrong middleware order.                                                                                           |
| **Safe subset (“convex hull”)** | Consumers should use `createApp()` defaults, not fork order.                                                                           |
| **Tooling follow-ups**          | Optional: comment anchors in `create-app.ts` matching pipeline table numbers.                                                          |

### Persona 6 — Policy alignment

| Question                      | Notes                                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| **Policy achievement**        | **high** — OpenAPI-aligned errors, no secrets in repo, English docs    |
| **Beginner-safe API surface** | **medium** — env-driven security requires reading two docs             |
| **Design debt / doc gaps**    | Pipeline doc should mention all example registrars when Phase 6+ lands |
| **Follow-up Issues**          | None required from FT1; optional production checklist Issue            |

**DX summary:** Middleware stack is production-plausible for v0.1.x with clear docs and tests. Main DX risk is **order sensitivity** in `createApp()` and **env configuration** for CORS/throttle in deployment.

---

## Security diagnosis

**N/A** — FT#1 is not divisible by 3. Scheduled at FT3, FT6, FT9, etc. per `field-trial-culture.md`.

---

## Adversarial review (cracker-style)

**N/A** — FT#1 is not divisible by 4. Scheduled at FT4, FT8, FT12, etc.

---

## Observations

- Middleware modules are independently unit-tested; integration tests confirm Bearer and runtime headers without a live server process.
- `onError` / `notFound` hooks register Problem Details before middleware — matches documented row 1.
- CORS requires explicit origins (`NENE2_NODE_CORS_ORIGINS`); empty means no CORS middleware — safe default.
- Request size limit runs before throttle, reducing abuse surface before rate-limit accounting.
- Phase 6 Tag routes did not require middleware changes — confirms example domains stay behind the same stack.

## Follow-up Issues

- None from FT1. Revisit throttle storage guidance when a distributed store adapter is proposed.

## Reminder

This report contains no secrets, tokens, or production URLs.
