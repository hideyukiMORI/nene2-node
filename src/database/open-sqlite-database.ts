import { DatabaseSync } from 'node:sqlite';

/**
 * Open a SQLite database from `NENE2_NODE_DATABASE_URL`.
 * Supports `:memory:` and `file:/path/to/db.sqlite` (or plain filesystem paths).
 */
export function openSqliteDatabase(databaseUrl: string): DatabaseSync {
  if (databaseUrl === ':memory:') {
    return new DatabaseSync(':memory:');
  }

  if (databaseUrl.startsWith('file:')) {
    return new DatabaseSync(databaseUrl.slice('file:'.length));
  }

  return new DatabaseSync(databaseUrl);
}
