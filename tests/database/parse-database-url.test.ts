import { describe, expect, it } from 'vitest';

import { parseDatabaseUrl } from '../../src/database/parse-database-url.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';

describe('parseDatabaseUrl', () => {
  it('detects sqlite URLs', () => {
    expect(parseDatabaseUrl(':memory:').backend).toBe('sqlite');
    expect(parseDatabaseUrl('file:./test.sqlite').backend).toBe('sqlite');
  });

  it('detects mysql URLs', () => {
    expect(parseDatabaseUrl('mysql://user:pass@localhost:3306/db').backend).toBe('mysql');
  });

  it('detects postgres URLs', () => {
    expect(parseDatabaseUrl('postgresql://localhost/db').backend).toBe('postgresql');
    expect(parseDatabaseUrl('postgres://localhost/db').backend).toBe('postgresql');
  });
});

describe('openSqliteDatabase', () => {
  it('rejects mysql before opening SQLite', () => {
    expect(() => openSqliteDatabase('mysql://localhost/db')).toThrow(/createDatabaseRuntime/);
  });
});
