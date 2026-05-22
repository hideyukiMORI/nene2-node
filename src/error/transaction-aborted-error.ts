import { DomainError } from './domain-error.js';

/**
 * Thrown when a database transaction rolls back due to a business rule or unexpected error.
 * Map with `createTransactionAbortedHandler` for Problem Details instead of opaque 500.
 */
export class TransactionAbortedError extends DomainError {
  constructor(
    readonly reason: string,
    readonly cause?: unknown,
  ) {
    super(reason);
    this.name = 'TransactionAbortedError';
  }
}
