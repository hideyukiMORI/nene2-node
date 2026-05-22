import type { DomainExceptionHandler } from '../../error/domain-exception-handler.js';
import { createSimpleDomainHandler } from '../../error/domain-exception-handler.js';
import type { ProblemDetailsFactory } from '../../http/problem-details.js';
import { NoteNotFoundError } from './note-not-found-error.js';

export function createNoteNotFoundHandler(problems: ProblemDetailsFactory): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: NoteNotFoundError,
    problemType: 'not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested note was not found.',
  });
}
