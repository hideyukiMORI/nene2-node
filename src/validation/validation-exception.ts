import { ValidationError } from './validation-error.js';

export class ValidationException extends Error {
  readonly errors: readonly ValidationError[];

  constructor(errors: readonly ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }

  static single(field: string, message: string, code: string): ValidationException {
    return new ValidationException([new ValidationError(field, message, code)]);
  }
}
