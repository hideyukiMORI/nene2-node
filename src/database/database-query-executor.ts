import type { SqlParameter, SqlRow } from './sql-types.js';

export interface DatabaseQueryExecutor {
  execute(sql: string, parameters?: readonly SqlParameter[]): Promise<number>;
  insert(sql: string, parameters?: readonly SqlParameter[]): Promise<number>;
  lastInsertId(): Promise<number>;
  fetchOne(sql: string, parameters?: readonly SqlParameter[]): Promise<SqlRow | undefined>;
  fetchAll(sql: string, parameters?: readonly SqlParameter[]): Promise<readonly SqlRow[]>;
}
