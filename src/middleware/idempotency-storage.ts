export interface IdempotencyRecord {
  readonly status: number;
  readonly body: string;
  readonly contentType: string;
  readonly bodyHash: string;
}

export interface IdempotencyStorage {
  get(key: string): Promise<IdempotencyRecord | undefined>;
  set(key: string, record: IdempotencyRecord): Promise<void>;
}

export class InMemoryIdempotencyStorage implements IdempotencyStorage {
  private readonly map = new Map<string, IdempotencyRecord>();

  get(key: string): Promise<IdempotencyRecord | undefined> {
    return Promise.resolve(this.map.get(key));
  }

  set(key: string, record: IdempotencyRecord): Promise<void> {
    this.map.set(key, record);
    return Promise.resolve();
  }
}
