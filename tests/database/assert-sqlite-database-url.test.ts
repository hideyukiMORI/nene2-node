import { describe, expect, it } from 'vitest';

import { assertSqliteDatabaseUrl } from '../../src/database/assert-sqlite-database-url.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';

describe('assertSqliteDatabaseUrl', () => {
  it('allows sqlite paths', () => {
    expect(() => assertSqliteDatabaseUrl(':memory:')).not.toThrow();
    expect(() => assertSqliteDatabaseUrl('file:./test.sqlite')).not.toThrow();
  });

  it('rejects mysql URLs with clear message', () => {
    expect(() => assertSqliteDatabaseUrl('mysql://user:pass@localhost/db')).toThrow(/issue #37/);
  });

  it('rejects postgres URLs', () => {
    expect(() => assertSqliteDatabaseUrl('postgresql://localhost/db')).toThrow(/only SQLite/);
  });
});

describe('openSqliteDatabase', () => {
  it('rejects mysql before opening SQLite', () => {
    expect(() => openSqliteDatabase('mysql://localhost/db')).toThrow(/issue #37/);
  });
});
