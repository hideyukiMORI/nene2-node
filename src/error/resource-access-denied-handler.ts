import type { ProblemDetailsFactory } from '../http/problem-details.js';
import type { DomainExceptionHandler } from './domain-exception-handler.js';
import { createSimpleDomainHandler } from './domain-exception-handler.js';
import { ResourceAccessDeniedError } from './resource-access-denied-error.js';

export function createResourceAccessDeniedHandler(
  problems: ProblemDetailsFactory,
): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: ResourceAccessDeniedError,
    problemType: 'forbidden',
    title: 'Forbidden',
    status: 403,
    detail: 'You do not have permission to access this resource.',
    extensionsFromError: (error) => {
      const denied = error as ResourceAccessDeniedError;
      return { resource: denied.resourceLabel, resourceId: denied.resourceId };
    },
  });
}
