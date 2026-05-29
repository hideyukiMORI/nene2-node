/**
 * @hideyukimori/nene2-framework — NENE2-compatible Node.js API framework.
 */

export {
  createApp,
  type CreateAppOptions,
  type Nene2App,
  type Nene2AppDatabase,
} from './app/create-app.js';
export { loadAppSettings, type AppSettings } from './config/app-settings.js';
export {
  buildHealthResponse,
  buildHealthResponseAsync,
  type AsyncHealthCheck,
  type DependencyHealthValue,
  type HealthCheck,
  type HealthCheckResult,
} from './http/health-check.js';
export {
  createProblemDetailsFactory,
  problemDetailsFromContext,
  type ProblemDetailsBody,
  type ProblemDetailsFactory,
  type ValidationErrorItem,
} from './http/problem-details.js';
export { parsePaginationQuery, type PaginationQuery } from './http/pagination-query.js';
export { parseCursorQuery, type CursorQuery } from './http/cursor-query.js';
export {
  computeETag,
  checkNotModified,
  checkPreconditions,
  type PreconditionOptions,
} from './http/conditional-request.js';
export {
  DEFAULT_OPENAPI_RELATIVE,
  openApiFileExists,
  resolveOpenApiPath,
} from './openapi/resolve-openapi-path.js';
export { DomainError } from './error/domain-error.js';
export { VersionConflictError } from './error/version-conflict-error.js';
export { ResourceAccessDeniedError } from './error/resource-access-denied-error.js';
export { createVersionConflictHandler } from './error/version-conflict-handler.js';
export { createResourceAccessDeniedHandler } from './error/resource-access-denied-handler.js';
export { TransactionAbortedError } from './error/transaction-aborted-error.js';
export { createTransactionAbortedHandler } from './error/transaction-aborted-handler.js';
export { runTransaction } from './database/run-transaction.js';
export { formatUtcIsoTimestamp, parseUtcIsoTimestamp, utcNowIso } from './domain/timestamps.js';
export {
  assertRowsAffected,
  assertVersionMatch,
  parseIfMatchVersion,
  type AssertRowsAffectedOptions,
} from './domain/optimistic-concurrency.js';
export { assertResourceOwner, authSubFromContext } from './domain/resource-ownership.js';
export {
  createSimpleDomainHandler,
  type DomainExceptionHandler,
  type SimpleDomainHandlerOptions,
} from './error/domain-exception-handler.js';
export { resolveHttpError, type ResolveHttpErrorOptions } from './error/resolve-http-error.js';
export {
  classifyDatabaseError,
  type DatabaseConstraintKind,
} from './error/classify-database-error.js';
export { ValidationError, type ValidationErrorJSON } from './validation/validation-error.js';
export { ValidationException } from './validation/validation-exception.js';
export { LocalBearerTokenVerifier } from './auth/local-bearer-token-verifier.js';
export { createJoseJwtVerifier, type JoseJwtVerifierOptions } from './auth/jose-jwt-verifier.js';
export { TokenVerificationException } from './auth/token-verification-exception.js';
export type { TokenVerifier } from './auth/token-verifier.js';
export { bearerTokenMiddleware, type BearerTokenOptions } from './middleware/bearer-token.js';
export { corsMiddleware, type CorsOptions } from './middleware/cors.js';
export {
  requestLoggingMiddleware,
  type RequestLogEntry,
  type RequestLoggingOptions,
} from './middleware/request-logging.js';
export {
  InMemoryRateLimitStorage,
  type RateLimitHit,
  type RateLimitStorage,
} from './middleware/rate-limit-storage.js';
export { FileRateLimitStorage } from './middleware/file-rate-limit-storage.js';
export { FileIdempotencyStorage } from './middleware/file-idempotency-storage.js';
export {
  createThrottleStorage,
  createThrottleStorageFromEnv,
  createThrottleStorageFromEnvAsync,
  type CreateThrottleStorageOptions,
  type ThrottleStorageKind,
} from './middleware/create-throttle-storage.js';
export {
  wrapNodeRedisClient,
  type NodeRedisLikeClient,
  type RedisKeyValueClient,
} from './middleware/redis-key-value-client.js';
export { createRedisKeyValueClientFromUrl } from './middleware/create-redis-client.js';
export { RedisRateLimitStorage } from './middleware/redis-rate-limit-storage.js';
export { RedisIdempotencyStorage } from './middleware/redis-idempotency-storage.js';
export {
  webhookSignatureMiddleware,
  computeWebhookSignature,
  type WebhookSignatureOptions,
} from './middleware/webhook-signature.js';
export { throttleMiddleware, type ThrottleOptions } from './middleware/throttle.js';
export { ipThrottleKey, jwtSubThrottleKey } from './middleware/throttle-keys.js';
export {
  idempotencyMiddleware,
  requestBodyHash,
  type IdempotencyOptions,
} from './middleware/idempotency.js';
export {
  InMemoryIdempotencyStorage,
  type IdempotencyRecord,
  type IdempotencyStorage,
} from './middleware/idempotency-storage.js';
export type { DatabaseQueryExecutor } from './database/database-query-executor.js';
export type { DatabaseTransactionManager } from './database/database-transaction-manager.js';
export { createDatabaseHealthCheck } from './database/database-health-check.js';
export { createDatabaseRuntime, type DatabaseRuntime } from './database/create-database-runtime.js';
export { MysqlQueryExecutor, createMysqlPool } from './database/mysql-query-executor.js';
export { MysqlTransactionManager } from './database/mysql-transaction-manager.js';
export { parseDatabaseUrl, type DatabaseBackend } from './database/parse-database-url.js';
export { PostgresQueryExecutor } from './database/postgres-query-executor.js';
export { PostgresTransactionManager } from './database/postgres-transaction-manager.js';
export { openSqliteDatabase } from './database/open-sqlite-database.js';
export { SqliteQueryExecutor } from './database/sqlite-query-executor.js';
export { SqliteTransactionManager } from './database/sqlite-transaction-manager.js';
export { translateQuestionPlaceholders } from './database/translate-sql-placeholders.js';
export type { SqlParameter, SqlRow } from './database/sql-types.js';
export {
  FetchMcpHttpClient,
  type FetchMcpHttpClientOptions,
  type McpHttpClient,
} from './mcp/mcp-http-client.js';
export type { McpHttpResponse } from './mcp/mcp-http-response.js';
export { registerProcessShutdown } from './server/register-process-shutdown.js';

export const FRAMEWORK_PACKAGE_NAME = '@hideyukimori/nene2-framework' as const;
