import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createThrottleStorage,
  createThrottleStorageFromEnv,
  createThrottleStorageFromEnvAsync,
} from '../../src/middleware/create-throttle-storage.js';
import { FileRateLimitStorage } from '../../src/middleware/file-rate-limit-storage.js';
import { InMemoryRateLimitStorage } from '../../src/middleware/rate-limit-storage.js';

describe('createThrottleStorage', () => {
  it('defaults to in-memory storage', () => {
    expect(createThrottleStorage()).toBeInstanceOf(InMemoryRateLimitStorage);
  });

  it('creates file storage and rejects sync redis kind', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nene2-throttle-'));
    expect(createThrottleStorage({ kind: 'file', fileDirectory: dir })).toBeInstanceOf(
      FileRateLimitStorage,
    );
    expect(() => createThrottleStorage({ kind: 'redis' })).toThrow(/async/);
  });
});

describe('createThrottleStorageFromEnv', () => {
  it('reads file kind from env', () => {
    const storage = createThrottleStorageFromEnv({
      NENE2_NODE_THROTTLE_STORAGE: 'file',
      NENE2_NODE_THROTTLE_STORAGE_DIR: '/tmp/nene2-test-rl',
    });
    expect(storage).toBeInstanceOf(FileRateLimitStorage);
  });
});

describe('createThrottleStorageFromEnvAsync', () => {
  it('requires redis URL when storage kind is redis', async () => {
    await expect(
      createThrottleStorageFromEnvAsync({
        NENE2_NODE_THROTTLE_STORAGE: 'redis',
      }),
    ).rejects.toThrow('NENE2_NODE_REDIS_URL');
  });
});
