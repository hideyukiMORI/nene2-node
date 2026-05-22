import { describe, expect, it, vi } from 'vitest';

import { MysqlQueryExecutor } from '../../src/database/mysql-query-executor.js';

describe('MysqlQueryExecutor', () => {
  it('executes insert, fetchOne, fetchAll, and execute via query()', async () => {
    const query = vi.fn((sql: string) => {
      if (sql.startsWith('INSERT')) {
        return Promise.resolve([{ insertId: 7, affectedRows: 1 }, undefined]);
      }
      if (sql.includes('LIMIT 1')) {
        return Promise.resolve([[{ id: 7, title: 'a' }], undefined]);
      }
      if (sql.startsWith('SELECT')) {
        return Promise.resolve([[{ id: 7 }], undefined]);
      }
      return Promise.resolve([{ affectedRows: 2 }, undefined]);
    });

    const executor = MysqlQueryExecutor.fromConnection({
      query,
    } as unknown as import('mysql2/promise').PoolConnection);

    const id = await executor.insert('INSERT INTO notes (title) VALUES (?)', ['a']);
    expect(id).toBe(7);
    await expect(executor.lastInsertId()).resolves.toBe(7);

    const one = await executor.fetchOne('SELECT * FROM notes WHERE id = ? LIMIT 1', [7]);
    expect(one?.title).toBe('a');

    const all = await executor.fetchAll('SELECT * FROM notes', []);
    expect(all).toHaveLength(1);

    await expect(
      executor.execute('UPDATE notes SET title = ? WHERE id = ?', ['b', 7]),
    ).resolves.toBe(2);
  });

  it('closes owned pool on close()', async () => {
    const end = vi.fn(() => Promise.resolve(undefined));
    const pool = { query: vi.fn(), end } as unknown as import('mysql2/promise').Pool;
    const executor = MysqlQueryExecutor.fromPool(pool);
    await executor.close();
    expect(end).toHaveBeenCalledOnce();
  });
});
