import { describe, expect, it } from 'vitest';

import {
  buildHealthResponse,
  buildHealthResponseAsync,
  type AsyncHealthCheck,
  type HealthCheck,
} from '../../src/http/health-check.js';

describe('buildHealthResponse', () => {
  it('returns ok when there are no checks', () => {
    const result = buildHealthResponse('svc', []);
    expect(result).toEqual({ status: 'ok', service: 'svc', httpStatus: 200 });
  });

  it('returns degraded when a check fails', () => {
    const checks: HealthCheck[] = [
      { name: 'database', check: () => 'error' },
      { name: 'cache', check: () => 'ok' },
    ];
    const result = buildHealthResponse('svc', checks);
    expect(result.status).toBe('degraded');
    expect(result.httpStatus).toBe(503);
    expect(result.checks).toEqual({ database: 'error', cache: 'ok' });
  });

  it('treats thrown checks as error', () => {
    const checks: HealthCheck[] = [
      {
        name: 'db',
        check: () => {
          throw new Error('down');
        },
      },
    ];
    const result = buildHealthResponse('svc', checks);
    expect(result.checks?.db).toBe('error');
    expect(result.httpStatus).toBe(503);
  });
});

describe('buildHealthResponseAsync', () => {
  it('returns ok when there are no async checks', async () => {
    const result = await buildHealthResponseAsync('svc', []);
    expect(result.httpStatus).toBe(200);
  });

  it('aggregates async check results', async () => {
    const checks: AsyncHealthCheck[] = [
      { name: 'database', check: () => Promise.resolve('ok' as const) },
      { name: 'queue', check: () => Promise.resolve('error' as const) },
    ];
    const result = await buildHealthResponseAsync('svc', checks);
    expect(result.status).toBe('degraded');
    expect(result.checks).toEqual({ database: 'ok', queue: 'error' });
  });

  it('treats rejected async checks as error', async () => {
    const checks: AsyncHealthCheck[] = [
      { name: 'db', check: async () => Promise.reject(new Error('timeout')) },
    ];
    const result = await buildHealthResponseAsync('svc', checks);
    expect(result.checks?.db).toBe('error');
  });
});
