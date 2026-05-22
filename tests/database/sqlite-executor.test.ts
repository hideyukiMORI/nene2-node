import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { SqliteQueryExecutor } from '../../src/database/sqlite-query-executor.js';
import { SqliteTransactionManager } from '../../src/database/sqlite-transaction-manager.js';

describe('SqliteQueryExecutor', () => {
  it('executes fetch, insert, and execute', async () => {
    const database = new DatabaseSync(':memory:');
    database.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
    const executor = new SqliteQueryExecutor(database);

    const id = await executor.insert('INSERT INTO items (name) VALUES (?)', ['alpha']);
    expect(id).toBe(1);

    const row = await executor.fetchOne('SELECT id, name FROM items WHERE id = ?', [id]);
    expect(row?.['name']).toBe('alpha');

    const updated = await executor.execute('UPDATE items SET name = ? WHERE id = ?', ['beta', id]);
    expect(updated).toBe(1);

    const all = await executor.fetchAll('SELECT name FROM items');
    expect(all[0]?.['name']).toBe('beta');
  });
});

describe('SqliteTransactionManager', () => {
  it('commits on success and rolls back on failure', async () => {
    const database = new DatabaseSync(':memory:');
    database.exec('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER NOT NULL)');
    const executor = new SqliteQueryExecutor(database);
    await executor.insert('INSERT INTO accounts (balance) VALUES (?)', [100]);

    const transactions = new SqliteTransactionManager(database);

    await transactions.transactional(async (tx) => {
      await tx.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [30, 1]);
      await tx.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [30, 1]);
    });

    expect(
      (await executor.fetchOne('SELECT balance FROM accounts WHERE id = 1'))?.['balance'],
    ).toBe(100);

    await expect(
      transactions.transactional(async (tx) => {
        await tx.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [200, 1]);
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');

    expect(
      (await executor.fetchOne('SELECT balance FROM accounts WHERE id = 1'))?.['balance'],
    ).toBe(100);
  });
});
