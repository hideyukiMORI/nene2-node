import { describe, expect, it } from 'vitest';

import { assertRowsAffected } from '../../src/domain/optimistic-concurrency.js';
import { openSqliteDatabase } from '../../src/database/open-sqlite-database.js';
import { SqliteQueryExecutor } from '../../src/database/sqlite-query-executor.js';
import { VersionConflictError } from '../../src/error/version-conflict-error.js';

describe('optimistic UPDATE integration', () => {
  it('zero-row versioned update triggers VersionConflictError', async () => {
    const executor = new SqliteQueryExecutor(openSqliteDatabase(':memory:'));
    await executor.execute(`
      CREATE TABLE ft130_items (
        id INTEGER PRIMARY KEY,
        label TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1
      )
    `);
    await executor.insert('INSERT INTO ft130_items (label, version) VALUES (?, ?)', ['alpha', 1]);

    const stale = await executor.execute(
      'UPDATE ft130_items SET label = ?, version = version + 1 WHERE id = ? AND version = ?',
      ['beta', 1, 99],
    );
    expect(() =>
      assertRowsAffected(stale, { resourceLabel: 'item', resourceId: 1, expectedVersion: 99 }),
    ).toThrow(VersionConflictError);

    const row = await executor.fetchOne('SELECT label, version FROM ft130_items WHERE id = ?', [1]);
    expect(row?.['label']).toBe('alpha');
    expect(row?.['version']).toBe(1);
  });
});
