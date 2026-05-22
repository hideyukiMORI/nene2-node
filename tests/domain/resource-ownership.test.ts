import { describe, expect, it } from 'vitest';

import { assertResourceOwner, authSubFromContext } from '../../src/domain/resource-ownership.js';
import { ResourceAccessDeniedError } from '../../src/error/resource-access-denied-error.js';

describe('resource ownership', () => {
  it('authSubFromContext reads sub claim', () => {
    expect(authSubFromContext({ sub: 'user-a', role: 'admin' })).toBe('user-a');
    expect(authSubFromContext({})).toBeUndefined();
  });

  it('assertResourceOwner throws when owner differs', () => {
    expect(() => assertResourceOwner('user-a', 'user-b', 'order', 1)).toThrow(
      ResourceAccessDeniedError,
    );
  });

  it('assertResourceOwner passes when sub matches', () => {
    expect(() => assertResourceOwner('user-a', 'user-a', 'order', 1)).not.toThrow();
  });
});
