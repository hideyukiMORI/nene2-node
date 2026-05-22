import { describe, expect, it } from 'vitest';

import { translateQuestionPlaceholders } from '../../src/database/translate-sql-placeholders.js';

describe('translateQuestionPlaceholders', () => {
  it('converts ? to numbered placeholders', () => {
    const result = translateQuestionPlaceholders('SELECT * FROM t WHERE a = ? AND b = ?', [1, 2]);
    expect(result.sql).toBe('SELECT * FROM t WHERE a = $1 AND b = $2');
    expect(result.parameters).toEqual([1, 2]);
  });

  it('throws when placeholder count mismatches parameters', () => {
    expect(() => translateQuestionPlaceholders('SELECT ?', [])).toThrow(
      'SQL placeholder count does not match parameter count.',
    );
  });
});
