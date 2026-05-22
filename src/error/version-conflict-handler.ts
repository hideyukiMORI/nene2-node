import type { ProblemDetailsFactory } from '../http/problem-details.js';
import type { DomainExceptionHandler } from './domain-exception-handler.js';
import { createSimpleDomainHandler } from './domain-exception-handler.js';
import { VersionConflictError } from './version-conflict-error.js';

export function createVersionConflictHandler(
  problems: ProblemDetailsFactory,
): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: VersionConflictError,
    problemType: 'conflict',
    title: 'Conflict',
    status: 409,
    detailFromError: (error) => error.message,
    extensionsFromError: (error) => {
      const conflict = error as VersionConflictError;
      return {
        resource: conflict.resourceLabel,
        resourceId: conflict.resourceId,
        ...(conflict.expectedVersion === undefined
          ? {}
          : { expectedVersion: conflict.expectedVersion }),
      };
    },
  });
}
