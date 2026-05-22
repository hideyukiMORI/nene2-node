import { describe, expect, it } from 'vitest';

import { classifyDatabaseError } from '../../src/error/classify-database-error.js';

describe('classifyDatabaseError', () => {
  it('detects MySQL unique and FK errors', () => {
    expect(classifyDatabaseError({ errno: 1062, code: 'ER_DUP_ENTRY' })).toBe('unique');
    expect(classifyDatabaseError({ errno: 1452, code: 'ER_NO_REFERENCED_ROW_2' })).toBe(
      'foreign_key',
    );
  });

  it('detects PostgreSQL SQLSTATE codes', () => {
    expect(classifyDatabaseError({ code: '23505' })).toBe('unique');
    expect(classifyDatabaseError({ code: '23503' })).toBe('foreign_key');
  });

  it('detects SQLite constraint codes and messages', () => {
    expect(classifyDatabaseError({ code: 'SQLITE_CONSTRAINT_UNIQUE' })).toBe('unique');
    expect(classifyDatabaseError({ code: 'SQLITE_CONSTRAINT_FOREIGNKEY' })).toBe('foreign_key');
    expect(classifyDatabaseError({ message: 'UNIQUE constraint failed: users.email' })).toBe(
      'unique',
    );
    expect(classifyDatabaseError({ message: 'FOREIGN KEY constraint failed' })).toBe('foreign_key');
  });

  it('walks error.cause', () => {
    const wrapped = new Error('query failed', {
      cause: { errno: 1062, code: 'ER_DUP_ENTRY' },
    });
    expect(classifyDatabaseError(wrapped)).toBe('unique');
  });

  it('returns undefined for unrelated errors', () => {
    expect(classifyDatabaseError(new Error('boom'))).toBeUndefined();
  });
});
