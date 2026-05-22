import type { Pool, PoolClient, QueryResult } from 'pg';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import { translateQuestionPlaceholders } from './translate-sql-placeholders.js';
import type { SqlParameter, SqlRow } from './sql-types.js';

function rowToSqlRow(row: Record<string, unknown>): SqlRow {
  return row;
}

export class PostgresQueryExecutor implements DatabaseQueryExecutor {
  private lastId = 0;

  constructor(
    private readonly runner: { query: Pool['query'] },
    private readonly ownsPool: boolean,
    private readonly pool?: Pool,
  ) {}

  static fromPool(pool: Pool): PostgresQueryExecutor {
    return new PostgresQueryExecutor(pool, true, pool);
  }

  static fromClient(client: PoolClient): PostgresQueryExecutor {
    return new PostgresQueryExecutor(client, false);
  }

  async close(): Promise<void> {
    if (this.ownsPool && this.pool !== undefined) {
      await this.pool.end();
    }
  }

  private async runQuery(
    sql: string,
    parameters: readonly SqlParameter[],
  ): Promise<QueryResult<Record<string, unknown>>> {
    const translated = translateQuestionPlaceholders(sql, parameters);
    return this.runner.query(translated.sql, [...translated.parameters]);
  }

  async execute(sql: string, parameters: readonly SqlParameter[] = []): Promise<number> {
    const result = await this.runQuery(sql, parameters);
    return result.rowCount ?? 0;
  }

  async insert(sql: string, parameters: readonly SqlParameter[] = []): Promise<number> {
    const result = await this.runQuery(sql, parameters);
    const inserted = result.rows[0]?.['id'];
    this.lastId = inserted === undefined ? 0 : Number(inserted);
    if (this.lastId === 0 && result.rows[0]?.['insert_id'] !== undefined) {
      this.lastId = Number(result.rows[0]['insert_id']);
    }
    return this.lastId;
  }

  async lastInsertId(): Promise<number> {
    if (this.lastId > 0) {
      return this.lastId;
    }
    const result = await this.runQuery('SELECT lastval() AS id', []);
    const id = result.rows[0]?.['id'];
    return id === undefined ? 0 : Number(id);
  }

  async fetchOne(
    sql: string,
    parameters: readonly SqlParameter[] = [],
  ): Promise<SqlRow | undefined> {
    const result = await this.runQuery(sql, parameters);
    const row = result.rows[0];
    return row === undefined ? undefined : rowToSqlRow(row);
  }

  async fetchAll(
    sql: string,
    parameters: readonly SqlParameter[] = [],
  ): Promise<readonly SqlRow[]> {
    const result = await this.runQuery(sql, parameters);
    return result.rows.map(rowToSqlRow);
  }
}
