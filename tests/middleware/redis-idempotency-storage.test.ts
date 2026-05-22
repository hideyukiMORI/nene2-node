import { describe, expect, it } from 'vitest';

import type { RedisKeyValueClient } from '../../src/middleware/redis-key-value-client.js';
import { RedisIdempotencyStorage } from '../../src/middleware/redis-idempotency-storage.js';

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

describe('RedisIdempotencyStorage', () => {
  it('stores and retrieves JSON records', async () => {
    const redis = createMockRedis();
    const storage = new RedisIdempotencyStorage(redis, 'nene2:idem:', 60);
    await storage.set('k1', {
      status: 201,
      body: '{"ok":true}',
      contentType: 'application/json',
      bodyHash: '0',
    });
    const hit = await storage.get('k1');
    expect(hit?.status).toBe(201);
  });
});
