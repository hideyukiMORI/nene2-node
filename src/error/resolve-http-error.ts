import type { Context } from 'hono';

import { ValidationException } from '../validation/validation-exception.js';
import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';
import type { DomainExceptionHandler } from './domain-exception-handler.js';

export interface ResolveHttpErrorOptions {
  readonly problems: ProblemDetailsFactory;
  readonly c: Context;
  readonly error: unknown;
  readonly appDebug: boolean;
  readonly domainHandlers: readonly DomainExceptionHandler[];
}

export function resolveHttpError(options: ResolveHttpErrorOptions): Response {
  const { problems, c, error, appDebug, domainHandlers } = options;

  if (error instanceof ValidationException) {
    return problemDetailsFromContext(
      problems,
      c,
      'validation-failed',
      'Validation Failed',
      422,
      'The request contains invalid values.',
      { errors: error.errors.map((item) => item.toJSON()) },
    );
  }

  for (const handler of domainHandlers) {
    if (handler.supports(error)) {
      return handler.handle(error, c);
    }
  }

  if (appDebug) {
    console.error(error);
  }

  const detail =
    appDebug && error instanceof Error ? error.message : 'An unexpected error occurred.';

  return problemDetailsFromContext(
    problems,
    c,
    'internal-server-error',
    'Internal Server Error',
    500,
    detail,
  );
}
