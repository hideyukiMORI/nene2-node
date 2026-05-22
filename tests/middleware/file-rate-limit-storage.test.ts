import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, afterEach } from 'vitest';

import { FileRateLimitStorage } from '../../src/middleware/file-rate-limit-storage.js';

describe('FileRateLimitStorage', () => {
  let dir = '';

  afterEach(async () => {
    if (dir !== '') {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('persists counts across instances', async () => {
    dir = await mkdtemp(join(tmpdir(), 'nene2-rl-'));
    const a = new FileRateLimitStorage(dir);
    const b = new FileRateLimitStorage(dir);
    const first = await a.hit('user:1', 60);
    expect(first.count).toBe(1);
    const second = await b.hit('user:1', 60);
    expect(second.count).toBe(2);
  });
});
