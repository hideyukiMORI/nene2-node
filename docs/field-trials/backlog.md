# Field trial backlog (FT2–FT100)

**Policy:** Docs-first — each FT updates `docs/development/*` (or ADR) when friction appears, then adds a report. Parent Issue: [#29](https://github.com/hideyukiMORI/nene2-node/issues/29).

**Issue gate (Phase 2+):** Do not start FT _N+1_ while any Issue opened from FT _N_ is still open. See [field-trial-culture.md](../development/field-trial-culture.md).

**Cadence:** FT# % 3 = 0 → security diagnosis; FT# % 4 = 0 → adversarial review; both when FT# % 12 = 0.

## Category A — Framework integration (FT2–FT18)

Mirrors nene2-python FT1–18 scope, adapted to shipped nene2-node modules.

| FT# | Theme                     | Module / doc target                              | 🔒  | 🔍  | Status                                           |
| --- | ------------------------- | ------------------------------------------------ | --- | --- | ------------------------------------------------ |
| 1   | Middleware stack          | `createApp`, pipeline doc                        | —   | —   | ✅ [report](2026-05-field-trial-1-middleware.md) |
| 2   | Problem Details factory   | `problem-details.ts`, `api-error-responses.md`   | —   | —   | ✅ batch 1                                       |
| 3   | Domain exception handlers | `domain-exception-handler.ts`, `domain-layer.md` | 🔒  | —   | ✅ batch 1                                       |
| 4   | ValidationException       | `validation/`, `request-validation.md`           | —   | 🔍  | ✅ batch 1                                       |
| 5   | JSON body parse 400       | `parse-json-body.ts`                             | —   | —   | ✅ batch 1                                       |
| 6   | Bearer JWT                | `bearer-token.ts`, `middleware-security.md`      | 🔒  | —   | ✅ batch 1                                       |
| 7   | API key `/machine/health` | `api-key-auth.ts`                                | —   | —   | ✅ batch 1                                       |
| 8   | Request ID                | `request-id.ts`                                  | —   | —   | ✅ batch 1                                       |
| 9   | Security headers          | `security-headers.ts`                            | 🔒  | —   | ✅ batch 1                                       |
| 10  | CORS                      | `cors.ts`, `environment-variables.md`            | —   | —   | ✅ batch 1                                       |
| 11  | Request logging           | `request-logging.ts`                             | —   | —   | ✅ batch 1                                       |
| 12  | Throttle 429              | `throttle.ts`, `production-deployment.md`        | 🔒  | 🔍  | ✅ batch 1                                       |
| 13  | Request size limit        | `request-size-limit.ts`                          | —   | —   | ✅ batch 1                                       |
| 14  | Note CRUD                 | `example/note/`                                  | —   | —   | ✅ batch 1                                       |
| 15  | Tag CRUD                  | `example/tag/`                                   | —   | —   | ✅ batch 1                                       |
| 16  | SQLite query executor     | `database/`, `database-layer.md`                 | —   | 🔍  | ✅ batch 2                                       |
| 17  | Database health 503       | `database-health-check.ts`                       | —   | —   | ✅ batch 2                                       |
| 18  | Transactions              | `sqlite-transaction-manager.ts`                  | 🔒  | —   | ✅ batch 2                                       |

## Category B — Framework deep dive (FT19–FT50)

| FT# | Theme                                         | 🔒   | Status     |
| --- | --------------------------------------------- | ---- | ---------- |
| 19  | `resolveHttpError` mapping                    | —    | ✅ batch 3 |
| 20  | OpenAPI contract fixtures                     | 🔍   | ✅ batch 3 |
| 21  | `createApp` DI options                        | —    | ✅ batch 3 |
| 22  | Pagination query parser                       | —    | ✅ batch 3 |
| 23  | MCP `FetchMcpHttpClient`                      | —    | ✅ batch 3 |
| 24  | App settings matrix                           | 🔒🔍 | ✅ batch 3 |
| 25  | Health check composition                      | —    | ✅ batch 3 |
| 26  | Example schema migration story                | —    | ✅ batch 3 |
| 27  | Throttle path excludes                        | 🔒   | ✅ batch 3 |
| 28  | CORS credentials edge cases                   | 🔍   | ✅ batch 3 |
| 29  | Bearer include/exclude paths                  | —    | ✅ batch 3 |
| 30  | Request logging + request id                  | 🔒   | ✅ batch 3 |
| 31  | Note not-found handler                        | —    | ✅ batch 4 |
| 32  | Tag not-found handler                         | 🔍   | ✅ batch 4 |
| 33  | Validation field errors shape                 | 🔒   | ✅ batch 4 |
| 34  | 404 / notFound hook                           | —    | ✅ batch 4 |
| 35  | Composite auth patterns doc                   | —    | ✅ batch 4 |
| 36  | `npm run dev` DX                              | 🔒🔍 | ✅ batch 4 |
| 37  | `resolveOpenApiPath` policy                   | —    | ✅ batch 4 |
| 38  | Contract test maintenance                     | —    | ✅ batch 4 |
| 39  | Test fixtures hygiene                         | 🔒   | ✅ batch 4 |
| 40  | Multi-domain SQLite                           | 🔍   | ✅ batch 4 |
| 41  | Middleware combinations                       | —    | ✅ batch 4 |
| 42  | Package export surface (`index.ts`)           | 🔒   | ✅ batch 4 |
| 43  | HTTP 405 method-not-allowed                   | —    | ✅ batch 5 |
| 44  | `invalid-json` / body parse                   | 🔍   | ✅ batch 5 |
| 45  | `LocalBearerTokenVerifier` / JWT              | 🔒   | ✅ batch 5 |
| 46  | Hono context (`authClaims`, `credentialType`) | —    | ✅ batch 5 |
| 47  | Pagination edge cases                         | —    | ✅ batch 5 |
| 48  | MCP `FetchMcpHttpClient` security             | 🔒🔍 | ✅ batch 5 |
| 49  | `RateLimitStorage` extension point            | —    | ✅ batch 5 |
| 50  | Category B wrap-up / policy index             | —    | ✅ batch 5 |

## Category C — Node / security / DX (FT51–FT80)

| FT# | Theme                                 | 🔒  | 🔍  | Status     |
| --- | ------------------------------------- | --- | --- | ---------- |
| 51  | Timing-safe secret compare            | 🔒  | —   | ✅ batch 5 |
| 52  | `crypto` secrets vs `Math.random`     | —   | 🔍  | ✅ batch 5 |
| 53  | `npm audit` / dependency cadence      | —   | —   | ✅ batch 5 |
| 54  | Logging redaction                     | 🔒  | —   | ✅ batch 5 |
| 55  | Production Problem Details redaction  | —   | —   | ✅ batch 6 |
| 56  | Env leak prevention                   | —   | 🔍  | ✅ batch 6 |
| 57  | Throttle exclude bypass risk          | 🔒  | —   | ✅ batch 6 |
| 58  | Prototype pollution guards            | —   | —   | ✅ batch 6 |
| 59  | Parameterized SQL reaffirmation       | —   | —   | ✅ batch 6 |
| 60  | Production deployment security pass   | 🔒  | 🔍  | ✅ batch 6 |
| 61  | Health 503 disclosure                 | —   | —   | ✅ batch 6 |
| 62  | Request size DoS edge                 | —   | 🔍  | ✅ batch 6 |
| 63  | Single env reader (`loadAppSettings`) | 🔒  | —   | ✅ batch 6 |
| 64  | Cross-repo parity checklist           | —   | 🔍  | ✅ batch 6 |
| 65  | OIDC release / Trusted Publisher      | —   | —   | ✅ batch 6 |
| 66  | CHANGELOG + version discipline        | 🔒  | —   | ✅ batch 6 |

## Category E — Application & data plane (FT67–FT80) **Phase 2**

**Plan:** [2026-05-ft-phase2-application-integration.md](2026-05-ft-phase2-application-integration.md)

| FT# | Theme                                            | 🔒  | 🔍  | Status                                                                                |
| --- | ------------------------------------------------ | --- | --- | ------------------------------------------------------------------------------------- |
| 67  | npm install greenfield consumer project          | —   | —   | ✅ [report](2026-05-field-trial-67-greenfield-install.md)                             |
| 68  | MySQL: Docker Compose + connection friction      | 🔒  | —   | ✅ [report](2026-05-field-trial-68-mysql-compose.md)                                  |
| 69  | PostgreSQL: Docker Compose + connection friction | —   | —   | ✅ [report](2026-05-field-trial-69-postgres-compose.md)                               |
| 70  | CI service container (MySQL) job design          | —   | 🔍  | ✅ [report](2026-05-field-trial-70-ci-mysql-service.md)                               |
| 71  | Migration story (app-owned vs framework)         | —   | —   | ✅ D0 [report](2026-05-field-trial-71-migration-story.md) — no sandbox friction       |
| 72  | Connection settings / pool documentation         | 🔒  | —   | done — [report](2026-05-field-trial-72-connection-pool.md) **D0**                     |
| 73  | Business app: nested REST slice (order/items)    | —   | 🔍  | done — [report](2026-05-field-trial-73-orders-nested.md) **D3** `ft073-orders-nested` |
| 74  | Bearer on business routes + SQLite/MySQL         | 🔒  | 🔍  | done — [report](2026-05-field-trial-74-bearer-business-routes.md) **D4**              |
| 75  | Multi-step transaction (business UseCase)        | —   | —   | planned **D4**                                                                        |
| 76  | List + filter + pagination at app scale          | —   | 🔍  | planned                                                                               |
| 77  | Compose: app + DB + env template                 | —   | —   | planned                                                                               |
| 78  | BOLA / ownership in UseCase                      | 🔒  | —   | planned                                                                               |
| 79  | Deploy checklist with real DB                    | —   | —   | planned                                                                               |
| 80  | Phase 2 wrap + friction index                    | —   | —   | planned                                                                               |

## Category F — Ecosystem & publish (FT81–FT100)

Themes: npm consumer DX, Trusted Publisher release, CHANGELOG discipline, nene2-js integration sample, ADR for new public APIs, coverage gates, contributor onboarding, AI agent (`AGENTS.md`) accuracy, cross-repo parity checklist, post-1.0 deprecation policy.

| Range  | Focus                   | Status  |
| ------ | ----------------------- | ------- |
| 81–90  | Package & release       | planned |
| 91–100 | Cross-repo & governance | planned |

## Execution batches

| Batch | FT range                   | PR target         |
| ----- | -------------------------- | ----------------- |
| 1     | FT2–FT12 + docs foundation | ✅ PR #30         |
| 2     | FT13–FT18                  | ✅ PR #31         |
| 3     | FT19–FT30                  | ✅ PR #32         |
| 4     | FT31–FT42                  | ✅ PR #33         |
| 5     | FT43–FT54                  | ✅ PR #34         |
| 6     | FT55–FT66                  | ✅ PR #35         |
| 7     | FT67–FT72 (install + DB)   | next — Phase 2    |
| 8     | FT73–FT80 (business apps)  | TBD               |
| 9     | FT81–FT100 (publish/gov)   | TBD               |
| …     | …                          | ~10–12 FTs per PR |

Update [INDEX.md](INDEX.md) when each FT report lands.
