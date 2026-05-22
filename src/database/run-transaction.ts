import type { DatabaseQueryExecutor } from './database-query-executor.js';
import type { DatabaseTransactionManager } from './database-transaction-manager.js';
import { TransactionAbortedError } from '../error/transaction-aborted-error.js';
import { DomainError } from '../error/domain-error.js';

/**
 * Runs `transactional()` and maps failures to `TransactionAbortedError` for HTTP mapping.
 * Preserves existing `DomainError` subclasses (including `TransactionAbortedError`).
 */
export async function runTransaction<T>(
  manager: DatabaseTransactionManager,
  callback: (executor: DatabaseQueryExecutor) => Promise<T>,
): Promise<T> {
  try {
    return await manager.transactional(callback);
  } catch (error) {
    if (error instanceof DomainError) {
      throw error;
    }
    const reason =
      error instanceof Error && error.message !== ''
        ? error.message
        : 'The transaction was rolled back.';
    throw new TransactionAbortedError(reason, error);
  }
}
