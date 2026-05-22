import type { Pool } from 'mysql2/promise';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { DatabaseTransactionManager } from './database-transaction-manager.js';
import { MysqlQueryExecutor } from './mysql-query-executor.js';

export class MysqlTransactionManager implements DatabaseTransactionManager {
  constructor(private readonly pool: Pool) {}

  async transactional<T>(callback: (executor: DatabaseQueryExecutor) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const executor = MysqlQueryExecutor.fromConnection(connection);
      const result = await callback(executor);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
