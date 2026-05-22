import type { DatabaseSync } from 'node:sqlite';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { DatabaseTransactionManager } from './database-transaction-manager.js';
import { SqliteQueryExecutor } from './sqlite-query-executor.js';

export class SqliteTransactionManager implements DatabaseTransactionManager {
  constructor(private readonly database: DatabaseSync) {}

  async transactional<T>(callback: (executor: DatabaseQueryExecutor) => Promise<T>): Promise<T> {
    this.database.exec('BEGIN');
    const executor = new SqliteQueryExecutor(this.database);
    try {
      const result = await callback(executor);
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}
