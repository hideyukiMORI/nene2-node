/**
 * Minimal Redis surface for framework adapters (FT141). Wire via `wrapNodeRedisClient`.
 */
export interface RedisKeyValueClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  /** Delete a key. */
  del(key: string): Promise<void>;
  /**
   * Atomically set `key` to `value` only if it does not already exist
   * (`SET key value NX [EX seconds]`). Returns `true` when the key was set —
   * the building block for distributed-lock acquire.
   */
  setIfAbsent(key: string, value: string, options?: { EX?: number }): Promise<boolean>;
}

export interface NodeRedisLikeClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: { EX?: number; NX?: boolean },
  ): Promise<string | null | undefined>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean | number>;
  del(key: string): Promise<number>;
}

export function wrapNodeRedisClient(client: NodeRedisLikeClient): RedisKeyValueClient {
  return {
    get: (key) => client.get(key),
    set: async (key, value, options) => {
      await client.set(key, value, options);
    },
    incr: (key) => client.incr(key),
    expire: async (key, seconds) => {
      await client.expire(key, seconds);
    },
    del: async (key) => {
      await client.del(key);
    },
    setIfAbsent: async (key, value, options) => {
      // node-redis returns 'OK' when set, null when NX prevented the write.
      const result = await client.set(key, value, { ...options, NX: true });
      return result !== null && result !== undefined;
    },
  };
}
