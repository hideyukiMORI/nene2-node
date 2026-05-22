import type { RateLimitHit, RateLimitHitResult, RateLimitStorage } from './rate-limit-storage.js';
import type { RedisKeyValueClient } from './redis-key-value-client.js';

export class RedisRateLimitStorage implements RateLimitStorage {
  constructor(
    private readonly client: RedisKeyValueClient,
    private readonly keyPrefix = 'nene2:rl:',
  ) {}

  hit(key: string, windowSeconds: number): RateLimitHit {
    return this.hitAsync(key, windowSeconds);
  }

  private async hitAsync(key: string, windowSeconds: number): Promise<RateLimitHitResult> {
    const redisKey = `${this.keyPrefix}${key}`;
    const count = await this.client.incr(redisKey);
    if (count === 1) {
      await this.client.expire(redisKey, windowSeconds);
    }
    const now = Math.floor(Date.now() / 1000);
    return { count, resetAt: now + windowSeconds };
  }
}
