import type { AsyncHealthCheck } from '../http/health-check.js';
import type { DatabaseQueryExecutor } from './database-query-executor.js';

export function createDatabaseHealthCheck(executor: DatabaseQueryExecutor): AsyncHealthCheck {
  return {
    name: 'database',
    async check(): Promise<'ok' | 'error'> {
      try {
        const row = await executor.fetchOne('SELECT 1 AS ok');
        return row !== undefined ? 'ok' : 'error';
      } catch {
        return 'error';
      }
    },
  };
}
