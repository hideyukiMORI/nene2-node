import { describe, expect, it } from 'vitest';

import { parseCursorQuery } from '../../src/http/cursor-query.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe('parseCursorQuery — cursor param', () => {
  it('returns undefined cursor when ?cursor is absent', () => {
    const { cursor } = parseCursorQuery(params(''));
    expect(cursor).toBeUndefined();
  });

  it('returns undefined cursor when ?cursor is empty string', () => {
    const { cursor } = parseCursorQuery(params('cursor='));
    expect(cursor).toBeUndefined();
  });

  it('parses a valid positive integer cursor', () => {
    const { cursor } = parseCursorQuery(params('cursor=42'));
    expect(cursor).toBe(42);
  });

  it('parses cursor=1 (minimum valid)', () => {
    const { cursor } = parseCursorQuery(params('cursor=1'));
    expect(cursor).toBe(1);
  });

  it('silently ignores cursor=0 (returns undefined)', () => {
    const { cursor } = parseCursorQuery(params('cursor=0'));
    expect(cursor).toBeUndefined();
  });

  it('silently ignores negative cursor (returns undefined)', () => {
    const { cursor } = parseCursorQuery(params('cursor=-5'));
    expect(cursor).toBeUndefined();
  });

  it('silently ignores non-numeric cursor string (returns undefined)', () => {
    const { cursor } = parseCursorQuery(params('cursor=abc'));
    expect(cursor).toBeUndefined();
  });

  it('silently ignores mixed cursor value like "12abc" (returns undefined)', () => {
    // parseInt("12abc") === 12 but we reject because String(12) !== "12abc"
    const { cursor } = parseCursorQuery(params('cursor=12abc'));
    expect(cursor).toBeUndefined();
  });

  it('silently ignores float cursor (returns undefined)', () => {
    const { cursor } = parseCursorQuery(params('cursor=3.5'));
    expect(cursor).toBeUndefined();
  });
});

describe('parseCursorQuery — limit param', () => {
  it('defaults to 10 when ?limit is absent', () => {
    const { limit } = parseCursorQuery(params(''));
    expect(limit).toBe(10);
  });

  it('accepts ?limit=1 (minimum valid)', () => {
    const { limit } = parseCursorQuery(params('limit=1'));
    expect(limit).toBe(1);
  });

  it('accepts ?limit=100 (default maximum)', () => {
    const { limit } = parseCursorQuery(params('limit=100'));
    expect(limit).toBe(100);
  });

  it('throws ValidationException for limit=0', () => {
    expect(() => parseCursorQuery(params('limit=0'))).toThrow(ValidationException);
  });

  it('throws ValidationException for limit=101 (above default max)', () => {
    expect(() => parseCursorQuery(params('limit=101'))).toThrow(ValidationException);
  });

  it('throws ValidationException for negative limit', () => {
    expect(() => parseCursorQuery(params('limit=-1'))).toThrow(ValidationException);
  });

  it('throws ValidationException for non-numeric limit', () => {
    expect(() => parseCursorQuery(params('limit=bad'))).toThrow(ValidationException);
  });

  it('includes field "limit" in the ValidationException errors', () => {
    try {
      parseCursorQuery(params('limit=0'));
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      const ve = err as ValidationException;
      expect(ve.errors[0]?.field).toBe('limit');
    }
  });
});

describe('parseCursorQuery — defaults override', () => {
  it('respects defaultLimit override', () => {
    const { limit } = parseCursorQuery(params(''), { defaultLimit: 25 });
    expect(limit).toBe(25);
  });

  it('respects maxLimit override — accepts value at max', () => {
    const { limit } = parseCursorQuery(params('limit=50'), { maxLimit: 50 });
    expect(limit).toBe(50);
  });

  it('respects maxLimit override — throws for value above max', () => {
    expect(() => parseCursorQuery(params('limit=51'), { maxLimit: 50 })).toThrow(
      ValidationException,
    );
  });
});

describe('parseCursorQuery — combined', () => {
  it('parses both cursor and limit together', () => {
    const { cursor, limit } = parseCursorQuery(params('cursor=99&limit=15'));
    expect(cursor).toBe(99);
    expect(limit).toBe(15);
  });

  it('first-page query: no cursor + limit', () => {
    const { cursor, limit } = parseCursorQuery(params('limit=5'));
    expect(cursor).toBeUndefined();
    expect(limit).toBe(5);
  });
});
