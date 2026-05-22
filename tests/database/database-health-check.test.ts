import { describe, expect, it } from 'vitest';

import { createDatabaseHealthCheck } from '../../src/database/database-health-check.js';

describe('createDatabaseHealthCheck', () => {
  it('returns ok when SELECT 1 returns a row', async () => {
    const check = createDatabaseHealthCheck({
      fetchOne: () => Promise.resolve({ ok: 1 }),
    });
    expect(await check.check()).toBe('ok');
  });

  it('returns error when fetchOne returns undefined', async () => {
    const check = createDatabaseHealthCheck({
      fetchOne: () => Promise.resolve(undefined),
    });
    expect(await check.check()).toBe('error');
  });

  it('returns error when fetchOne throws', async () => {
    const check = createDatabaseHealthCheck({
      fetchOne: () => Promise.reject(new Error('connection lost')),
    });
    expect(await check.check()).toBe('error');
  });
});
