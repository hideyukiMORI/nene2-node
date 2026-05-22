import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, afterEach } from 'vitest';

import { FileIdempotencyStorage } from '../../src/middleware/file-idempotency-storage.js';

describe('FileIdempotencyStorage', () => {
  let dir = '';

  afterEach(async () => {
    if (dir !== '') {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('shares records across instances', async () => {
    dir = await mkdtemp(join(tmpdir(), 'nene2-idem-'));
    const a = new FileIdempotencyStorage(dir);
    const b = new FileIdempotencyStorage(dir);
    await a.set('k1', {
      status: 201,
      body: '{"ok":true}',
      contentType: 'application/json',
      bodyHash: '0',
    });
    const hit = await b.get('k1');
    expect(hit?.status).toBe(201);
  });
});
