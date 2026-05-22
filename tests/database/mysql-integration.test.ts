import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

const mysqlUrl = process.env['NENE2_NODE_TEST_MYSQL_URL'];

describe.skipIf(mysqlUrl === undefined)('MySQL integration (CI service container)', () => {
  it('bootstraps schema, passes health, and runs note CRUD', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_DATABASE_URL: mysqlUrl,
    });
    const { app, shutdown } = await createApp({ settings });

    const health = await app.request('http://localhost/health');
    const healthBody = (await health.json()) as {
      status: string;
      checks?: { database?: string };
    };
    expect(health.status).toBe(200);
    expect(healthBody.checks?.database).toBe('ok');

    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'ci-mysql', body: 'ft70' }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: number; title: string };
    expect(created.id).toBeGreaterThan(0);
    expect(created.title).toBe('ci-mysql');

    const listResponse = await app.request('http://localhost/examples/notes');
    const listBody = (await listResponse.json()) as { items: { id: number }[] };
    expect(listBody.items.some((item) => item.id === created.id)).toBe(true);

    await shutdown?.();
  });
});
