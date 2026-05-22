import { createRedisKeyValueClientFromUrl } from './create-redis-client.js';
import { FileRateLimitStorage } from './file-rate-limit-storage.js';
import { InMemoryRateLimitStorage, type RateLimitStorage } from './rate-limit-storage.js';
import { RedisRateLimitStorage } from './redis-rate-limit-storage.js';

export type ThrottleStorageKind = 'memory' | 'file' | 'redis';

export interface CreateThrottleStorageOptions {
  readonly kind?: ThrottleStorageKind;
  readonly fileDirectory?: string;
}

/**
 * Factory for throttle storage (FT140). Redis remains app-owned (FT95).
 */
export function createThrottleStorage(
  options: CreateThrottleStorageOptions = {},
): RateLimitStorage {
  const kind = options.kind ?? 'memory';
  if (kind === 'file') {
    const dir = options.fileDirectory ?? '/tmp/nene2-ratelimit';
    return new FileRateLimitStorage(dir);
  }
  if (kind === 'redis') {
    throw new Error(
      'Redis throttle storage is async — use createThrottleStorageFromEnvAsync() or pass RedisRateLimitStorage manually.',
    );
  }
  return new InMemoryRateLimitStorage();
}

export async function createThrottleStorageFromEnvAsync(
  env: NodeJS.ProcessEnv = process.env,
): Promise<RateLimitStorage> {
  const kind = env['NENE2_NODE_THROTTLE_STORAGE']?.trim().toLowerCase();
  if (kind === 'redis') {
    const url = env['NENE2_NODE_REDIS_URL']?.trim();
    if (url === undefined || url === '') {
      throw new Error('NENE2_NODE_REDIS_URL is required when NENE2_NODE_THROTTLE_STORAGE=redis.');
    }
    const client = await createRedisKeyValueClientFromUrl(url);
    return new RedisRateLimitStorage(client);
  }
  return createThrottleStorageFromEnv(env);
}

export function createThrottleStorageFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): RateLimitStorage {
  const kind = env['NENE2_NODE_THROTTLE_STORAGE']?.trim().toLowerCase();
  if (kind === 'file') {
    const fileDirectory = env['NENE2_NODE_THROTTLE_STORAGE_DIR']?.trim();
    return createThrottleStorage(
      fileDirectory !== undefined && fileDirectory !== ''
        ? { kind: 'file', fileDirectory }
        : { kind: 'file' },
    );
  }
  return createThrottleStorage({ kind: 'memory' });
}
