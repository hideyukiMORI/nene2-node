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

export const FRAMEWORK_PACKAGE_NAME = '@hideyukimori/nene2-framework' as const;
