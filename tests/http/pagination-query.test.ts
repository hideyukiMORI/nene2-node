import { describe, expect, it } from 'vitest';

import { parsePaginationQuery } from '../../src/http/pagination-query.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

// ---------------------------------------------------------------------------
// Normal happy-path tests
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — defaults', () => {
  it('returns default limit=20, offset=0 when no params', () => {
    const { limit, offset } = parsePaginationQuery(params(''));
    expect(limit).toBe(20);
    expect(offset).toBe(0);
  });

  it('accepts valid limit and offset', () => {
    const { limit, offset } = parsePaginationQuery(params('limit=10&offset=20'));
    expect(limit).toBe(10);
    expect(offset).toBe(20);
  });

  it('accepts limit=1 (minimum)', () => {
    expect(parsePaginationQuery(params('limit=1')).limit).toBe(1);
  });

  it('accepts limit=100 (default maximum)', () => {
    expect(parsePaginationQuery(params('limit=100')).limit).toBe(100);
  });

  it('accepts offset=0', () => {
    expect(parsePaginationQuery(params('offset=0')).offset).toBe(0);
  });

  it('respects defaultLimit override', () => {
    expect(parsePaginationQuery(params(''), { defaultLimit: 5 }).limit).toBe(5);
  });

  it('respects maxLimit override', () => {
    expect(parsePaginationQuery(params('limit=50'), { maxLimit: 50 }).limit).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// Existing out-of-range validation (must not regress)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — out-of-range (regression)', () => {
  it('throws for limit=0', () => {
    expect(() => parsePaginationQuery(params('limit=0'))).toThrow(ValidationException);
  });

  it('throws for limit=101 (above default max)', () => {
    expect(() => parsePaginationQuery(params('limit=101'))).toThrow(ValidationException);
  });

  it('throws for limit above custom max', () => {
    expect(() => parsePaginationQuery(params('limit=51'), { maxLimit: 50 })).toThrow(
      ValidationException,
    );
  });
});

// ---------------------------------------------------------------------------
// FT177: Float injection  (VULN-C)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — float injection (VULN-C)', () => {
  it('rejects limit=10.5', () => {
    expect(() => parsePaginationQuery(params('limit=10.5'))).toThrow(ValidationException);
  });

  it('rejects limit=1e2', () => {
    expect(() => parsePaginationQuery(params('limit=1e2'))).toThrow(ValidationException);
  });

  it('rejects limit=1.0', () => {
    expect(() => parsePaginationQuery(params('limit=1.0'))).toThrow(ValidationException);
  });

  it('rejects offset=5.5', () => {
    expect(() => parsePaginationQuery(params('offset=5.5'))).toThrow(ValidationException);
  });

  it('float errors have code invalid_type', () => {
    try {
      parsePaginationQuery(params('limit=10.5'));
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect((err as ValidationException).errors[0]?.code).toBe('invalid_type');
    }
  });
});

// ---------------------------------------------------------------------------
// FT177: Signed / padded inputs  (VULN-D)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — signed/padded inputs (VULN-D)', () => {
  it('rejects limit=+10', () => {
    expect(() => parsePaginationQuery(params('limit=%2B10'))).toThrow(ValidationException);
  });

  it('rejects limit= 10 (leading space)', () => {
    expect(() => parsePaginationQuery(new URLSearchParams([['limit', ' 10']]))).toThrow(
      ValidationException,
    );
  });

  it('rejects offset=+5', () => {
    expect(() => parsePaginationQuery(params('offset=%2B5'))).toThrow(ValidationException);
  });
});

// ---------------------------------------------------------------------------
// FT177: Integer overflow guard  (VULN-E)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — integer overflow guard (VULN-E)', () => {
  it('rejects limit with 19 digits (overflow territory)', () => {
    expect(() => parsePaginationQuery(params('limit=9999999999999999999'))).toThrow(
      ValidationException,
    );
  });

  it('rejects offset with 20+ digits', () => {
    expect(() => parsePaginationQuery(params('offset=99999999999999999999'))).toThrow(
      ValidationException,
    );
  });

  it('accepts limit with exactly 18 digits (clamped by maxLimit anyway)', () => {
    // 18-digit string is valid format; the range check (> maxLimit) catches it
    expect(() => parsePaginationQuery(params('limit=123456789012345678'))).toThrow(
      ValidationException,
    ); // out_of_range, not invalid_type
  });
});

// ---------------------------------------------------------------------------
// FT177: Non-numeric / SQL injection  (VULN-F)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — non-numeric / SQL injection (VULN-F)', () => {
  it('rejects limit=abc', () => {
    expect(() => parsePaginationQuery(params('limit=abc'))).toThrow(ValidationException);
  });

  it('rejects limit=1;DROP TABLE', () => {
    expect(() => parsePaginationQuery(params('limit=1;DROP+TABLE'))).toThrow(ValidationException);
  });

  it('rejects limit=0x10 (hex)', () => {
    expect(() => parsePaginationQuery(params('limit=0x10'))).toThrow(ValidationException);
  });

  it('rejects offset=abc', () => {
    expect(() => parsePaginationQuery(params('offset=abc'))).toThrow(ValidationException);
  });
});

// ---------------------------------------------------------------------------
// FT177: ReDoS  (VULN-L)
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — ReDoS immunity (VULN-L)', () => {
  it('rejects a 50-digit string ending in non-digit in under 10ms', () => {
    const payload = '1'.repeat(50) + 'x'; // classic ReDoS trigger for /^\d+$/
    const start = Date.now();
    expect(() => parsePaginationQuery(params(`limit=${payload}`))).toThrow(ValidationException);
    expect(Date.now() - start).toBeLessThan(10);
  });

  it('rejects a 100-digit all-zero string (overflow guard) in under 10ms', () => {
    const payload = '0'.repeat(100);
    const start = Date.now();
    expect(() => parsePaginationQuery(params(`limit=${payload}`))).toThrow(ValidationException);
    expect(Date.now() - start).toBeLessThan(10);
  });
});

// ---------------------------------------------------------------------------
// FT177: Large valid page (VULN-J) — must not crash
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — large valid page (VULN-J)', () => {
  it('allows a very large offset (returns it as-is; DB returns empty rows)', () => {
    const { offset } = parsePaginationQuery(params('offset=999999&limit=10'));
    expect(offset).toBe(999999);
  });
});

// ---------------------------------------------------------------------------
// ValidationException field names
// ---------------------------------------------------------------------------

describe('parsePaginationQuery — error field names', () => {
  it('error field is "limit" for limit violations', () => {
    try {
      parsePaginationQuery(params('limit=bad'));
    } catch (err) {
      expect((err as ValidationException).errors[0]?.field).toBe('limit');
    }
  });

  it('error field is "offset" for offset violations', () => {
    try {
      parsePaginationQuery(params('offset=bad'));
    } catch (err) {
      expect((err as ValidationException).errors[0]?.field).toBe('offset');
    }
  });

  it('collects both limit and offset errors in one exception', () => {
    try {
      parsePaginationQuery(params('limit=bad&offset=bad'));
    } catch (err) {
      expect((err as ValidationException).errors).toHaveLength(2);
    }
  });
});
