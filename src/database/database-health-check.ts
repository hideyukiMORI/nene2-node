import type { HealthCheck } from '../http/health-check.js';
import type { DatabaseQueryExecutor } from './database-query-executor.js';

export function createDatabaseHealthCheck(executor: DatabaseQueryExecutor): HealthCheck {
  return {
    name: 'database',
    check(): 'ok' | 'error' {
      try {
        const row = executor.fetchOne('SELECT 1 AS ok');
        return row !== undefined ? 'ok' : 'error';
      } catch {
        return 'error';
      }
    },
  };
}
