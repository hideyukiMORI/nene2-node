import type { ProblemDetailsFactory } from '../http/problem-details.js';
import type { DomainExceptionHandler } from '../error/domain-exception-handler.js';
import { createResourceAccessDeniedHandler } from '../error/resource-access-denied-handler.js';
import { createResourceNotFoundHandler } from '../error/resource-not-found-handler.js';
import { createTransactionAbortedHandler } from '../error/transaction-aborted-handler.js';
import { createVersionConflictHandler } from '../error/version-conflict-handler.js';

/**
 * Framework domain handlers registered by `createApp()` before example/user handlers.
 * Apps may append handlers via `createApp({ domainHandlers })` — first `supports()` wins.
 */
export function createDefaultDomainHandlers(
  problems: ProblemDetailsFactory,
): readonly DomainExceptionHandler[] {
  return [
    createTransactionAbortedHandler(problems),
    createVersionConflictHandler(problems),
    createResourceAccessDeniedHandler(problems),
    createResourceNotFoundHandler(problems),
  ];
}
