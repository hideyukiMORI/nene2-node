/**
 * Minimal Redis surface for framework adapters (FT141). Wire via `wrapNodeRedisClient`.
 */
export interface RedisKeyValueClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

export interface NodeRedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string | null | undefined>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean | number>;
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
  };
}
