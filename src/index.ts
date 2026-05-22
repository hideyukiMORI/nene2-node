/**
 * @hideyukimori/nene2-framework — NENE2-compatible Node.js API framework.
 */

export { createApp, type CreateAppOptions, type Nene2App } from './app/create-app.js';
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
export {
  DEFAULT_OPENAPI_RELATIVE,
  openApiFileExists,
  resolveOpenApiPath,
} from './openapi/resolve-openapi-path.js';
export { DomainError } from './error/domain-error.js';
export {
  createSimpleDomainHandler,
  type DomainExceptionHandler,
  type SimpleDomainHandlerOptions,
} from './error/domain-exception-handler.js';
export { resolveHttpError, type ResolveHttpErrorOptions } from './error/resolve-http-error.js';
export { ValidationError, type ValidationErrorJSON } from './validation/validation-error.js';
export { ValidationException } from './validation/validation-exception.js';
export { LocalBearerTokenVerifier } from './auth/local-bearer-token-verifier.js';
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
  type RateLimitStorage,
} from './middleware/rate-limit-storage.js';
export { throttleMiddleware, type ThrottleOptions } from './middleware/throttle.js';
export type { DatabaseQueryExecutor } from './database/database-query-executor.js';
export type { DatabaseTransactionManager } from './database/database-transaction-manager.js';
export { createDatabaseHealthCheck } from './database/database-health-check.js';
export { openSqliteDatabase } from './database/open-sqlite-database.js';
export { SqliteQueryExecutor } from './database/sqlite-query-executor.js';
export { SqliteTransactionManager } from './database/sqlite-transaction-manager.js';
export type { SqlParameter, SqlRow } from './database/sql-types.js';

export const FRAMEWORK_PACKAGE_NAME = '@hideyukimori/nene2-framework' as const;
