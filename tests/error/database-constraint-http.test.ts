import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';
import { SqliteQueryExecutor } from '../../src/database/sqlite-query-executor.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('database constraint HTTP mapping', () => {
  it('maps SQLite UNIQUE to 409 via onError', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const db = openSqliteDatabase(':memory:');
    const executor = new SqliteQueryExecutor(db);
    await executor.execute(`
      CREATE TABLE ft127_users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE)
    `);
    await executor.insert('INSERT INTO ft127_users (email) VALUES (?)', ['hide@example.com']);

    const { app } = await createApp({ settings });

    app.post('/_test/duplicate-email', async () => {
      await executor.insert('INSERT INTO ft127_users (email) VALUES (?)', ['hide@example.com']);
      return new Response(null, { status: 201 });
    });

    const response = await app.request('http://localhost/_test/duplicate-email', {
      method: 'POST',
    });
    const body = await jsonBody<{ status: number; title: string; type: string }>(response);

    expect(response.status).toBe(409);
    expect(body.title).toBe('Conflict');
    expect(body.type).toContain('conflict');
  });

  it('maps SQLite FOREIGN KEY to 422 via onError', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const db = openSqliteDatabase(':memory:');
    const executor = new SqliteQueryExecutor(db);
    await executor.execute('PRAGMA foreign_keys = ON');
    await executor.execute(`
      CREATE TABLE ft129_parent (id INTEGER PRIMARY KEY)
    `);
    await executor.execute(`
      CREATE TABLE ft129_child (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER NOT NULL REFERENCES ft129_parent(id)
      )
    `);

    const { app } = await createApp({ settings });

    app.post('/_test/bad-fk', async () => {
      await executor.insert('INSERT INTO ft129_child (parent_id) VALUES (?)', [999]);
      return new Response(null, { status: 201 });
    });

    const response = await app.request('http://localhost/_test/bad-fk', { method: 'POST' });
    const body = await jsonBody<{ status: number; title: string }>(response);

    expect(response.status).toBe(422);
    expect(body.title).toBe('Validation Failed');
  });
});
