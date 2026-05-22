# Changelog

All notable changes to `@hideyukimori/nene2-framework` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

## [Unreleased]

_No changes yet._

## [0.1.20] - 2026-05-22

### Changed

- `createApp()` registers default domain handlers: `transaction-aborted` (422), `version-conflict` (409), `forbidden` (403)
- Resolves FT106 gap — transaction rollback errors no longer require manual handler wiring

## [0.1.19] - 2026-05-22

### Changed

- Example note/tag UseCases enforce row ownership via `assertResourceOwner` (BOLA mitigation, FT146)
- `/examples/notes` and `/examples/tags` require Bearer auth when examples are enabled
- Repositories persist `owner_id`; list queries are scoped to JWT `sub`

### Added

- `createResourceAccessDeniedHandler` wired into example module domain handlers
- HTTP and UseCase tests for cross-user **403** responses

## [0.1.18] - 2026-05-22

### Added

- Branch-focused unit tests for middleware, HTTP helpers, validation, OpenAPI path resolution, database health check, and shutdown handlers
- Coverage gate raised to **80%** branches in CI

## [0.1.17] - 2026-05-22

### Added

- UseCase not-found tests for note/tag update and delete paths
- Per-file **90%** coverage gate for example UseCase modules (nene2-python parity)

## [0.1.16] - 2026-05-22

### Added

- Unit tests for MySQL/Postgres executors (mocked), health-check, throttle factories, redis wrapper
- Coverage gate raised to **80%** lines/statements in CI

## [0.1.15] - 2026-05-22

### Added

- `NENE2_NODE_INCLUDE_EXAMPLES` / `createApp({ includeExamples })` — disable reference `/examples/*` in production
- `createJoseJwtVerifier` for production IdP JWKS (optional peer `jose`)
- `registerProcessShutdown()` for SIGTERM/SIGINT pool cleanup
- `docs/development/commercial-readiness.md`

### Changed

- `TokenVerifier.verify` may return `Promise` (async JWKS verification)
- Production env defaults `includeExamples` to `false`

## [0.1.14] - 2026-05-22

### Changed

- `requestBodyHash` uses SHA-256 hex (idempotency body fingerprint)
- `securityHeadersMiddleware` accepts `enableHsts` — set in production via `createApp()`
- Example note/tag wiring extracted to `wire-example-module.ts`

### Added

- Vitest coverage (`npm run test:coverage`) with CI reporting and thresholds
- `npm run test:integration` for MySQL/PostgreSQL service-container tests (excluded from default `npm test`)

## [0.1.13] - 2026-05-22

### Added

- `RedisRateLimitStorage`, `RedisIdempotencyStorage`, `RedisKeyValueClient` (FT141–142)
- `createRedisKeyValueClientFromUrl`, `createThrottleStorageFromEnvAsync` (FT141)
- Webhook timestamp replay window via `X-Webhook-Timestamp` (FT143)
- Optional peer dependency `redis`

## [0.1.12] - 2026-05-22

### Added

- `runTransaction`, `TransactionAbortedError`, `createTransactionAbortedHandler` (FT137 / FT106)
- UTC timestamp helpers `parseUtcIsoTimestamp`, `formatUtcIsoTimestamp`, `utcNowIso` (FT138 / FT115)
- `FileIdempotencyStorage` (FT139)
- `createThrottleStorage`, `createThrottleStorageFromEnv` (FT140)

## [0.1.11] - 2026-05-22

### Added

- `webhookSignatureMiddleware` + `computeWebhookSignature` (FT133 / FT125)
- `NENE2_NODE_DATABASE_READ_URL` → `database.readExecutor` (FT134 / FT118)
- `FileRateLimitStorage` for file-backed throttling (FT135 / FT95 partial)
- Idempotency in-flight dedupe for concurrent duplicate keys (FT136)

## [0.1.10] - 2026-05-22

### Added

- Optimistic concurrency: `VersionConflictError`, `parseIfMatchVersion`, `assertRowsAffected` (FT130)
- BOLA helper: `assertResourceOwner`, `ResourceAccessDeniedError` → 403 (FT132)
- `jwtSubThrottleKey` / `ipThrottleKey` for per-user throttling (FT131)
- Docs: `optimistic-concurrency.md`, `resource-ownership.md`, `throttle-storage-adapters.md`

## [0.1.9] - 2026-05-22

### Added

- `classifyDatabaseError()` and automatic **409** / **422** mapping in `resolveHttpError` (FT127, FT129)
- `idempotencyMiddleware()`, `InMemoryIdempotencyStorage`, `requestBodyHash` (FT128)
- [database-constraint-errors.md](docs/development/database-constraint-errors.md)

## [0.1.8] - 2026-05-22

### Added

- `PostgresTransactionManager` on `Nene2App.database.transactionManager` (FT81)
- CI `postgres-integration` job (FT82)
- Phase 2 friction index and deploy checklist docs (FT79–80, campaign #71)

## [0.1.7] - 2026-05-22

### Added

- Export `parsePaginationQuery` and `PaginationQuery` for business-app list endpoints (FT76)

## [0.1.6] - 2026-05-22

### Added

- `MysqlTransactionManager` and `Nene2App.database.transactionManager` (MySQL/SQLite) for atomic business writes (FT75)

## [0.1.5] - 2026-05-22

### Added

- `CreateAppOptions.bearerIncludePaths` — protect app business routes with bearer middleware (FT74)

## [0.1.4] - 2026-05-22

### Added

- `Nene2App.database` — `{ executor, backend }` when `NENE2_NODE_DATABASE_URL` is set (FT73 business-app pattern)

## [0.1.3] - 2026-05-22

### Added

- `docs/development/database-migrations.md` — application-owned migrations vs framework example bootstrap (FT71)

## [0.1.2] - 2026-05-22

### Added

- GitHub Actions `mysql-integration` job (MySQL 8.4 service container)
- `tests/database/mysql-integration.test.ts` (skipped unless `NENE2_NODE_TEST_MYSQL_URL` is set)
- `docs/development/ci-mysql-service.md`

### Fixed

- MySQL adapter uses `query()` instead of `execute()` so `LIMIT ? OFFSET ?` works under MySQL 8.4

## [0.1.1] - 2026-05-22

### Fixed

- PostgreSQL `insert()` now appends `RETURNING id` so example CRUD receives correct primary keys

### Added

- MySQL (`mysql2`) and PostgreSQL (`pg`) `DatabaseQueryExecutor` adapters via `createDatabaseRuntime()`
- Async `DatabaseQueryExecutor`, repositories, use cases, and `createApp()` (returns `Promise<Nene2App>`)
- Optional `shutdown()` on `Nene2App` for connection pool cleanup
- `peerDependencies` on `@hono/node-server` for consumers

### Changed

- `/health` uses `buildHealthResponseAsync` when database checks are registered
- Removed `assertSqliteDatabaseUrl()` — non-SQLite URLs connect through `createApp()`

## [0.1.0] - 2026-05-22

### Added

- Hono runtime (`createApp`) with RFC 9457 Problem Details
- System routes: `/`, `/health`, `/examples/ping`, `/machine/health`, `/examples/protected`
- Domain exception registry, validation (`validation-failed`), Bearer JWT (HS256)
- Throttle (429), CORS (explicit origins), JSON request logging
- Example Note CRUD at `/examples/notes`
- Database layer: `DatabaseQueryExecutor`, `SqliteTransactionManager`, health probe
- `FetchMcpHttpClient` for MCP HTTP tool calls (not stdio MCP)
- OpenAPI contract tests and `npm run dev`

### Notes

- OpenAPI contract source: [NENE2](https://github.com/hideyukiMORI/NENE2) `docs/openapi/openapi.yaml`
- Parity reference: [nene2-python](https://github.com/hideyukiMORI/nene2-python)
