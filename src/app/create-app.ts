import '../hono-context.js';

import { Hono } from 'hono';

import { loadAppSettings, type AppSettings } from '../config/app-settings.js';
import { buildHealthResponse } from '../http/health-check.js';
import type { HealthCheck } from '../http/health-check.js';
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
import { requestIdMiddleware } from '../middleware/request-id.js';
import { requestSizeLimitMiddleware } from '../middleware/request-size-limit.js';
import { securityHeadersMiddleware } from '../middleware/security-headers.js';
import { problemDetailsFromContext } from '../http/problem-details.js';
import { createNoteNotFoundHandler } from '../example/note/note-not-found-handler.js';
import { InMemoryNoteRepository } from '../example/note/in-memory-note-repository.js';
import type { NoteRepository } from '../example/note/note-repository.js';
import { registerNoteRoutes } from '../example/note/register-note-routes.js';

export interface CreateAppOptions {
  readonly settings?: AppSettings;
  readonly healthChecks?: readonly HealthCheck[];
  readonly machineApiKey?: string | undefined;
  readonly tokenVerifier?: TokenVerifier | undefined;
  readonly domainHandlers?: readonly DomainExceptionHandler[];
  readonly noteRepository?: NoteRepository;
}

export interface Nene2App {
  readonly app: Hono;
  readonly settings: AppSettings;
  readonly problems: ProblemDetailsFactory;
}

export function createApp(options: CreateAppOptions = {}): Nene2App {
  const settings = options.settings ?? loadAppSettings();
  const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
  const healthChecks = options.healthChecks ?? [];
  const machineApiKey = options.machineApiKey ?? settings.machineApiKey;
  const noteRepository = options.noteRepository ?? new InMemoryNoteRepository();
  const domainHandlers = [createNoteNotFoundHandler(problems), ...(options.domainHandlers ?? [])];
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
  app.use('*', securityHeadersMiddleware());
  app.use('*', requestSizeLimitMiddleware(problems, settings.requestMaxBodyBytes));
  app.use(
    '*',
    apiKeyAuthMiddleware(problems, {
      expectedKey: machineApiKey,
      protectedPaths: ['/machine/health'],
    }),
  );
  app.use(
    '*',
    bearerTokenMiddleware(problems, {
      verifier: tokenVerifier,
      includePaths: ['/examples/protected'],
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

  app.get('/health', (c) => {
    const result = buildHealthResponse(settings.serviceName, healthChecks);
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

  app.get('/examples/ping', (c) =>
    c.json({ message: 'pong', status: 'ok' }, 200, {
      'Content-Type': 'application/json; charset=utf-8',
    }),
  );

  app.post('/examples/ping', (c) => methodNotAllowed(c, 'GET'));

  app.get('/examples/protected', (c) => {
    const claims = c.get('authClaims');
    return c.json(
      {
        message: 'Welcome, authenticated user.',
        claims,
      },
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
    );
  });

  app.post('/examples/protected', (c) => methodNotAllowed(c, 'GET'));

  registerNoteRoutes(app, { repository: noteRepository, problems });

  return { app, settings, problems };
}
