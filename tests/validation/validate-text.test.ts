import { describe, expect, it } from 'vitest';

import { createValidationCollector } from '../../src/validation/validation-collector.js';
import {
  countCodePoints,
  hasNullByte,
  validateTextField,
} from '../../src/validation/validate-text.js';

const NUL = String.fromCharCode(0);

describe('countCodePoints', () => {
  it('counts ASCII by length', () => {
    expect(countCodePoints('hello')).toBe(5);
  });

  it('counts a BMP multibyte char as 1 (not its byte length)', () => {
    expect(countCodePoints('あ')).toBe(1); // 3 UTF-8 bytes, 1 code point
    expect(countCodePoints('あ'.repeat(50))).toBe(50);
  });

  it('counts an astral emoji as 1 even though .length is 2', () => {
    expect('🎉'.length).toBe(2); // UTF-16 surrogate pair (the JS pitfall)
    expect(countCodePoints('🎉')).toBe(1);
    expect(countCodePoints('🎉'.repeat(50))).toBe(50);
  });

  it('counts a ZWJ family emoji as 5 code points (not 1 grapheme)', () => {
    const family = '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}';
    expect(countCodePoints(family)).toBe(5);
  });
});

describe('hasNullByte', () => {
  it('detects an embedded NUL', () => {
    expect(hasNullByte(`Alice${NUL}Bob`)).toBe(true);
  });
  it('is false for clean text', () => {
    expect(hasNullByte('Alice')).toBe(false);
  });
});

describe('validateTextField', () => {
  function run(value: unknown, rule: { min?: number; max?: number }) {
    const v = createValidationCollector();
    validateTextField(v, 'name', value, rule);
    return v.errors;
  }

  it('accepts text within code-point limits', () => {
    expect(run('田中太郎', { min: 1, max: 50 })).toHaveLength(0);
  });

  it('accepts 50 multibyte chars under a 50-char limit (byte count would reject)', () => {
    expect(run('あ'.repeat(50), { min: 1, max: 50 })).toHaveLength(0);
  });

  it('rejects 51 chars as too_long', () => {
    const errors = run('あ'.repeat(51), { min: 1, max: 50 });
    expect(errors[0]).toMatchObject({ field: 'name', code: 'too_long' });
  });

  it('accepts 50 emoji under a 50-char limit', () => {
    expect(run('🎉'.repeat(50), { max: 50 })).toHaveLength(0);
  });

  it('accepts multi-script input', () => {
    expect(run('André García 鈴木 🚀 محمد', { max: 100 })).toHaveLength(0);
  });

  it('rejects a null byte with code null_byte', () => {
    const errors = run(`Alice${NUL}Bob`, { max: 50 });
    expect(errors[0]).toMatchObject({ field: 'name', code: 'null_byte' });
  });

  it('rejects a non-string with invalid_type', () => {
    expect(run(123, { max: 50 })[0]).toMatchObject({ code: 'invalid_type' });
  });

  it('reports empty as required when min >= 1', () => {
    expect(run('', { min: 1, max: 50 })[0]).toMatchObject({ code: 'required' });
  });

  it('reports below-min (non-empty) as too_short', () => {
    expect(run('ab', { min: 3, max: 50 })[0]).toMatchObject({ code: 'too_short' });
  });

  it('allows empty when min is 0 (e.g. optional bio)', () => {
    expect(run('', { max: 500 })).toHaveLength(0);
  });

  it('composes with the collector across fields', () => {
    const v = createValidationCollector();
    validateTextField(v, 'name', '', { min: 1, max: 50 });
    validateTextField(v, 'bio', 'x'.repeat(501), { max: 500 });
    expect(v.errors.map((e) => `${e.field}:${e.code}`)).toEqual(['name:required', 'bio:too_long']);
  });
});
