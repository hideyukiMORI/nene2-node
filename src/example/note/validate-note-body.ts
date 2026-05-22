import { ValidationError } from '../../validation/validation-error.js';
import { ValidationException } from '../../validation/validation-exception.js';

export interface ValidatedNoteBody {
  readonly title: string;
  readonly body: string;
}

export function validateCreateNoteBody(body: Record<string, unknown>): ValidatedNoteBody {
  const errors: ValidationError[] = [];

  const title = typeof body['title'] === 'string' ? body['title'].trim() : '';
  const noteBody = typeof body['body'] === 'string' ? body['body'].trim() : '';

  if (title === '') {
    errors.push(new ValidationError('title', 'Title is required.', 'required'));
  }

  if (noteBody === '') {
    errors.push(new ValidationError('body', 'Body is required.', 'required'));
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return { title, body: noteBody };
}
