import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { escapeLikePattern } from '../../src/database/escape-like-pattern.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';
import { SqliteQueryExecutor } from '../../src/database/sqlite-query-executor.js';
import { parsePaginationQuery } from '../../src/http/pagination-query.js';
import { parseSortQuery } from '../../src/http/sort-query.js';

/**
 * In-tree, CI-reproducible SQL-injection proof (FT187 / PHP FT264) — ports the
 * local `../nene2-node-FT/ft187-sql-injection` probe so the DB-level evidence
 * runs in `npm run check`, not only on the author's machine.
 */
const SORT = { columns: ['id', 'name', 'category', 'price'], defaultColumn: 'id' } as const;

let db: ReturnType<typeof openSqliteDatabase>;
let app: { request: (input: string) => Promise<Response> };

beforeEach(async () => {
  db = openSqliteDatabase(':memory:');
  db.exec(
    `CREATE TABLE products (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL, category TEXT NOT NULL,
       price REAL NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '');`,
  );
  const exec = new SqliteQueryExecutor(db);
  for (const row of [
    ['Widget', 'tools', 9.99, 'a basic widget'],
    ['Gadget', 'tools', 19.99, 'a fancy gadget'],
    ['Doohickey', 'misc', 4.5, 'a small doohickey'],
    ['Secret', 'admin', 999, 'internal only'],
  ]) {
    await exec.insert(
      'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)',
      row,
    );
  }

  const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
  const created = await createApp({ settings });

  created.app.get('/products', async (c) => {
    const { searchParams } = new URL(c.req.url);
    const { column, order } = parseSortQuery(searchParams, SORT);
    const { limit, offset } = parsePaginationQuery(searchParams);
    const search = searchParams.get('search');
    const term = search === null ? '' : escapeLikePattern(search);
    const rows =
      search !== null && search !== ''
        ? await exec.fetchAll(
            `SELECT * FROM products WHERE name LIKE '%' || ? || '%' ESCAPE '\\' OR description LIKE '%' || ? || '%' ESCAPE '\\' ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
            [term, term, limit, offset],
          )
        : await exec.fetchAll(
            `SELECT * FROM products ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
            [limit, offset],
          );
    return c.json({ data: rows, total: rows.length });
  });
  created.app.get('/products/:id', async (c) => {
    const row = await exec.fetchOne('SELECT * FROM products WHERE id = ?', [c.req.param('id')]);
    return row === undefined ? c.json({ error: 'not found' }, 404) : c.json(row);
  });

  app = created.app;
});

afterEach(() => {
  db.close();
});

const rowCount = (): number =>
  (db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;
const get = (path: string) => app.request(`http://localhost${path}`);

describe('SQL injection defence (in-tree proof)', () => {
  it('value injection is bound as a literal; table survives', async () => {
    const res = await get(`/products/${encodeURIComponent('1; DROP TABLE products; --')}`);
    expect(res.status).toBe(404);
    expect(rowCount()).toBe(4);
  });

  it('boolean injection in id does not bypass', async () => {
    expect((await get(`/products/${encodeURIComponent('1 OR 1=1')}`)).status).toBe(404);
  });

  it('LIKE injection matches literally, not as a clause', async () => {
    const res = await get(`/products?search=${encodeURIComponent("' OR '1'='1")}`);
    expect((await res.json()).total).toBe(0);
  });

  it('LIKE wildcards are escaped (no full-table leak)', async () => {
    expect((await (await get(`/products?search=${encodeURIComponent('%')}`)).json()).total).toBe(0);
    expect((await (await get(`/products?search=${encodeURIComponent('_')}`)).json()).total).toBe(0);
  });

  it('legitimate search still works', async () => {
    expect((await (await get('/products?search=widget')).json()).total).toBe(1);
  });

  it('ORDER BY injection is rejected (422) and the table survives', async () => {
    for (const sort of [
      'id; DROP TABLE products',
      '(SELECT 1)',
      'price); DELETE FROM products--',
    ]) {
      expect((await get(`/products?sort=${encodeURIComponent(sort)}`)).status).toBe(422);
    }
    expect(rowCount()).toBe(4);
  });

  it('valid requests pass', async () => {
    expect((await get('/products/1')).status).toBe(200);
    expect((await (await get('/products?sort=price&order=desc')).json()).total).toBe(4);
  });
});
