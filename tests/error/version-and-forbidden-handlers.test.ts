import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createResourceAccessDeniedHandler } from '../../src/error/resource-access-denied-handler.js';
import { ResourceAccessDeniedError } from '../../src/error/resource-access-denied-error.js';
import { createVersionConflictHandler } from '../../src/error/version-conflict-handler.js';
import { VersionConflictError } from '../../src/error/version-conflict-error.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('version and forbidden domain handlers', () => {
  const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
  const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);

  it('maps VersionConflictError to 409', async () => {
    const { app } = await createApp({
      settings,
      domainHandlers: [createVersionConflictHandler(problems)],
    });
    app.get('/_test/version', () => {
      throw new VersionConflictError('order', 42, 3);
    });
    const response = await app.request('http://localhost/_test/version');
    const body = await jsonBody<{ status: number; title: string; resourceId?: number }>(response);
    expect(response.status).toBe(409);
    expect(body.title).toBe('Conflict');
  });

  it('maps ResourceAccessDeniedError to 403', async () => {
    const { app } = await createApp({
      settings,
      domainHandlers: [createResourceAccessDeniedHandler(problems)],
    });
    app.get('/_test/forbidden', () => {
      throw new ResourceAccessDeniedError('order', 7);
    });
    const response = await app.request('http://localhost/_test/forbidden');
    const body = await jsonBody<{ status: number; title: string }>(response);
    expect(response.status).toBe(403);
    expect(body.title).toBe('Forbidden');
  });
});
