export interface ValidationErrorJSON {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export class ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;

  constructor(field: string, message: string, code: string) {
    if (field === '' || message === '' || code === '') {
      throw new Error('ValidationError field, message, and code must not be empty');
    }
    if (code.includes(' ')) {
      throw new Error(
        `ValidationError.code must not contain spaces (got ${JSON.stringify(code)}). Use snake_case.`,
      );
    }
    this.field = field;
    this.message = message;
    this.code = code;
  }

  toJSON(): ValidationErrorJSON {
    return { field: this.field, message: this.message, code: this.code };
  }
}
