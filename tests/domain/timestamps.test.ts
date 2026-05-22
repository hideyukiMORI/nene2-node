import { describe, expect, it } from 'vitest';

import {
  formatUtcIsoTimestamp,
  parseUtcIsoTimestamp,
  utcNowIso,
} from '../../src/domain/timestamps.js';

describe('timestamp helpers', () => {
  it('round-trips UTC ISO', () => {
    const iso = '2026-05-22T12:00:00.000Z';
    expect(formatUtcIsoTimestamp(parseUtcIsoTimestamp(iso))).toBe(iso);
  });

  it('rejects offset-less local strings', () => {
    expect(() => parseUtcIsoTimestamp('2026-05-22T12:00:00')).toThrow(/UTC offset/);
  });

  it('utcNowIso ends with Z', () => {
    expect(utcNowIso().endsWith('Z')).toBe(true);
  });

  it('rejects empty timestamps', () => {
    expect(() => parseUtcIsoTimestamp('')).toThrow(/must not be empty/);
    expect(() => parseUtcIsoTimestamp('   ')).toThrow(/must not be empty/);
  });

  it('accepts explicit numeric offsets', () => {
    const parsed = parseUtcIsoTimestamp('2026-05-22T21:00:00+09:00');
    expect(formatUtcIsoTimestamp(parsed)).toBe('2026-05-22T12:00:00.000Z');
  });

  it('rejects invalid ISO strings', () => {
    expect(() => parseUtcIsoTimestamp('not-a-dateZ')).toThrow(/Invalid ISO timestamp/);
  });
});
