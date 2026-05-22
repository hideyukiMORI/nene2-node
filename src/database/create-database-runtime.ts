import { Pool as PgPool } from 'pg';

import { ensureExamplesSchema, ensureExamplesSchemaAsync } from '../example/example-sql-schema.js';
import { readPoolMaxEnv } from './read-pool-max-env.js';
import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { DatabaseTransactionManager } from './database-transaction-manager.js';
import { createMysqlPool, MysqlQueryExecutor } from './mysql-query-executor.js';
import { MysqlTransactionManager } from './mysql-transaction-manager.js';
import { parseDatabaseUrl, type DatabaseBackend } from './parse-database-url.js';
import { openSqliteDatabase } from './open-sqlite-database.js';
import { PostgresQueryExecutor } from './postgres-query-executor.js';
import { PostgresTransactionManager } from './postgres-transaction-manager.js';
import { SqliteQueryExecutor } from './sqlite-query-executor.js';
import { SqliteTransactionManager } from './sqlite-transaction-manager.js';

export interface DatabaseRuntime {
  readonly executor: DatabaseQueryExecutor;
  readonly backend: DatabaseBackend;
  /** MySQL and SQLite today; PostgreSQL pending. */
  readonly transactionManager?: DatabaseTransactionManager;
  readonly shutdown: () => Promise<void>;
}

export async function createDatabaseRuntime(databaseUrl: string): Promise<DatabaseRuntime> {
  const { backend, url } = parseDatabaseUrl(databaseUrl);

  if (backend === 'sqlite') {
    const database = openSqliteDatabase(url);
    ensureExamplesSchema(database);
    const executor = new SqliteQueryExecutor(database);
    return {
      executor,
      backend,
      transactionManager: new SqliteTransactionManager(database),
      shutdown: () => {
        database.close();
        return Promise.resolve();
      },
    };
  }

  if (backend === 'mysql') {
    const pool = createMysqlPool(url);
    const executor = MysqlQueryExecutor.fromPool(pool);
    await ensureExamplesSchemaAsync(executor, 'mysql');
    return {
      executor,
      backend,
      transactionManager: new MysqlTransactionManager(pool),
      shutdown: async () => {
        await executor.close();
      },
    };
  }

  const pool = new PgPool({
    connectionString: url,
    max: readPoolMaxEnv('NENE2_POSTGRES_POOL_MAX'),
  });
  const executor = PostgresQueryExecutor.fromPool(pool);
  await ensureExamplesSchemaAsync(executor, 'postgresql');
  return {
    executor,
    backend,
    transactionManager: new PostgresTransactionManager(pool),
    shutdown: async () => {
      await executor.close();
    },
  };
}
