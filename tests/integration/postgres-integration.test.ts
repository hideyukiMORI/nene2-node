import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

const pgUrl = process.env['NENE2_NODE_TEST_POSTGRES_URL'];

describe.skipIf(pgUrl === undefined)('PostgreSQL integration (CI service container)', () => {
  it('exposes transactionManager and rolls back on failure', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_DATABASE_URL: pgUrl,
    });
    const { database, shutdown } = await createApp({ settings });
    const tx = database?.transactionManager;
    expect(tx).toBeDefined();
    const executor = database?.queryExecutor;
    expect(executor).toBeDefined();

    await executor!.execute(`
      CREATE TABLE IF NOT EXISTS ft82_pg_tx (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL
      )
    `);

    await expect(
      tx!.transactional(async (conn) => {
        await conn.insert('INSERT INTO ft82_pg_tx (label) VALUES (?)', ['rollback']);
        throw new Error('force rollback');
      }),
    ).rejects.toThrow('force rollback');

    const rows = await executor!.fetchAll('SELECT id FROM ft82_pg_tx WHERE label = ?', [
      'rollback',
    ]);
    expect(rows).toHaveLength(0);

    await shutdown?.();
  });
});
