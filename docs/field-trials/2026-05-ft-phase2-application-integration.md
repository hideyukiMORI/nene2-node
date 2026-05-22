# FT Phase 2 — Application integration (FT67+)

**Status:** Active from 2026-05-22  
**Issue:** [#51](https://github.com/hideyukiMORI/nene2-node/issues/51) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29))  
**Prior phase:** FT1–66 validated framework modules + docs (see [INDEX.md](INDEX.md)).

## Why pivot now

Framework-part FTs (middleware, Problem Details, `createApp` DI, …) are **documented and test-backed**. Remaining risk is **consumer experience**:

- Installing `@hideyukimori/nene2-framework` into a **new repo** and wiring a real DB
- **MySQL / PostgreSQL** (not only `node:sqlite`)
- **Typical business-app obstacles** (migrations, auth + DB, nested resources, deploy)

This mirrors nene2-python **FT1–18** (sandbox apps) and NENE2 **howto / \*log** apps — without copying 100+ PHP FTs verbatim.

## Current data-plane reality (honest baseline)

| Capability                       | Today | Gap                                       |
| -------------------------------- | ----- | ----------------------------------------- |
| `DatabaseQueryExecutor` port     | ✅    | —                                         |
| `SqliteQueryExecutor` + examples | ✅    | —                                         |
| MySQL adapter                    | ❌    | Needs driver + adapter Issue              |
| PostgreSQL adapter               | ❌    | Needs driver + adapter Issue              |
| Docker Compose for FT/CI         | ❌    | Stretch in Phase 4 milestone              |
| Migrations                       | 📄    | Documented app-owned — [#54](https://github.com/hideyukiMORI/nene2-node/issues/54); not exercised in sandbox yet |

Phase 2 FTs may **start with friction reports + Docker recipes** before every adapter lands in `src/`.

## Sandbox strategy

| Tier  | Location                                     | When                                                   |
| ----- | -------------------------------------------- | ------------------------------------------------------ |
| **A** | `../nene2-node-FT/ftNNN-theme/` sibling repo | Full app (install, compose, business slice)            |
| **B** | `src/example/` extension                     | Only when OpenAPI example domain grows in NENE2        |
| **C** | Docs-only FT                                 | Adapter not implemented yet — record friction → Issues |

Prefer **Tier A** for MySQL/Postgres and greenfield install FTs so `nene2-node` stays a library, not a monolith.

## Typical business-app obstacles (checklist)

Use as FT themes and report sections (English reports, Japanese ok in Issues).

### Install & project bootstrap

- [ ] `npm install @hideyukimori/nene2-framework` in empty repo
- [ ] `createApp()` + custom routes alongside examples
- [ ] TypeScript `moduleResolution` / `exports` friction
- [ ] Env file template (`.env.example`) completeness

### Database

- [ ] MySQL connection string → working executor
- [ ] PostgreSQL connection string → working executor
- [ ] Connection pool / serverless (document limits)
- [ ] Migrations (tool choice: Prisma migrate, Drizzle, raw SQL, Flyway-style)
- [ ] Health check with real DB degraded path
- [ ] Transaction across two repositories (order + line items)

### Auth + domain together

- [ ] Bearer on business routes (not only `/examples/protected`)
- [ ] API key for machine routes + user JWT for app routes
- [ ] Row-level ownership (BOLA) in UseCase

### HTTP / API shape

- [ ] Nested REST (e.g. `/orders/{id}/items`)
- [ ] Pagination + sort on list endpoints
- [ ] Optimistic concurrency / ETag (if OpenAPI adds)
- [ ] File upload (if in scope — coordinate NENE2 OpenAPI)

### Operations

- [ ] Docker Compose: app + MySQL (+ optional Redis for throttle)
- [ ] CI job with service container
- [ ] Production env parity (`production-deployment.md`)

### Observability & safety

- [ ] Structured logs with request id in app code
- [ ] No secret leakage in app-level logs
- [ ] Rate limit at edge vs in-process

## FT67–100 mapped themes (revised backlog)

See [backlog.md](backlog.md) Category E/F. Summary:

| Range    | Focus                                                              |
| -------- | ------------------------------------------------------------------ |
| FT67–72  | Install, MySQL, Postgres, Compose, migrations, CI DB job           |
| FT73–80  | Business patterns (nested REST, auth+DB, transactions, list/query) |
| FT81–90  | Publish, npm consumer, nene2-js + Node URL                         |
| FT91–100 | Governance, deprecation, parity audit                              |

## Deliverables per application FT

1. **Sibling sandbox** or reproducible `docker compose` recipe (committed in `nene2-node-FT` or `docs/how-to/` when stable).
2. **English report** with **F-1…** friction → GitHub Issues for code/docs.
3. **Tests** where code lands in framework; otherwise integration script documented in report.
4. Security/adversarial cadence unchanged (FT# % 3 / % 4).

## References

- nene2-python FT10 (MySQL adapter), FT8 (nested REST) — parity background
- `docs/development/database-layer.md`
- `docs/scope.md` — adapters in scope, not yet implemented
