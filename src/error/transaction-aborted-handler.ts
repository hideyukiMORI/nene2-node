import type { ProblemDetailsFactory } from '../http/problem-details.js';
import type { DomainExceptionHandler } from './domain-exception-handler.js';
import { createSimpleDomainHandler } from './domain-exception-handler.js';
import { TransactionAbortedError } from './transaction-aborted-error.js';

export function createTransactionAbortedHandler(
  problems: ProblemDetailsFactory,
): DomainExceptionHandler {
  return createSimpleDomainHandler(problems, {
    ExceptionClass: TransactionAbortedError,
    problemType: 'transaction-aborted',
    title: 'Transaction Aborted',
    status: 422,
    detailFromError: (error) => error.message,
    extensionsFromError: (error) => {
      const aborted = error as TransactionAbortedError;
      return { reason: aborted.reason };
    },
  });
}
