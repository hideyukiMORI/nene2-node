import { Pool as PgPool } from 'pg';

import { ensureExamplesSchema, ensureExamplesSchemaAsync } from '../example/example-sql-schema.js';
import type { DatabaseQueryExecutor } from './database-query-executor.js';
import { createMysqlPool, MysqlQueryExecutor } from './mysql-query-executor.js';
import { parseDatabaseUrl, type DatabaseBackend } from './parse-database-url.js';
import { openSqliteDatabase } from './open-sqlite-database.js';
import { PostgresQueryExecutor } from './postgres-query-executor.js';
import { SqliteQueryExecutor } from './sqlite-query-executor.js';

export interface DatabaseRuntime {
  readonly executor: DatabaseQueryExecutor;
  readonly backend: DatabaseBackend;
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
      shutdown: async () => {
        await executor.close();
      },
    };
  }

  const pool = new PgPool({ connectionString: url });
  const executor = PostgresQueryExecutor.fromPool(pool);
  await ensureExamplesSchemaAsync(executor, 'postgresql');
  return {
    executor,
    backend,
    shutdown: async () => {
      await executor.close();
    },
  };
}
