import { describe, expect, it, vi } from 'vitest';

import { wrapNodeRedisClient } from '../../src/middleware/redis-key-value-client.js';

describe('wrapNodeRedisClient', () => {
  it('delegates get/set/incr/expire to the underlying client', async () => {
    const underlying = {
      get: vi.fn(() => Promise.resolve('value')),
      set: vi.fn(() => Promise.resolve('OK')),
      incr: vi.fn(() => Promise.resolve(2)),
      expire: vi.fn(() => Promise.resolve(1)),
    };
    const client = wrapNodeRedisClient(underlying);

    await expect(client.get('k')).resolves.toBe('value');
    await client.set('k', 'v', { EX: 60 });
    await expect(client.incr('k')).resolves.toBe(2);
    await client.expire('k', 30);

    expect(underlying.set).toHaveBeenCalledWith('k', 'v', { EX: 60 });
    expect(underlying.expire).toHaveBeenCalledWith('k', 30);
  });
});
