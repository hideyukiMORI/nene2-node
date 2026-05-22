import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { DomainError } from '../../src/error/domain-error.js';
import { createSimpleDomainHandler } from '../../src/error/domain-exception-handler.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';

class ExampleResourceNotFoundError extends DomainError {
  constructor(readonly resourceId: string) {
    super(`Resource ${resourceId} was not found`);
    this.name = 'ExampleResourceNotFoundError';
  }
}

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('domain exception mapping', () => {
  it('maps registered domain errors to Problem Details', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const { app } = createApp({
      settings,
      domainHandlers: [
        createSimpleDomainHandler(problems, {
          ExceptionClass: ExampleResourceNotFoundError,
          problemType: 'not-found',
          title: 'Not Found',
          status: 404,
          detail: 'The requested resource was not found.',
        }),
      ],
    });

    app.get('/_test/domain-error', () => {
      throw new ExampleResourceNotFoundError('abc-123');
    });

    const response = await app.request('http://localhost/_test/domain-error');
    const body = await jsonBody<{ type: string; title: string; status: number; detail: string }>(
      response,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
    expect(body.type).toBe('https://nene2.dev/problems/not-found');
    expect(body.title).toBe('Not Found');
    expect(body.detail).toBe('The requested resource was not found.');
  });

  it('returns 500 for unregistered errors', async () => {
    const { app } = createApp({
      settings: loadAppSettings({
        NODE_ENV: 'test',
        NENE2_NODE_APP_ENV: 'test',
        NENE2_NODE_APP_DEBUG: 'false',
      }),
    });

    app.get('/_test/unhandled', () => {
      throw new Error('boom');
    });

    const response = await app.request('http://localhost/_test/unhandled');
    const body = await jsonBody<{ status: number; detail: string }>(response);

    expect(response.status).toBe(500);
    expect(body.detail).toBe('An unexpected error occurred.');
  });
});
