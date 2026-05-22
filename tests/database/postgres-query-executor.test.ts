import { describe, expect, it, vi } from 'vitest';

import { PostgresQueryExecutor } from '../../src/database/postgres-query-executor.js';

describe('PostgresQueryExecutor', () => {
  it('translates placeholders and reads returning id', async () => {
    const query = vi.fn((sql: string) => {
      if (sql.includes('RETURNING id')) {
        return Promise.resolve({ rows: [{ id: 9 }], rowCount: 1 });
      }
      if (sql.includes('lastval')) {
        return Promise.resolve({ rows: [{ id: 9 }], rowCount: 1 });
      }
      if (sql.startsWith('SELECT') && sql.includes('LIMIT')) {
        return Promise.resolve({ rows: [{ id: 9, title: 'pg' }], rowCount: 1 });
      }
      if (sql.startsWith('SELECT')) {
        return Promise.resolve({ rows: [{ id: 9 }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 3 });
    });

    const executor = PostgresQueryExecutor.fromClient({
      query,
    } as unknown as import('pg').PoolClient);

    await expect(executor.insert('INSERT INTO notes (title) VALUES (?)', ['pg'])).resolves.toBe(9);
    await expect(executor.lastInsertId()).resolves.toBe(9);

    const one = await executor.fetchOne('SELECT * FROM notes WHERE id = ? LIMIT 1', [9]);
    expect(one?.title).toBe('pg');

    const all = await executor.fetchAll('SELECT * FROM notes', []);
    expect(all).toHaveLength(1);

    await expect(
      executor.execute('UPDATE notes SET title = ? WHERE id = ?', ['x', 9]),
    ).resolves.toBe(3);
    expect(query).toHaveBeenCalledWith(
      'UPDATE notes SET title = $1 WHERE id = $2',
      expect.any(Array),
    );
  });

  it('closes owned pool on close()', async () => {
    const end = vi.fn(() => Promise.resolve(undefined));
    const pool = { query: vi.fn(), end } as unknown as import('pg').Pool;
    const executor = PostgresQueryExecutor.fromPool(pool);
    await executor.close();
    expect(end).toHaveBeenCalledOnce();
  });
});
