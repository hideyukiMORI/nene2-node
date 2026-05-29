import type { RedisKeyValueClient } from '../middleware/redis-key-value-client.js';
import type { LockRecord, LockStorage } from './distributed-lock.js';

/**
 * Redis-backed {@link LockStorage} for cross-instance distributed locks.
 *
 * Acquire is atomic via `SET key value NX EX` ({@link RedisKeyValueClient.setIfAbsent});
 * expiry is the Redis key TTL (an expired key is gone, so `get` returns
 * `undefined` and a fresh `putIfAbsent` succeeds). `put` overwrites with a new
 * TTL (owner-verified re-acquire/renew, decided by `LockManager`); `delete`
 * releases.
 *
 * @example
 *   const redis = wrapNodeRedisClient(nodeRedisClient);
 *   const locks = createLockManager({ storage: new RedisLockStorage(redis) });
 */
export class RedisLockStorage implements LockStorage {
  constructor(
    private readonly client: RedisKeyValueClient,
    private readonly keyPrefix = 'nene2:lock:',
  ) {}

  private key(resource: string): string {
    return `${this.keyPrefix}${resource}`;
  }

  private static ttlSeconds(ttlMs: number): number {
    return Math.max(1, Math.ceil(ttlMs / 1000));
  }

  async get(resource: string): Promise<LockRecord | undefined> {
    const raw = await this.client.get(this.key(resource));
    // A present key is live — Redis has already evicted expired keys.
    return raw === null ? undefined : (JSON.parse(raw) as LockRecord);
  }

  putIfAbsent(record: LockRecord, ttlMs: number): Promise<boolean> {
    return this.client.setIfAbsent(this.key(record.resource), JSON.stringify(record), {
      EX: RedisLockStorage.ttlSeconds(ttlMs),
    });
  }

  put(record: LockRecord, ttlMs: number): Promise<void> {
    return this.client.set(this.key(record.resource), JSON.stringify(record), {
      EX: RedisLockStorage.ttlSeconds(ttlMs),
    });
  }

  delete(resource: string): Promise<void> {
    return this.client.del(this.key(resource));
  }
}
