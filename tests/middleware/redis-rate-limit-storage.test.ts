import { describe, expect, it } from 'vitest';

import type { RedisKeyValueClient } from '../../src/middleware/redis-key-value-client.js';
import { RedisRateLimitStorage } from '../../src/middleware/redis-rate-limit-storage.js';

function createMockRedis(): RedisKeyValueClient & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    get: (key) => Promise.resolve(store.get(key) ?? null),
    set: (key, value) => {
      store.set(key, value);
      return Promise.resolve();
    },
    incr: (key) => {
      const current = Number(store.get(key) ?? '0') + 1;
      store.set(key, String(current));
      return Promise.resolve(current);
    },
    expire: () => Promise.resolve(),
  };
}

describe('RedisRateLimitStorage', () => {
  it('increments count via INCR', async () => {
    const redis = createMockRedis();
    const storage = new RedisRateLimitStorage(redis);
    const first = await storage.hit('user:1', 60);
    const second = await storage.hit('user:1', 60);
    expect(first.count).toBe(1);
    expect(second.count).toBe(2);
  });
});
