# Changelog

All notable changes to `@hideyukimori/nene2-framework` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

> **Release status (2026-05-29):** the latest version published to npm / GitHub
> Release is **`0.1.23`**. The `0.1.24` and `0.1.25` sections below were tagged
> but **never published** (no GitHub Release was created). Their changes plus
> everything under `[Unreleased]` will ship in the next release, **`0.1.26`**
> (npm will jump `0.1.23 → 0.1.26`). See `docs/development/release-process.md`.

## [Unreleased]

_Targeting `0.1.26`._

### Added

- `computeETag`, `checkNotModified`, `checkPreconditions` helpers in
  `src/http/conditional-request.ts` for content-hash ETags and conditional
  requests: `If-None-Match`/`If-Modified-Since` → `304`, `If-Match` →
  `412`/`428`, `If-Match: *` wildcard, weak (`W/`) comparison (FT178)
- 19 unit tests in `tests/http/conditional-request.test.ts`
- How-to doc: `docs/how-to/etag-conditional-requests.md`
- FT178 field trial report and the FT178–349 upstream parity triage catalog
  (`docs/field-trials/ft178-349-catalog.md`)
- `parseSortQuery` helper in `src/http/sort-query.ts` — allowlist-based `sort`/`order`
  validation for `ORDER BY` (exact, case-sensitive, O(n), ReDoS-immune); invalid values
  throw `ValidationException` (→ 422). 27 unit tests; how-to + FT179 report; proven by the
  `ft179-sort-injection` sandbox attack matrix (FT179)
- `createCircuitBreaker` + `CircuitOpenError` in `src/resilience/circuit-breaker.ts` — a
  three-state (closed/open/half-open) in-memory circuit breaker with configurable
  `failureThreshold`/`resetTimeoutMs`, lazy half-open transition, single-probe concurrency,
  and injectable clock. 13 unit tests; how-to + FT180 report (FT180)
- `createLockManager` + `InMemoryLockStorage` in `src/concurrency/distributed-lock.ts` — a
  leased distributed lock with owner verification and TTL expiry: `acquire` (null when held
  by another), `release`/`renew` (owner-verified, `forbidden` on mismatch), `status`, and a
  pluggable `LockStorage` adapter. 13 unit tests covering ATK-01–04; how-to + FT181 report (FT181)
- `createValidationCollector` in `src/validation/validation-collector.ts` — accumulates
  `ValidationError`s with `scope(prefix)` for nested indexed paths (`items.0.product_id`) and
  `throwIfAny()` to raise a single `ValidationException` (→ 422) with every error. 7 unit tests;
  how-to + FT182 report (FT182)
- `applyMergePatch` in `src/http/merge-patch.ts` — RFC 7396 JSON Merge Patch with
  `null`-deletes / `defaults` reset, recursive object merge, and `immutable`/`allowed` key
  guards that raise a single `ValidationException` (→ 422). Never mutates the target. 15 unit
  tests; how-to + FT183 report (FT183)
- `countCodePoints`, `hasNullByte`, `validateTextField` in `src/validation/validate-text.ts` —
  Unicode-safe text validation that counts code points (not UTF-16 units, avoiding the
  `'🎉'.length === 2` trap), rejects null bytes, and records failures into a
  `ValidationCollector`. 17 unit tests; how-to + FT184 report (FT184)
- `checkUrlSafety` / `checkUrlSafetyAsync` / `assertSafeUrl` / `isPrivateIp` in
  `src/security/safe-url.ts` — SSRF guard for user-supplied URLs: scheme allowlist,
  `localhost`/`*.localhost`, private/loopback/link-local IP literals (incl. decimal/hex
  obfuscation and IPv6/IPv4-mapped), and an optional DNS-rebinding resolver hook. 38 unit
  tests; how-to + FT185 report (FT185)

## [0.1.25] - 2026-05-27

### Changed

- `parsePaginationQuery`: replaced `Number.parseInt` with a strict O(n) digit-only check
  (`isDigitString`) — floats (`10.5`, `1e2`), signed/padded (`+10`, ` 10`), hex (`0x10`),
  and strings longer than 18 characters now throw `ValidationException` with
  `code: 'invalid_type'` instead of being silently coerced (VULN-C/D/E/F/L)
- `parseCursorQuery`: applied the same `isDigitString` + 18-char overflow guard to `limit`
  parsing for consistency

### Added

- 37 unit tests in `tests/http/pagination-query.test.ts` covering attack vectors from
  FT177: float injection, signed/padded, overflow, SQL injection strings, ReDoS timing
- How-to doc: `docs/how-to/pagination-boundary-attack.md`
- FT177 field trial report: `docs/field-trials/2026-05-field-trial-177-pagination-boundary.md`

## [0.1.24] - 2026-05-27

### Added

- `parseCursorQuery(searchParams, defaults?)` helper for cursor-based pagination (`src/http/cursor-query.ts`)
- `CursorQuery` interface exported from the public API
- Cursor silently falls back to `undefined` (first page) on invalid input — matches NENE2 PHP `ctype_digit` convention
- 22 unit tests in `tests/http/cursor-query.test.ts`
- How-to docs: `docs/how-to/cursor-pagination.md`, `docs/how-to/activity-feed.md`
- FT153 field trial report: `docs/field-trials/2026-05-field-trial-153-activity-feed.md`

## [0.1.23] - 2026-05-27

### Added

- Redis integration test (`tests/integration/redis-integration.test.ts`) — covers `createRedisKeyValueClientFromUrl`, `RedisRateLimitStorage`, and `RedisIdempotencyStorage` against a real Redis instance; skips when `NENE2_NODE_TEST_REDIS_URL` is unset
- `redis-integration` CI job with Redis 7 service container (#110)

## [0.1.22] - 2026-05-27

### Added

- Unit tests for `createDatabaseRuntime` MySQL and PostgreSQL branches (mocked pools, read replica, shutdown, backend-mismatch errors)
- `npm audit --audit-level=high` step in CI `check` job
- `docs/milestones/semver-0.2.0-breaking-inventory.md` — candidate breaking-change list for a future 0.2.0 release

## [0.1.21] - 2026-05-22

### Added

- Example note/tag `created_at` column persisted as UTC ISO-8601 via `utcNowIso()`
- JSON responses include `created_at` (FT148 / FT115 follow-up)

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
