import { ValidationError } from '../../validation/validation-error.js';
import { ValidationException } from '../../validation/validation-exception.js';

export interface ValidatedTagBody {
  readonly name: string;
}

export function validateTagBody(body: Record<string, unknown>): ValidatedTagBody {
  const errors: ValidationError[] = [];
  const name = typeof body['name'] === 'string' ? body['name'].trim() : '';

  if (name === '') {
    errors.push(new ValidationError('name', 'Name is required.', 'required'));
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return { name };
}
