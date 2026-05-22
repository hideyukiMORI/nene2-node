import type { DatabaseQueryExecutor } from './database-query-executor.js';

export interface DatabaseTransactionManager {
  transactional<T>(callback: (executor: DatabaseQueryExecutor) => Promise<T>): Promise<T>;
}
