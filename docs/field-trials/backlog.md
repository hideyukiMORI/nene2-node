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

| FT# | Theme                                            | 🔒  | 🔍  | Status                                                                                                                                    |
| --- | ------------------------------------------------ | --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 67  | npm install greenfield consumer project          | —   | —   | ✅ [report](2026-05-field-trial-67-greenfield-install.md)                                                                                 |
| 68  | MySQL: Docker Compose + connection friction      | 🔒  | —   | ✅ [report](2026-05-field-trial-68-mysql-compose.md)                                                                                      |
| 69  | PostgreSQL: Docker Compose + connection friction | —   | —   | ✅ [report](2026-05-field-trial-69-postgres-compose.md)                                                                                   |
| 70  | CI service container (MySQL) job design          | —   | 🔍  | ✅ [report](2026-05-field-trial-70-ci-mysql-service.md)                                                                                   |
| 71  | Migration story (app-owned vs framework)         | —   | —   | ✅ D0 [report](2026-05-field-trial-71-migration-story.md) — no sandbox friction                                                           |
| 72  | Connection settings / pool documentation         | 🔒  | —   | done — [report](2026-05-field-trial-72-connection-pool.md) **D0**                                                                         |
| 73  | Business app: nested REST slice (order/items)    | —   | 🔍  | done — [report](2026-05-field-trial-73-orders-nested.md) **D3** `ft073-orders-nested`                                                     |
| 74  | Bearer on business routes + SQLite/MySQL         | 🔒  | 🔍  | done — [report](2026-05-field-trial-74-bearer-business-routes.md) **D4**                                                                  |
| 75  | Multi-step transaction (business UseCase)        | —   | —   | done — [report](2026-05-field-trial-75-order-transaction.md) **D4**                                                                       |
| 76  | List + filter + pagination at app scale          | —   | 🔍  | done — [report](2026-05-field-trial-76-orders-list-filter.md) **D4**                                                                      |
| 77  | Compose: app + DB + env template                 | —   | —   | done — [report](2026-05-field-trial-77-compose-app-db-env-template.md) **D5**                                                             |
| 78  | BOLA / ownership in UseCase                      | 🔒  | —   | done — [report](2026-05-field-trial-78-bola-row-ownership-in-usecase.md) **D4**                                                           |
| 79  | Deploy checklist with real DB                    | —   | —   | done — [report](2026-05-field-trial-79-deploy-checklist-with-real-db.md) **D5**                                                           |
| 80  | Phase 2 wrap + friction index                    | —   | —   | done — [phase2-friction-index.md](2026-05-phase2-friction-index.md) **D0**                                                                |
| 81  | PostgreSQL `transactionManager`                  | —   | —   | done — [report](2026-05-field-trial-81-postgresql-transactionmanager.md) **D4**                                                           |
| 82  | PostgreSQL CI service job                        | —   | 🔍  | done — [report](2026-05-field-trial-82-postgresql-ci-service-job.md) **D2**                                                               |
| 83  | Composite auth API key + Bearer                  | 🔒  | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 84  | Idempotency-Key header                           | —   | —   | done — [report](2026-05-field-trial-128-idempotency-key-middleware.md) **D4** [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) |
| 85  | Optimistic concurrency / version                 | —   | —   | done — FT130 / [#75](https://github.com/hideyukiMORI/nene2-node/issues/75) **D4**                                                         |
| 86  | Graceful shutdown / pool drain                   | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 87  | Pool exhaustion under burst                      | 🔒  | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 88  | Invalid `DATABASE_URL` at boot                   | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 89  | SQLite file lock (WAL)                           | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 90  | Example schema on business DB URL                | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 91  | Export `ValidationException` surface             | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 92  | Domain handler registration order                | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 93  | Problem Details `instance` URI                   | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 94  | CORS preflight + Bearer                          | —   | 🔍  | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 95  | Throttle Redis storage                           | 🔒  | —   | done — FT141 / FT144 [report](2026-05-field-trial-144-redis-compose-e2e.md)                                                               |
| 96  | Bulk JSON / request size                         | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 97  | SQL injection parameterized reaffirm             | —   | 🔍  | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 98  | JWT expiry / clock skew                          | 🔒  | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 99  | JWT alg=none rejection                           | 🔒  | 🔍  | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 100 | API key rotation story                           | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 101 | OpenAPI path monorepo cwd                        | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 102 | peer dep `hono` drift                            | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 103 | ESM `.js` imports in consumer TS                 | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 104 | npm provenance verify                            | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 105 | Double `createDatabaseRuntime` pool              | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 106 | Partial TX failure messaging                     | —   | —   | done — FT147 / [#100](https://github.com/hideyukiMORI/nene2-node/issues/100) **D3**                                                       |
| 107 | Nested route invalid id 404/422                  | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 108 | N+1 / unpaginated list                           | —   | 🔍  | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 109 | Health check slow DB                             | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 110 | Partial degraded health                          | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 111 | Missing Content-Type JSON                        | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 112 | Unique violation → 409                           | —   | —   | done — FT127 / [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) **D4**                                                         |
| 113 | FK violation → 422                               | —   | —   | done — FT129 / [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) **D4**                                                         |
| 127 | Unique → 409 sandbox                             | —   | —   | done — [report](2026-05-field-trial-127-unique-violation-409-sandbox.md) **D4**                                                           |
| 128 | Idempotency middleware                           | —   | —   | done — [report](2026-05-field-trial-128-idempotency-key-middleware.md) **D4**                                                             |
| 129 | FK → 422 sandbox                                 | —   | —   | done — [report](2026-05-field-trial-129-fk-violation-422-sandbox.md) **D4**                                                               |
| 130 | Optimistic version sandbox                       | —   | —   | done — [report](2026-05-field-trial-130-optimistic-version-sandbox.md) **D4**                                                             |
| 131 | JWT `sub` throttle key                           | —   | —   | done — [report](2026-05-field-trial-131-jwt-sub-throttle-key.md) **D3**                                                                   |
| 132 | BOLA `assertResourceOwner`                       | 🔒  | —   | done — [report](2026-05-field-trial-132-bola-assert-resource-owner.md) **D4**                                                             |
| 114 | utf8mb4 emoji MySQL                              | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 115 | TIMESTAMP timezone                               | —   | —   | done — FT148 / [#102](https://github.com/hideyukiMORI/nene2-node/issues/102) **D3**                                                       |
| 116 | NULL vs undefined in repos                       | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 117 | Serverless pool lifecycle                        | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 118 | Read replica URL                                 | —   | —   | done — FT134 / FT145 [report](2026-05-field-trial-145-mysql-read-replica-e2e.md)                                                          |
| 119 | SSL mysql/postgres URLs                          | 🔒  | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 120 | Compose profiles dev/prod                        | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 121 | nene2-js Problem Details parity                  | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 122 | AGENTS.md accuracy                               | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 123 | Semver / breaking policy                         | —   | —   | done — campaign [#71](https://github.com/hideyukiMORI/nene2-node/issues/71)                                                               |
| 124 | Rate limit per JWT `sub`                         | 🔒  | —   | done — FT131 / [#75](https://github.com/hideyukiMORI/nene2-node/issues/75) **D3**                                                         |
| 125 | Webhook HMAC middleware                          | 🔒  | —   | done — FT133 / v0.1.11                                                                                                                    |
| 126 | Campaign wrap / FT127+ plan                      | —   | —   | done — [report](2026-05-field-trial-126-campaign-wrap-ft127-.md) **D0**                                                                   |
| 146 | BOLA in example note/tag UseCases                | 🔒  | —   | done — [report](2026-05-field-trial-146-bola-example-usecases.md) **D4** [#98](https://github.com/hideyukiMORI/nene2-node/issues/98)      |
| 147 | Default domain handlers in createApp             | —   | —   | done — [report](2026-05-field-trial-147-default-domain-handlers.md) **D3** [#100](https://github.com/hideyukiMORI/nene2-node/issues/100)  |
| 148 | UTC `created_at` on example note/tag             | —   | —   | done — [report](2026-05-field-trial-148-utc-created-at-example.md) **D3** [#102](https://github.com/hideyukiMORI/nene2-node/issues/102)   |

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
