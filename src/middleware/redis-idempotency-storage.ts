import type { IdempotencyRecord, IdempotencyStorage } from './idempotency-storage.js';
import type { RedisKeyValueClient } from './redis-key-value-client.js';

export class RedisIdempotencyStorage implements IdempotencyStorage {
  constructor(
    private readonly client: RedisKeyValueClient,
    private readonly keyPrefix = 'nene2:idem:',
    private readonly ttlSeconds = 86_400,
  ) {}

  async get(key: string): Promise<IdempotencyRecord | undefined> {
    const raw = await this.client.get(`${this.keyPrefix}${key}`);
    if (raw === null) {
      return undefined;
    }
    return JSON.parse(raw) as IdempotencyRecord;
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    await this.client.set(`${this.keyPrefix}${key}`, JSON.stringify(record), {
      EX: this.ttlSeconds,
    });
  }
}
