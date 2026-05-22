import { describe, expect, it } from 'vitest';

import { ValidationError } from '../../src/validation/validation-error.js';

describe('ValidationError', () => {
  it('serializes to JSON', () => {
    const error = new ValidationError('title', 'required', 'required_field');
    expect(error.toJSON()).toEqual({
      field: 'title',
      message: 'required',
      code: 'required_field',
    });
  });

  it('rejects empty parts', () => {
    expect(() => new ValidationError('', 'm', 'c')).toThrow(/must not be empty/);
  });

  it('rejects codes containing spaces', () => {
    expect(() => new ValidationError('f', 'm', 'bad code')).toThrow(/snake_case/);
  });
});
