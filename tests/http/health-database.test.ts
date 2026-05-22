import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('GET /health with database', () => {
  it('returns 503 degraded when database check fails', async () => {
    const { app } = await createApp({
      healthChecks: [
        {
          name: 'database',
          check: () => 'error',
        },
      ],
    });

    const response = await app.request('http://localhost/health');
    const body = await jsonBody<{ status: string; checks: { database: string } }>(response);

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.checks.database).toBe('error');
  });

  it('returns 200 when sqlite database is healthy', async () => {
    const { app } = await createApp({
      settings: loadAppSettings({
        NODE_ENV: 'test',
        NENE2_NODE_APP_ENV: 'test',
        NENE2_NODE_DATABASE_URL: ':memory:',
      }),
    });

    const response = await app.request('http://localhost/health');
    const body = await jsonBody<{ status: string; checks: { database: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.checks.database).toBe('ok');
  });
});
