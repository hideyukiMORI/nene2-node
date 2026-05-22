import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { SqlParameter, SqlRow } from './sql-types.js';

function rowToSqlRow(row: RowDataPacket): SqlRow {
  return row;
}

function parseMysqlUrl(databaseUrl: string): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
} {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: parsed.port === '' ? 3306 : Number.parseInt(parsed.port, 10),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  };
}

export function createMysqlPool(databaseUrl: string): Pool {
  const config = parseMysqlUrl(databaseUrl);
  return createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

export class MysqlQueryExecutor implements DatabaseQueryExecutor {
  private lastId = 0;

  constructor(
    private readonly runner: Pool | PoolConnection,
    private readonly ownsPool: boolean,
    private readonly pool?: Pool,
  ) {}

  static fromPool(pool: Pool): MysqlQueryExecutor {
    return new MysqlQueryExecutor(pool, true, pool);
  }

  static fromConnection(connection: PoolConnection): MysqlQueryExecutor {
    return new MysqlQueryExecutor(connection, false);
  }

  async close(): Promise<void> {
    if (this.ownsPool && this.pool !== undefined) {
      await this.pool.end();
    }
  }

  async execute(sql: string, parameters: readonly SqlParameter[] = []): Promise<number> {
    const [result] = await this.runner.execute<ResultSetHeader>(sql, [...parameters]);
    return result.affectedRows;
  }

  async insert(sql: string, parameters: readonly SqlParameter[] = []): Promise<number> {
    const [result] = await this.runner.execute<ResultSetHeader>(sql, [...parameters]);
    this.lastId = result.insertId;
    return this.lastId;
  }

  lastInsertId(): Promise<number> {
    return Promise.resolve(this.lastId);
  }

  async fetchOne(
    sql: string,
    parameters: readonly SqlParameter[] = [],
  ): Promise<SqlRow | undefined> {
    const [rows] = await this.runner.execute<RowDataPacket[]>(sql, [...parameters]);
    const first = rows[0];
    return first === undefined ? undefined : rowToSqlRow(first);
  }

  async fetchAll(
    sql: string,
    parameters: readonly SqlParameter[] = [],
  ): Promise<readonly SqlRow[]> {
    const [rows] = await this.runner.execute<RowDataPacket[]>(sql, [...parameters]);
    return rows.map(rowToSqlRow);
  }
}
