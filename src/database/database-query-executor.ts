import type { SqlParameter, SqlRow } from './sql-types.js';

export interface DatabaseQueryExecutor {
  execute(sql: string, parameters?: readonly SqlParameter[]): number;
  insert(sql: string, parameters?: readonly SqlParameter[]): number;
  lastInsertId(): number;
  fetchOne(sql: string, parameters?: readonly SqlParameter[]): SqlRow | undefined;
  fetchAll(sql: string, parameters?: readonly SqlParameter[]): readonly SqlRow[];
}
