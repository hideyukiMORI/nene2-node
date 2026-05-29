/** Outcome of a release attempt. */
export type ReleaseResult = 'released' | 'not-found' | 'forbidden';

export interface LockRecord {
  readonly resource: string;
  readonly owner: string;
  /** Epoch ms after which the lock is expired and re-acquirable by anyone. */
  readonly expiresAt: number;
  /** Epoch ms the lock was (last) acquired. */
  readonly acquiredAt: number;
}

/** Outcome of a renew attempt. */
export type RenewResult =
  | { readonly ok: true; readonly lock: LockRecord }
  | { readonly ok: false; readonly reason: 'not-found' | 'forbidden' };

/**
 * Persistence for {@link LockManager}. The **acquire path is atomic**
 * ({@link LockStorage.putIfAbsent}); this is what makes distributed mutual
 * exclusion safe. A single-process {@link InMemoryLockStorage} ships here;
 * `RedisLockStorage` implements the same contract with `SET … NX` so the lock
 * works across instances. Storage owns expiry: `get`/`putIfAbsent` treat an
 * expired record as absent (`ttlMs` lets a backend set a native TTL).
 */
export interface LockStorage {
  /** Current live record for `resource`, or `undefined` if absent or expired. */
  get(resource: string): Promise<LockRecord | undefined>;
  /** Atomically store `record` iff no live lock exists. Returns `true` if stored. */
  putIfAbsent(record: LockRecord, ttlMs: number): Promise<boolean>;
  /** Unconditionally store `record` (owner-verified re-acquire / renew). */
  put(record: LockRecord, ttlMs: number): Promise<void>;
  /** Remove `resource`. */
  delete(resource: string): Promise<void>;
}

export class InMemoryLockStorage implements LockStorage {
  private readonly map = new Map<string, LockRecord>();

  /** @param now injectable clock (epoch ms) for deterministic expiry. */
  constructor(private readonly now: () => number = Date.now) {}

  private live(record: LockRecord | undefined): LockRecord | undefined {
    if (record === undefined || this.now() >= record.expiresAt) {
      return undefined;
    }
    return record;
  }

  get(resource: string): Promise<LockRecord | undefined> {
    return Promise.resolve(this.live(this.map.get(resource)));
  }

  putIfAbsent(record: LockRecord): Promise<boolean> {
    if (this.live(this.map.get(record.resource)) !== undefined) {
      return Promise.resolve(false);
    }
    this.map.set(record.resource, record);
    return Promise.resolve(true);
  }

  put(record: LockRecord): Promise<void> {
    this.map.set(record.resource, record);
    return Promise.resolve();
  }

  delete(resource: string): Promise<void> {
    this.map.delete(resource);
    return Promise.resolve();
  }
}

export interface LockManagerOptions {
  /** Lock store. Defaults to a process-local {@link InMemoryLockStorage}. */
  readonly storage?: LockStorage;
  /** Default lease duration in ms when `ttlMs` is omitted. Default 30000. */
  readonly defaultTtlMs?: number;
  /** Injectable clock (epoch ms). Default `Date.now`. */
  readonly now?: () => number;
}

export interface LockManager {
  /**
   * Acquire `resource` for `owner`. Returns the lock on success, or `null` when
   * it is held by a *different* owner and not yet expired (not an error —
   * retry later). Mutual exclusion is guaranteed by the storage's atomic
   * `putIfAbsent`; an expired lock, or one already held by `owner`, is
   * (re-)acquired.
   */
  acquire(resource: string, owner: string, ttlMs?: number): Promise<LockRecord | null>;
  /** Release `resource`. Only the owner may release (mismatch → `forbidden`). */
  release(resource: string, owner: string): Promise<ReleaseResult>;
  /** Extend the lease. Only the owner may renew (mismatch → `forbidden`). */
  renew(resource: string, owner: string, ttlMs?: number): Promise<RenewResult>;
  /** Current lock, or `null` when absent or expired. */
  status(resource: string): Promise<LockRecord | null>;
}

const DEFAULT_TTL_MS = 30_000;

/**
 * Leased distributed lock with owner verification and TTL expiry (PHP parity:
 * FT288). Exclusive access to a named resource; locks auto-expire so a crashed
 * holder does not block forever.
 *
 * Mutual exclusion is enforced by the storage's atomic acquire, so the lock is
 * safe across instances when backed by a shared atomic store
 * (`new RedisLockStorage(client)`). The default {@link InMemoryLockStorage} is
 * process-local.
 *
 * @example
 *   const locks = createLockManager({ storage: new RedisLockStorage(redis) });
 *   const lock = await locks.acquire('payment:42', workerId, 10_000);
 *   if (lock === null) return; // held elsewhere — retry later
 *   try { await doWork(); } finally { await locks.release('payment:42', workerId); }
 */
export function createLockManager(options: LockManagerOptions = {}): LockManager {
  const now = options.now ?? Date.now;
  const storage = options.storage ?? new InMemoryLockStorage(now);
  const defaultTtlMs = options.defaultTtlMs ?? DEFAULT_TTL_MS;

  return {
    async acquire(resource, owner, ttlMs = defaultTtlMs): Promise<LockRecord | null> {
      const at = now();
      const record: LockRecord = { resource, owner, acquiredAt: at, expiresAt: at + ttlMs };

      if (await storage.putIfAbsent(record, ttlMs)) {
        return record; // won the lock atomically
      }

      const existing = await storage.get(resource);
      if (existing === undefined) {
        // Expired/released between the attempt and the read — one retry.
        return (await storage.putIfAbsent(record, ttlMs)) ? record : null;
      }
      if (existing.owner === owner) {
        await storage.put(record, ttlMs); // same owner — re-acquire / extend
        return record;
      }
      return null; // held by another, still live
    },

    async release(resource, owner): Promise<ReleaseResult> {
      const existing = await storage.get(resource);
      if (existing === undefined) {
        return 'not-found';
      }
      if (existing.owner !== owner) {
        return 'forbidden';
      }
      await storage.delete(resource);
      return 'released';
    },

    async renew(resource, owner, ttlMs = defaultTtlMs): Promise<RenewResult> {
      const existing = await storage.get(resource);
      if (existing === undefined) {
        return { ok: false, reason: 'not-found' };
      }
      if (existing.owner !== owner) {
        return { ok: false, reason: 'forbidden' };
      }
      const lock: LockRecord = { ...existing, expiresAt: now() + ttlMs };
      await storage.put(lock, ttlMs);
      return { ok: true, lock };
    },

    async status(resource): Promise<LockRecord | null> {
      return (await storage.get(resource)) ?? null;
    },
  };
}
