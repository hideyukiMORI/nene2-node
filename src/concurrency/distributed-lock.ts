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
 * Persistence for {@link LockManager}. Mirrors the house adapter style
 * (Promise-based, like idempotency / rate-limit storage). A single-process
 * `InMemoryLockStorage` ships here; a Redis adapter (`SET NX PX` for atomic
 * acquire) can implement the same interface for multi-instance deployments.
 */
export interface LockStorage {
  get(resource: string): Promise<LockRecord | undefined>;
  set(record: LockRecord): Promise<void>;
  delete(resource: string): Promise<void>;
}

export class InMemoryLockStorage implements LockStorage {
  private readonly map = new Map<string, LockRecord>();

  get(resource: string): Promise<LockRecord | undefined> {
    return Promise.resolve(this.map.get(resource));
  }

  set(record: LockRecord): Promise<void> {
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
   * retry later). An expired lock, or one already held by `owner`, is
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
 * The default store is process-local. For true cross-instance mutual exclusion,
 * supply a shared {@link LockStorage} whose `acquire` path is atomic (e.g. Redis
 * `SET NX PX`); with the in-memory store, concurrency is bounded to one process.
 *
 * @example
 *   const locks = createLockManager();
 *   const lock = await locks.acquire('payment:42', workerId, 10_000);
 *   if (lock === null) return; // held elsewhere — retry later
 *   try { await doWork(); } finally { await locks.release('payment:42', workerId); }
 */
export function createLockManager(options: LockManagerOptions = {}): LockManager {
  const storage = options.storage ?? new InMemoryLockStorage();
  const defaultTtlMs = options.defaultTtlMs ?? DEFAULT_TTL_MS;
  const now = options.now ?? Date.now;

  const isExpired = (lock: LockRecord, at: number): boolean => at >= lock.expiresAt;

  return {
    async acquire(resource, owner, ttlMs = defaultTtlMs): Promise<LockRecord | null> {
      const at = now();
      const existing = await storage.get(resource);

      if (existing !== undefined && !isExpired(existing, at) && existing.owner !== owner) {
        return null; // held by another owner, still valid
      }

      const record: LockRecord = {
        resource,
        owner,
        acquiredAt: at,
        expiresAt: at + ttlMs,
      };
      await storage.set(record);
      return record;
    },

    async release(resource, owner): Promise<ReleaseResult> {
      const at = now();
      const existing = await storage.get(resource);

      if (existing === undefined || isExpired(existing, at)) {
        return 'not-found';
      }
      if (existing.owner !== owner) {
        return 'forbidden';
      }
      await storage.delete(resource);
      return 'released';
    },

    async renew(resource, owner, ttlMs = defaultTtlMs): Promise<RenewResult> {
      const at = now();
      const existing = await storage.get(resource);

      if (existing === undefined || isExpired(existing, at)) {
        return { ok: false, reason: 'not-found' };
      }
      if (existing.owner !== owner) {
        return { ok: false, reason: 'forbidden' };
      }
      const lock: LockRecord = { ...existing, expiresAt: at + ttlMs };
      await storage.set(lock);
      return { ok: true, lock };
    },

    async status(resource): Promise<LockRecord | null> {
      const existing = await storage.get(resource);
      if (existing === undefined || isExpired(existing, now())) {
        return null;
      }
      return existing;
    },
  };
}
