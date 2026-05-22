import type { Pool, PoolClient } from 'pg';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { DatabaseTransactionManager } from './database-transaction-manager.js';
import { PostgresQueryExecutor } from './postgres-query-executor.js';

export class PostgresTransactionManager implements DatabaseTransactionManager {
  constructor(private readonly pool: Pool) {}

  async transactional<T>(callback: (executor: DatabaseQueryExecutor) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const executor = PostgresQueryExecutor.fromClient(client);
      const result = await callback(executor);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
