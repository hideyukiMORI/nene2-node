import '../hono-context.js';

import { Hono } from 'hono';

import { loadAppSettings, type AppSettings } from '../config/app-settings.js';
import { buildHealthResponse } from '../http/health-check.js';
import type { HealthCheck } from '../http/health-check.js';
import {
  createProblemDetailsFactory,
  type ProblemDetailsFactory,
} from '../http/problem-details.js';
import { apiKeyAuthMiddleware } from '../middleware/api-key-auth.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { requestSizeLimitMiddleware } from '../middleware/request-size-limit.js';
import { securityHeadersMiddleware } from '../middleware/security-headers.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

export interface CreateAppOptions {
  readonly settings?: AppSettings;
  readonly healthChecks?: readonly HealthCheck[];
  readonly machineApiKey?: string | undefined;
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

  app.onError((error, c) => {
    if (settings.appDebug) {
      console.error(error);
    }
    return problemDetailsFromContext(
      problems,
      c,
      'internal-server-error',
      'Internal Server Error',
      500,
      'An unexpected error occurred.',
    );
  });

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

  return { app, settings, problems };
}
