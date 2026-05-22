import type { DatabaseSync } from 'node:sqlite';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { SqlParameter, SqlRow } from './sql-types.js';

function rowToSqlRow(row: Record<string, unknown>): SqlRow {
  return row;
}

export class SqliteQueryExecutor implements DatabaseQueryExecutor {
  private lastId = 0;

  constructor(private readonly database: DatabaseSync) {}

  execute(sql: string, parameters: readonly SqlParameter[] = []): number {
    const result = this.database.prepare(sql).run(...parameters);
    return Number(result.changes);
  }

  insert(sql: string, parameters: readonly SqlParameter[] = []): number {
    this.execute(sql, parameters);
    return this.lastInsertId();
  }

  lastInsertId(): number {
    const row = this.database.prepare('SELECT last_insert_rowid() AS id').get() as
      | { id: number | bigint }
      | undefined;
    const id = row === undefined ? 0 : Number(row.id);
    this.lastId = id;
    return id;
  }

  fetchOne(sql: string, parameters: readonly SqlParameter[] = []): SqlRow | undefined {
    const row = this.database.prepare(sql).get(...parameters) as
      | Record<string, unknown>
      | undefined;
    return row === undefined ? undefined : rowToSqlRow(row);
  }

  fetchAll(sql: string, parameters: readonly SqlParameter[] = []): readonly SqlRow[] {
    const rows = this.database.prepare(sql).all(...parameters) as Record<string, unknown>[];
    return rows.map(rowToSqlRow);
  }
}
