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

export const FRAMEWORK_PACKAGE_NAME = '@hideyukimori/nene2-framework' as const;
