import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { parseSortQuery } from '../../src/http/sort-query.js';

/**
 * In-tree, CI-reproducible HTTP-level proof for FT179 (ORDER BY injection) —
 * mirrors the local `../nene2-node-FT/ft179-sort-injection` probe: `parseSortQuery`
 * rejections surface as `422` through `createApp`'s error handler. The exhaustive
 * payload matrix is unit-tested in `tests/http/sort-query.test.ts`; this confirms
 * the app-surface behaviour end to end.
 */
async function buildApp() {
  const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
  const { app } = await createApp({ settings });
  app.get('/items', (c) => {
    const { column, order } = parseSortQuery(new URL(c.req.url).searchParams, {
      columns: ['id', 'name', 'created_at'],
      defaultColumn: 'created_at',
    });
    return c.json({ sort: column, order });
  });
  return app;
}

describe('sort injection over HTTP (in-tree proof)', () => {
  it('rejects ORDER BY injection with 422', async () => {
    const app = await buildApp();
    for (const sort of ["'; DROP TABLE items--", 'id UNION SELECT 1', 'ID', '1', 'created_at--']) {
      const res = await app.request(`http://localhost/items?sort=${encodeURIComponent(sort)}`);
      expect(res.status, `sort=${sort}`).toBe(422);
    }
  });

  it('rejects bad order direction with 422', async () => {
    const app = await buildApp();
    const res = await app.request('http://localhost/items?order=asc;DROP');
    expect(res.status).toBe(422);
  });

  it('accepts allowlisted sort/order with 200', async () => {
    const app = await buildApp();
    const res = await app.request('http://localhost/items?sort=name&order=asc');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sort: 'name', order: 'asc' });
  });

  it('returns the 422 as Problem Details (validation-failed)', async () => {
    const app = await buildApp();
    const res = await app.request('http://localhost/items?sort=evil');
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.type).toContain('validation-failed');
  });
});
