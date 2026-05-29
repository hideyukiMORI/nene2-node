import { describe, expect, it } from 'vitest';

import { escapeLikePattern } from '../../src/database/escape-like-pattern.js';

describe('escapeLikePattern', () => {
  it('leaves plain text unchanged', () => {
    expect(escapeLikePattern('widget')).toBe('widget');
  });

  it('escapes percent wildcards', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('%')).toBe('\\%');
  });

  it('escapes underscore wildcards', () => {
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
  });

  it('escapes the escape character itself (first)', () => {
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
    expect(escapeLikePattern('\\%')).toBe('\\\\\\%'); // backslash then percent
  });

  it('supports a custom escape character', () => {
    expect(escapeLikePattern('50%_off', '!')).toBe('50!%!_off');
    expect(escapeLikePattern('a!b', '!')).toBe('a!!b');
  });

  it('handles a wildcard-only injection payload', () => {
    expect(escapeLikePattern('%%%')).toBe('\\%\\%\\%');
  });

  it('is empty-safe', () => {
    expect(escapeLikePattern('')).toBe('');
  });
});
