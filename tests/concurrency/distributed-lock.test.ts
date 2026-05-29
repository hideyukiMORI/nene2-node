import { describe, expect, it } from 'vitest';

import { createLockManager } from '../../src/concurrency/distributed-lock.js';

function fakeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe('createLockManager — acquire', () => {
  it('acquires a free resource', async () => {
    const locks = createLockManager({ now: () => 1000, defaultTtlMs: 5000 });
    const lock = await locks.acquire('payment:42', 'worker-a');
    expect(lock).not.toBeNull();
    expect(lock).toMatchObject({
      resource: 'payment:42',
      owner: 'worker-a',
      acquiredAt: 1000,
      expiresAt: 6000,
    });
  });

  it('lets the same owner re-acquire (extend)', async () => {
    const clock = fakeClock(1000);
    const locks = createLockManager({ now: clock.now, defaultTtlMs: 5000 });
    await locks.acquire('r', 'a');
    clock.advance(1000);
    const again = await locks.acquire('r', 'a');
    expect(again?.expiresAt).toBe(7000); // 2000 + 5000
  });

  it('ATK-01: cannot acquire a lock held by another owner (→ null)', async () => {
    const locks = createLockManager({ now: () => 0, defaultTtlMs: 5000 });
    await locks.acquire('r', 'owner-a');
    const stolen = await locks.acquire('r', 'attacker');
    expect(stolen).toBeNull();
  });

  it('ATK-03: an expired lock is re-acquirable by any owner (by design)', async () => {
    const clock = fakeClock(0);
    const locks = createLockManager({ now: clock.now, defaultTtlMs: 5000 });
    await locks.acquire('r', 'owner-a');
    clock.advance(5000); // now == expiresAt → expired
    const taken = await locks.acquire('r', 'owner-b');
    expect(taken).not.toBeNull();
    expect(taken?.owner).toBe('owner-b');
  });
});

describe('createLockManager — release', () => {
  it('releases when the owner matches', async () => {
    const locks = createLockManager({ now: () => 0 });
    await locks.acquire('r', 'a');
    expect(await locks.release('r', 'a')).toBe('released');
    expect(await locks.status('r')).toBeNull();
  });

  it('returns not-found for an absent lock', async () => {
    const locks = createLockManager();
    expect(await locks.release('missing', 'a')).toBe('not-found');
  });

  it('ATK-02: returns forbidden when another owner tries to release', async () => {
    const locks = createLockManager({ now: () => 0 });
    await locks.acquire('r', 'owner-a');
    expect(await locks.release('r', 'attacker')).toBe('forbidden');
    // still held by owner-a
    expect((await locks.status('r'))?.owner).toBe('owner-a');
  });

  it('returns not-found when the lock has already expired', async () => {
    const clock = fakeClock(0);
    const locks = createLockManager({ now: clock.now, defaultTtlMs: 1000 });
    await locks.acquire('r', 'a');
    clock.advance(1000);
    expect(await locks.release('r', 'a')).toBe('not-found');
  });
});

describe('createLockManager — renew', () => {
  it('extends the lease for the owner', async () => {
    const clock = fakeClock(0);
    const locks = createLockManager({ now: clock.now, defaultTtlMs: 1000 });
    await locks.acquire('r', 'a');
    clock.advance(500);
    const result = await locks.renew('r', 'a', 2000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lock.expiresAt).toBe(2500);
      expect(result.lock.owner).toBe('a');
    }
  });

  it('ATK-04: forbids renew by another owner', async () => {
    const locks = createLockManager({ now: () => 0 });
    await locks.acquire('r', 'owner-a');
    expect(await locks.renew('r', 'attacker')).toEqual({ ok: false, reason: 'forbidden' });
  });

  it('returns not-found when renewing an absent/expired lock', async () => {
    const locks = createLockManager();
    expect(await locks.renew('missing', 'a')).toEqual({ ok: false, reason: 'not-found' });
  });
});

describe('createLockManager — status', () => {
  it('reflects expiry', async () => {
    const clock = fakeClock(0);
    const locks = createLockManager({ now: clock.now, defaultTtlMs: 1000 });
    await locks.acquire('r', 'a');
    expect(await locks.status('r')).not.toBeNull();
    clock.advance(1000);
    expect(await locks.status('r')).toBeNull();
  });

  it('honours a per-call ttlMs override', async () => {
    const locks = createLockManager({ now: () => 100, defaultTtlMs: 1000 });
    const lock = await locks.acquire('r', 'a', 50);
    expect(lock?.expiresAt).toBe(150);
  });
});
