import { afterAll, describe, expect, it } from 'vitest';

import { createRedisKeyValueClientFromUrl } from '../../src/middleware/create-redis-client.js';
import { RedisIdempotencyStorage } from '../../src/middleware/redis-idempotency-storage.js';
import { RedisRateLimitStorage } from '../../src/middleware/redis-rate-limit-storage.js';
import type { RedisKeyValueClient } from '../../src/middleware/redis-key-value-client.js';

const redisUrl = process.env['NENE2_NODE_TEST_REDIS_URL'];

// Use a unique run prefix so parallel CI runs do not collide.
const runId = `ci-${Date.now()}`;

describe.skipIf(redisUrl === undefined)('Redis integration (CI service container)', () => {
  let client: RedisKeyValueClient & { quit?: () => Promise<void> };

  afterAll(async () => {
    // node-redis exposes quit() — cast through unknown for the optional call.
    const quittable = client as unknown as { quit?: () => Promise<void> };
    await quittable.quit?.();
  });

  it('connects via createRedisKeyValueClientFromUrl', async () => {
    client = await createRedisKeyValueClientFromUrl(redisUrl!);
    expect(client).toBeDefined();
  });

  it('get returns null for missing key', async () => {
    const result = await client.get(`${runId}:missing`);
    expect(result).toBeNull();
  });

  it('set and get round-trip', async () => {
    await client.set(`${runId}:greeting`, 'hello', { EX: 60 });
    const result = await client.get(`${runId}:greeting`);
    expect(result).toBe('hello');
  });

  it('incr increments atomically', async () => {
    const key = `${runId}:counter`;
    const a = await client.incr(key);
    const b = await client.incr(key);
    const c = await client.incr(key);
    expect(a).toBe(1);
    expect(b).toBe(2);
    expect(c).toBe(3);
  });

  it('RedisRateLimitStorage.hit() increments count', async () => {
    const storage = new RedisRateLimitStorage(client, `${runId}:rl:`);
    const first = await storage.hit('user:42', 60);
    const second = await storage.hit('user:42', 60);
    const third = await storage.hit('user:42', 60);
    expect(first.count).toBe(1);
    expect(second.count).toBe(2);
    expect(third.count).toBe(3);
    expect(first.resetAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('RedisIdempotencyStorage set/get round-trip', async () => {
    const storage = new RedisIdempotencyStorage(client, `${runId}:idem:`, 60);
    await storage.set('req-abc', {
      status: 201,
      body: '{"id":99}',
      contentType: 'application/json',
      bodyHash: 'sha256-abc',
    });
    const record = await storage.get('req-abc');
    expect(record?.status).toBe(201);
    expect(record?.body).toBe('{"id":99}');
    expect(record?.contentType).toBe('application/json');
  });

  it('RedisIdempotencyStorage.get returns undefined for unknown key', async () => {
    const storage = new RedisIdempotencyStorage(client, `${runId}:idem:`, 60);
    const result = await storage.get('no-such-key');
    expect(result).toBeUndefined();
  });
});
