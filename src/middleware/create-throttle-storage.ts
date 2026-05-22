import { FileRateLimitStorage } from './file-rate-limit-storage.js';
import { InMemoryRateLimitStorage, type RateLimitStorage } from './rate-limit-storage.js';

export type ThrottleStorageKind = 'memory' | 'file';

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
  return new InMemoryRateLimitStorage();
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
