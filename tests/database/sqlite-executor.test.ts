import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { SqliteQueryExecutor } from '../../src/database/sqlite-query-executor.js';
import { SqliteTransactionManager } from '../../src/database/sqlite-transaction-manager.js';

describe('SqliteQueryExecutor', () => {
  it('executes fetch, insert, and execute', () => {
    const database = new DatabaseSync(':memory:');
    database.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
    const executor = new SqliteQueryExecutor(database);

    const id = executor.insert('INSERT INTO items (name) VALUES (?)', ['alpha']);
    expect(id).toBe(1);

    const row = executor.fetchOne('SELECT id, name FROM items WHERE id = ?', [id]);
    expect(row?.['name']).toBe('alpha');

    const updated = executor.execute('UPDATE items SET name = ? WHERE id = ?', ['beta', id]);
    expect(updated).toBe(1);

    const all = executor.fetchAll('SELECT name FROM items');
    expect(all[0]?.['name']).toBe('beta');
  });
});

describe('SqliteTransactionManager', () => {
  it('commits on success and rolls back on failure', () => {
    const database = new DatabaseSync(':memory:');
    database.exec('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER NOT NULL)');
    const executor = new SqliteQueryExecutor(database);
    executor.insert('INSERT INTO accounts (balance) VALUES (?)', [100]);

    const transactions = new SqliteTransactionManager(database);

    transactions.transactional((tx) => {
      tx.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [30, 1]);
      tx.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [30, 1]);
    });

    expect(executor.fetchOne('SELECT balance FROM accounts WHERE id = 1')?.['balance']).toBe(100);

    expect(() =>
      transactions.transactional((tx) => {
        tx.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [200, 1]);
        throw new Error('rollback');
      }),
    ).toThrow('rollback');

    expect(executor.fetchOne('SELECT balance FROM accounts WHERE id = 1')?.['balance']).toBe(100);
  });
});
