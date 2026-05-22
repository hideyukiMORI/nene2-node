import { describe, expect, it } from 'vitest';

import {
  assertRowsAffected,
  assertVersionMatch,
  parseIfMatchVersion,
} from '../../src/domain/optimistic-concurrency.js';
import { VersionConflictError } from '../../src/error/version-conflict-error.js';

describe('optimistic concurrency helpers', () => {
  it('parseIfMatchVersion accepts numeric and weak ETags', () => {
    expect(parseIfMatchVersion('3')).toBe(3);
    expect(parseIfMatchVersion('W/"7"')).toBe(7);
    expect(parseIfMatchVersion('*')).toBeUndefined();
    expect(parseIfMatchVersion('not-a-number')).toBeUndefined();
  });

  it('assertRowsAffected throws VersionConflictError on zero', () => {
    expect(() =>
      assertRowsAffected(0, { resourceLabel: 'order', resourceId: 9, expectedVersion: 2 }),
    ).toThrow(VersionConflictError);
  });

  it('assertVersionMatch throws on mismatch', () => {
    expect(() => assertVersionMatch(1, 2, 'order', 9)).toThrow(VersionConflictError);
  });
});
