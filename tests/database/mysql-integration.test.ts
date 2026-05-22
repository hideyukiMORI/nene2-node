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
    const { app, database, shutdown } = await createApp({ settings });
    expect(database?.transactionManager).toBeDefined();

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

  it('rolls back order + items when transaction fails', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_DATABASE_URL: mysqlUrl,
    });
    const { database, shutdown } = await createApp({ settings });
    const tx = database?.transactionManager;
    expect(tx).toBeDefined();
    const executor = database?.executor;
    expect(executor).toBeDefined();

    await executor.execute(`
      CREATE TABLE IF NOT EXISTS ft75_orders (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(64) NOT NULL
      )
    `);
    await executor.execute(`
      CREATE TABLE IF NOT EXISTS ft75_items (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        sku VARCHAR(32) NOT NULL
      )
    `);

    await expect(
      tx!.transactional(async (conn) => {
        const orderId = await conn.insert('INSERT INTO ft75_orders (label) VALUES (?)', [
          'rollback-me',
        ]);
        await conn.insert('INSERT INTO ft75_items (order_id, sku) VALUES (?, ?)', [orderId, 'X']);
        throw new Error('force rollback');
      }),
    ).rejects.toThrow('force rollback');

    const rows = await executor.fetchAll('SELECT id FROM ft75_orders WHERE label = ?', [
      'rollback-me',
    ]);
    expect(rows).toHaveLength(0);

    await shutdown?.();
  });
});
