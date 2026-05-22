import '../hono-context.js';

import { Hono } from 'hono';

import { loadAppSettings, type AppSettings } from '../config/app-settings.js';
import { buildHealthResponseAsync } from '../http/health-check.js';
import type { AsyncHealthCheck, HealthCheck } from '../http/health-check.js';
import {
  createProblemDetailsFactory,
  type ProblemDetailsFactory,
} from '../http/problem-details.js';
import { LocalBearerTokenVerifier } from '../auth/local-bearer-token-verifier.js';
import type { TokenVerifier } from '../auth/token-verifier.js';
import type { DomainExceptionHandler } from '../error/domain-exception-handler.js';
import { resolveHttpError } from '../error/resolve-http-error.js';
import { apiKeyAuthMiddleware } from '../middleware/api-key-auth.js';
import { bearerTokenMiddleware } from '../middleware/bearer-token.js';
import { corsMiddleware } from '../middleware/cors.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { requestLoggingMiddleware } from '../middleware/request-logging.js';
import { requestSizeLimitMiddleware } from '../middleware/request-size-limit.js';
import { securityHeadersMiddleware } from '../middleware/security-headers.js';
import { throttleMiddleware } from '../middleware/throttle.js';
import { problemDetailsFromContext } from '../http/problem-details.js';
import { createDatabaseHealthCheck } from '../database/database-health-check.js';
import { createDatabaseRuntime } from '../database/create-database-runtime.js';
import type { DatabaseQueryExecutor } from '../database/database-query-executor.js';
import type { DatabaseTransactionManager } from '../database/database-transaction-manager.js';
import type { DatabaseBackend } from '../database/parse-database-url.js';
import type { NoteRepository } from '../example/note/note-repository.js';
import type { TagRepository } from '../example/tag/tag-repository.js';
import { registerExampleHttpRoutes, resolveExampleModule } from './wire-example-module.js';
import { createDefaultDomainHandlers } from './default-domain-handlers.js';

export interface CreateAppOptions {
  readonly settings?: AppSettings;
  readonly healthChecks?: readonly HealthCheck[];
  readonly machineApiKey?: string | undefined;
  readonly tokenVerifier?: TokenVerifier | undefined;
  readonly domainHandlers?: readonly DomainExceptionHandler[];
  readonly noteRepository?: NoteRepository;
  readonly tagRepository?: TagRepository;
  /** Extra path prefixes protected by bearer middleware (e.g. `/orders`). */
  readonly bearerIncludePaths?: readonly string[];
  /** Register `/examples/*` reference routes (default: from settings / env). */
  readonly includeExamples?: boolean;
}

export interface Nene2AppDatabase {
  readonly executor: DatabaseQueryExecutor;
  readonly readExecutor?: DatabaseQueryExecutor;
  readonly backend: DatabaseBackend;
  readonly transactionManager?: DatabaseTransactionManager;
}

export interface Nene2App {
  readonly app: Hono;
  readonly settings: AppSettings;
  readonly problems: ProblemDetailsFactory;
  /** Present when `NENE2_NODE_DATABASE_URL` is set — share executor for app-owned repositories. */
  readonly database?: Nene2AppDatabase;
  readonly shutdown?: () => Promise<void>;
}

function wrapSyncHealthChecks(checks: readonly HealthCheck[]): readonly AsyncHealthCheck[] {
  return checks.map((check) => ({
    name: check.name,
    check: () => Promise.resolve(check.check()),
  }));
}

export async function createApp(options: CreateAppOptions = {}): Promise<Nene2App> {
  const settings = options.settings ?? loadAppSettings();
  const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
  const machineApiKey = options.machineApiKey ?? settings.machineApiKey;

  const includeExamples = options.includeExamples ?? settings.includeExamples;

  let healthChecks: readonly AsyncHealthCheck[] = wrapSyncHealthChecks(options.healthChecks ?? []);
  let shutdown: (() => Promise<void>) | undefined;
  let database: Nene2AppDatabase | undefined;
  let executor: DatabaseQueryExecutor | undefined;

  if (settings.databaseUrl !== undefined) {
    const runtime = await createDatabaseRuntime(settings.databaseUrl, settings.databaseReadUrl);
    shutdown = runtime.shutdown;
    executor = runtime.executor;
    database = {
      executor: runtime.executor,
      backend: runtime.backend,
      ...(runtime.readExecutor !== undefined ? { readExecutor: runtime.readExecutor } : {}),
      ...(runtime.transactionManager !== undefined
        ? { transactionManager: runtime.transactionManager }
        : {}),
    };
    if (!healthChecks.some((check) => check.name === 'database')) {
      healthChecks = [...healthChecks, createDatabaseHealthCheck(runtime.executor)];
    }
  }

  const exampleModule = includeExamples
    ? resolveExampleModule({
        problems,
        ...(executor !== undefined ? { executor } : {}),
        ...(options.noteRepository !== undefined ? { noteRepository: options.noteRepository } : {}),
        ...(options.tagRepository !== undefined ? { tagRepository: options.tagRepository } : {}),
        ...(options.domainHandlers !== undefined
          ? { extraDomainHandlers: options.domainHandlers }
          : {}),
      })
    : undefined;
  const domainHandlers = [
    ...createDefaultDomainHandlers(problems),
    ...(exampleModule?.domainHandlers ?? []),
    ...(options.domainHandlers ?? []),
  ];
  const tokenVerifier =
    options.tokenVerifier ??
    (settings.localJwtSecret !== undefined
      ? new LocalBearerTokenVerifier(settings.localJwtSecret)
      : undefined);

  const app = new Hono();

  const methodNotAllowed = (
    c: Parameters<typeof problemDetailsFromContext>[1],
    allow: string,
  ): Response => {
    const response = problemDetailsFromContext(
      problems,
      c,
      'method-not-allowed',
      'Method Not Allowed',
      405,
      `The ${c.req.method} method is not allowed for this resource.`,
    );
    response.headers.set('Allow', allow);
    return response;
  };

  app.use('*', requestIdMiddleware());
  app.use('*', securityHeadersMiddleware({ enableHsts: settings.appEnv === 'production' }));
  if (settings.requestLoggingEnabled) {
    app.use(
      '*',
      requestLoggingMiddleware({
        excludePaths:
          settings.requestLoggingExcludePaths.length > 0
            ? settings.requestLoggingExcludePaths
            : ['/health'],
      }),
    );
  }
  app.use(
    '*',
    corsMiddleware({
      allowedOrigins: settings.corsAllowedOrigins,
      allowCredentials: settings.corsAllowCredentials,
    }),
  );
  app.use('*', requestSizeLimitMiddleware(problems, settings.requestMaxBodyBytes));
  if (settings.throttleLimit !== undefined) {
    app.use(
      '*',
      throttleMiddleware(problems, {
        limit: settings.throttleLimit,
        windowSeconds: settings.throttleWindowSeconds,
        excludePaths:
          settings.throttleExcludePaths.length > 0 ? settings.throttleExcludePaths : ['/health'],
      }),
    );
  }
  app.use(
    '*',
    apiKeyAuthMiddleware(problems, {
      expectedKey: machineApiKey,
      protectedPaths: ['/machine/health'],
    }),
  );
  const bearerIncludePaths = [
    ...(includeExamples ? ['/examples/protected', '/examples/notes', '/examples/tags'] : []),
    ...(options.bearerIncludePaths ?? []),
  ];
  app.use(
    '*',
    bearerTokenMiddleware(problems, {
      verifier: tokenVerifier,
      includePaths: bearerIncludePaths,
    }),
  );

  app.onError((error, c) =>
    resolveHttpError({
      problems,
      c,
      error,
      appDebug: settings.appDebug,
      domainHandlers,
    }),
  );

  app.notFound((c) =>
    problemDetailsFromContext(
      problems,
      c,
      'not-found',
      'Not Found',
      404,
      'The requested resource was not found.',
    ),
  );

  app.get('/', (c) =>
    c.json(
      {
        name: settings.serviceName,
        description: settings.frameworkDescription,
        status: 'ok',
      },
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
    ),
  );

  app.post('/', (c) => methodNotAllowed(c, 'GET'));

  app.get('/health', async (c) => {
    const result = await buildHealthResponseAsync(settings.serviceName, healthChecks);
    return c.json(
      {
        status: result.status,
        service: result.service,
        ...(result.checks !== undefined ? { checks: result.checks } : {}),
      },
      result.httpStatus,
      { 'Content-Type': 'application/json; charset=utf-8' },
    );
  });

  app.post('/health', (c) => methodNotAllowed(c, 'GET'));

  app.get('/machine/health', (c) => {
    const credentialType = c.get('credentialType');
    return c.json(
      {
        status: 'ok',
        service: settings.serviceName,
        credential_type: credentialType,
      },
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
    );
  });

  if (includeExamples && exampleModule !== undefined) {
    registerExampleHttpRoutes(app, exampleModule, problems, methodNotAllowed);
  }

  const base = { app, settings, problems };
  if (database === undefined && shutdown === undefined) {
    return base;
  }
  return {
    ...base,
    ...(database !== undefined ? { database } : {}),
    ...(shutdown !== undefined ? { shutdown } : {}),
  };
}
