import type { ProblemDetailsFactory } from '../http/problem-details.js';
import type { DomainExceptionHandler } from './domain-exception-handler.js';
import { createSimpleDomainHandler } from './domain-exception-handler.js';
import { ResourceNotFoundError } from './resource-not-found-error.js';

/**
 * Map {@link ResourceNotFoundError} to a generic `404 Not Found`. The body
 * intentionally omits the resource id so a cross-scope (e.g. cross-tenant)
 * resource is indistinguishable from one that does not exist.
 */
export function createResourceNotFoundHandler(
  problems: ProblemDetailsFactory,
): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: ResourceNotFoundError,
    problemType: 'not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource was not found.',
  });
}
