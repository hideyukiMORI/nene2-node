import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { IdempotencyRecord, IdempotencyStorage } from './idempotency-storage.js';

/**
 * File-backed idempotency store for single-host multi-process workers (FT136 F-2 partial).
 */
export class FileIdempotencyStorage implements IdempotencyStorage {
  constructor(private readonly directory: string) {}

  async get(key: string): Promise<IdempotencyRecord | undefined> {
    await mkdir(this.directory, { recursive: true });
    const filePath = join(this.directory, `${encodeURIComponent(key)}.json`);
    try {
      const raw = await readFile(filePath, 'utf8');
      return JSON.parse(raw) as IdempotencyRecord;
    } catch {
      return undefined;
    }
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const filePath = join(this.directory, `${encodeURIComponent(key)}.json`);
    const tmp = `${filePath}.${String(process.pid)}.tmp`;
    await writeFile(tmp, JSON.stringify(record), 'utf8');
    await rename(tmp, filePath);
  }
}
