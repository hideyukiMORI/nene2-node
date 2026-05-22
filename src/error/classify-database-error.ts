/**
 * Maps driver-specific database errors to constraint kinds for HTTP mapping.
 * MySQL (mysql2), PostgreSQL (pg), and Node SQLite use different shapes.
 */

export type DatabaseConstraintKind = 'unique' | 'foreign_key';

const MYSQL_UNIQUE_ERRNO = 1062;
const MYSQL_FK_ERRNO = 1452;
const PG_UNIQUE = '23505';
const PG_FK = '23503';
const SQLITE_UNIQUE = 'SQLITE_CONSTRAINT_UNIQUE';
const SQLITE_FK = 'SQLITE_CONSTRAINT_FOREIGNKEY';

function asRecord(error: unknown): Record<string, unknown> | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  return error as Record<string, unknown>;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function mysqlKind(error: Record<string, unknown>): DatabaseConstraintKind | undefined {
  const errno = readNumber(error, 'errno');
  const code = readString(error, 'code');
  if (errno === MYSQL_UNIQUE_ERRNO || code === 'ER_DUP_ENTRY') {
    return 'unique';
  }
  if (errno === MYSQL_FK_ERRNO || code === 'ER_NO_REFERENCED_ROW_2') {
    return 'foreign_key';
  }
  return undefined;
}

function pgKind(error: Record<string, unknown>): DatabaseConstraintKind | undefined {
  const code = readString(error, 'code');
  if (code === PG_UNIQUE) {
    return 'unique';
  }
  if (code === PG_FK) {
    return 'foreign_key';
  }
  return undefined;
}

function sqliteKind(error: Record<string, unknown>): DatabaseConstraintKind | undefined {
  const code = readString(error, 'code');
  if (code === SQLITE_UNIQUE) {
    return 'unique';
  }
  if (code === SQLITE_FK) {
    return 'foreign_key';
  }
  const message = readString(error, 'message') ?? '';
  if (message.includes('UNIQUE constraint failed')) {
    return 'unique';
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return 'foreign_key';
  }
  return undefined;
}

/**
 * Returns the constraint kind when `error` (or its `cause`) is a known DB violation.
 */
export function classifyDatabaseError(error: unknown): DatabaseConstraintKind | undefined {
  const candidates: unknown[] = [error];
  const record = asRecord(error);
  if (record?.['cause'] !== undefined) {
    candidates.push(record['cause']);
  }

  for (const candidate of candidates) {
    const obj = asRecord(candidate);
    if (obj === undefined) {
      continue;
    }
    const mysql = mysqlKind(obj);
    if (mysql !== undefined) {
      return mysql;
    }
    const pg = pgKind(obj);
    if (pg !== undefined) {
      return pg;
    }
    const sqlite = sqliteKind(obj);
    if (sqlite !== undefined) {
      return sqlite;
    }
  }

  return undefined;
}
