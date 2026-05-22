import type { Context } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

export interface DomainExceptionHandler {
  supports(error: unknown): boolean;
  handle(error: unknown, c: Context): Response;
}

export interface SimpleDomainHandlerOptions {
  readonly ExceptionClass: abstract new (...args: never[]) => Error;
  readonly problemType: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly detailFromError?: (error: Error) => string;
  readonly extensionsFromError?: (error: Error) => Readonly<Record<string, unknown>>;
}

export function createSimpleDomainHandler(
  problems: ProblemDetailsFactory,
  options: SimpleDomainHandlerOptions,
): DomainExceptionHandler {
  return {
    supports(error: unknown): boolean {
      return error instanceof options.ExceptionClass;
    },
    handle(error: unknown, c: Context): Response {
      const err = error as Error;
      const detail = options.detailFromError?.(err) ?? options.detail;
      const extensions = options.extensionsFromError?.(err);
      return problemDetailsFromContext(
        problems,
        c,
        options.problemType,
        options.title,
        options.status,
        detail,
        extensions,
      );
    },
  };
}
