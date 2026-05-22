import {
  wrapNodeRedisClient,
  type NodeRedisLikeClient,
  type RedisKeyValueClient,
} from './redis-key-value-client.js';

/**
 * Connect a `redis` npm client from URL. Requires optional peer dependency `redis`.
 */
export async function createRedisKeyValueClientFromUrl(url: string): Promise<RedisKeyValueClient> {
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url }) as NodeRedisLikeClient & {
      connect(): Promise<unknown>;
    };
    await client.connect();
    return wrapNodeRedisClient(client);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Cannot find') || error.message.includes('Cannot resolve'))
    ) {
      throw new Error('Redis storage requires peer dependency `redis`. Install: npm install redis');
    }
    throw error;
  }
}
