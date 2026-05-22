import { describe, expect, it } from 'vitest';

import { runTransaction } from '../../src/database/run-transaction.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';
import { SqliteTransactionManager } from '../../src/database/sqlite-transaction-manager.js';
import { TransactionAbortedError } from '../../src/error/transaction-aborted-error.js';

describe('runTransaction', () => {
  it('wraps callback errors as TransactionAbortedError', async () => {
    const manager = new SqliteTransactionManager(openSqliteDatabase(':memory:'));
    await expect(
      runTransaction(manager, () => {
        throw new Error('insufficient stock');
      }),
    ).rejects.toThrow(TransactionAbortedError);
  });

  it('commits successful work', async () => {
    const db = openSqliteDatabase(':memory:');
    const manager = new SqliteTransactionManager(db);
    await runTransaction(manager, async (executor) => {
      await executor.execute('CREATE TABLE t (id INTEGER PRIMARY KEY, n TEXT)');
      await executor.insert('INSERT INTO t (n) VALUES (?)', ['ok']);
    });
    const manager2 = new SqliteTransactionManager(db);
    const row = await runTransaction(manager2, async (executor) =>
      executor.fetchOne('SELECT n FROM t'),
    );
    expect(row?.['n']).toBe('ok');
  });
});
