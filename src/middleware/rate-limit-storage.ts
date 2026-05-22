export interface RateLimitHitResult {
  readonly count: number;
  readonly resetAt: number;
}

export type RateLimitHit = RateLimitHitResult | Promise<RateLimitHitResult>;

export interface RateLimitStorage {
  hit(key: string, windowSeconds: number): RateLimitHit;
}

export class InMemoryRateLimitStorage implements RateLimitStorage {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, windowSeconds: number): RateLimitHitResult {
    const now = Math.floor(Date.now() / 1000);
    const existing = this.store.get(key);

    if (existing === undefined || existing.resetAt <= now) {
      const resetAt = now + windowSeconds;
      this.store.set(key, { count: 1, resetAt });
      return { count: 1, resetAt };
    }

    const next = { count: existing.count + 1, resetAt: existing.resetAt };
    this.store.set(key, next);
    return next;
  }
}
