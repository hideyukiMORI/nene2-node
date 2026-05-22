import type { DomainExceptionHandler } from '../../error/domain-exception-handler.js';
import { createSimpleDomainHandler } from '../../error/domain-exception-handler.js';
import type { ProblemDetailsFactory } from '../../http/problem-details.js';
import { TagNotFoundError } from './tag-not-found-error.js';

export function createTagNotFoundHandler(problems: ProblemDetailsFactory): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: TagNotFoundError,
    problemType: 'not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested tag was not found.',
  });
}
