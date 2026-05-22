/**
 * Typed application settings — sole module that reads `process.env`.
 */

export interface AppSettings {
  readonly appEnv: 'local' | 'test' | 'production';
  readonly appDebug: boolean;
  readonly serviceName: string;
  readonly frameworkDescription: string;
  readonly problemDetailsBaseUrl: string;
  readonly machineApiKey: string | undefined;
  readonly localJwtSecret: string | undefined;
  readonly requestMaxBodyBytes: number;
  readonly corsAllowedOrigins: readonly string[];
  readonly corsAllowCredentials: boolean;
  readonly throttleLimit: number | undefined;
  readonly throttleWindowSeconds: number;
  readonly throttleExcludePaths: readonly string[];
  readonly requestLoggingEnabled: boolean;
  readonly requestLoggingExcludePaths: readonly string[];
  readonly databaseUrl: string | undefined;
  readonly databaseReadUrl: string | undefined;
}

const DEFAULT_SERVICE_NAME = 'NENE2';
const DEFAULT_DESCRIPTION = 'JSON APIs first, minimal server HTML, frontend ready, AI-readable.';
const DEFAULT_PROBLEM_BASE = 'https://nene2.dev/problems/';

function readAppEnv(env: NodeJS.ProcessEnv): AppSettings['appEnv'] {
  const raw = env['NENE2_NODE_APP_ENV'] ?? env['APP_ENV'] ?? 'local';
  if (raw === 'production' || raw === 'test') {
    return raw;
  }
  return 'local';
}

function readString(env: NodeJS.ProcessEnv, name: string, fallback: string): string {
  const value = env[name];
  return value !== undefined && value.length > 0 ? value : fallback;
}

function readOptionalString(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];
  return value !== undefined && value.length > 0 ? value : undefined;
}

function readBoolean(env: NodeJS.ProcessEnv, name: string, fallback: boolean): boolean {
  const raw = env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  return raw === '1' || raw.toLowerCase() === 'true';
}

function readStringList(env: NodeJS.ProcessEnv, name: string): readonly string[] {
  const raw = env[name];
  if (raw === undefined || raw === '') {
    return [];
  }
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function readPositiveInt(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadAppSettings(env: NodeJS.ProcessEnv = process.env): AppSettings {
  const appEnv = readAppEnv(env);
  return {
    appEnv,
    appDebug: readBoolean(env, 'NENE2_NODE_APP_DEBUG', appEnv !== 'production'),
    serviceName: readString(env, 'NENE2_NODE_SERVICE_NAME', DEFAULT_SERVICE_NAME),
    frameworkDescription: readString(env, 'NENE2_NODE_FRAMEWORK_DESCRIPTION', DEFAULT_DESCRIPTION),
    problemDetailsBaseUrl: readString(env, 'PROBLEM_DETAILS_BASE_URL', DEFAULT_PROBLEM_BASE),
    machineApiKey: readOptionalString(env, 'NENE2_MACHINE_API_KEY'),
    localJwtSecret: readOptionalString(env, 'NENE2_LOCAL_JWT_SECRET'),
    requestMaxBodyBytes: readPositiveInt(env, 'NENE2_NODE_REQUEST_MAX_BODY_BYTES', 1_048_576),
    corsAllowedOrigins: readStringList(env, 'NENE2_NODE_CORS_ORIGINS'),
    corsAllowCredentials: readBoolean(env, 'NENE2_NODE_CORS_ALLOW_CREDENTIALS', false),
    throttleLimit: (() => {
      const raw = env['NENE2_NODE_THROTTLE_LIMIT'];
      if (raw === undefined || raw === '' || raw === '0') {
        return undefined;
      }
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    })(),
    throttleWindowSeconds: readPositiveInt(env, 'NENE2_NODE_THROTTLE_WINDOW_SECONDS', 60),
    throttleExcludePaths: readStringList(env, 'NENE2_NODE_THROTTLE_EXCLUDE_PATHS'),
    requestLoggingEnabled: readBoolean(
      env,
      'NENE2_NODE_REQUEST_LOGGING',
      readAppEnv(env) !== 'test',
    ),
    requestLoggingExcludePaths: readStringList(env, 'NENE2_NODE_REQUEST_LOGGING_EXCLUDE_PATHS'),
    databaseUrl: readOptionalString(env, 'NENE2_NODE_DATABASE_URL'),
    databaseReadUrl: readOptionalString(env, 'NENE2_NODE_DATABASE_READ_URL'),
  };
}
