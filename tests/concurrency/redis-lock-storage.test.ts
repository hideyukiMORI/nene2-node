import { describe, expect, it } from 'vitest';

import { createLockManager } from '../../src/concurrency/distributed-lock.js';
import { RedisLockStorage } from '../../src/concurrency/redis-lock-storage.js';
import type { RedisKeyValueClient } from '../../src/middleware/redis-key-value-client.js';

/**
 * Fake Redis honouring the semantics RedisLockStorage relies on: TTL expiry and
 * atomic `SET … NX` (setIfAbsent). A controllable clock drives expiry so the
 * test is deterministic — this validates the LockStorage contract on a second
 * backend (the reason the lock cluster was held Experimental).
 */
function fakeRedis(now: () => number): RedisKeyValueClient {
  const store = new Map<string, { value: string; expiresAt: number }>();
  const live = (key: string) => {
    const e = store.get(key);
    if (e === undefined) return undefined;
    if (now() >= e.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return e;
  };
  const ttl = (ex?: number) => (ex === undefined ? Number.POSITIVE_INFINITY : now() + ex * 1000);
  return {
    get: (key) => Promise.resolve(live(key)?.value ?? null),
    set: (key, value, options) => {
      store.set(key, { value, expiresAt: ttl(options?.EX) });
      return Promise.resolve();
    },
    incr: () => Promise.reject(new Error('unused')),
    expire: () => Promise.resolve(),
    del: (key) => {
      store.delete(key);
      return Promise.resolve();
    },
    setIfAbsent: (key, value, options) => {
      if (live(key) !== undefined) return Promise.resolve(false);
      store.set(key, { value, expiresAt: ttl(options?.EX) });
      return Promise.resolve(true);
    },
  };
}

describe('RedisLockStorage (via LockManager)', () => {
  function build(now: () => number) {
    return createLockManager({ storage: new RedisLockStorage(fakeRedis(now)), now });
  }

  it('acquires a free resource and blocks a second owner', async () => {
    const locks = build(() => 1000);
    expect(await locks.acquire('r', 'a', 5000)).not.toBeNull();
    expect(await locks.acquire('r', 'b', 5000)).toBeNull(); // NX prevents takeover
  });

  it('only one of many concurrent acquirers wins (atomic SET NX)', async () => {
    const locks = build(() => 0);
    const results = await Promise.all(
      Array.from({ length: 25 }, (_u, i) => locks.acquire('hot', `o-${String(i)}`, 5000)),
    );
    expect(results.filter((r) => r !== null)).toHaveLength(1);
  });

  it('release frees the lock; another owner can then take it', async () => {
    const locks = build(() => 0);
    await locks.acquire('r', 'a', 5000);
    expect(await locks.release('r', 'a')).toBe('released');
    expect(await locks.acquire('r', 'b', 5000)).not.toBeNull();
  });

  it('forbids release/renew by a non-owner', async () => {
    const locks = build(() => 0);
    await locks.acquire('r', 'a', 5000);
    expect(await locks.release('r', 'attacker')).toBe('forbidden');
    expect(await locks.renew('r', 'attacker')).toEqual({ ok: false, reason: 'forbidden' });
  });

  it('a lock is re-acquirable once its TTL elapses (Redis eviction)', async () => {
    let t = 0;
    const locks = build(() => t);
    await locks.acquire('r', 'a', 1000); // expires at 1000
    t = 1000;
    expect(await locks.status('r')).toBeNull();
    expect(await locks.acquire('r', 'b', 1000)).not.toBeNull();
  });
});
