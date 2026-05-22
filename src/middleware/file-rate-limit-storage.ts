import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RateLimitHitResult, RateLimitStorage } from './rate-limit-storage.js';

interface StoredWindow {
  readonly count: number;
  readonly resetAt: number;
}

/**
 * File-backed throttle storage for single-host multi-process deployments.
 * Not a substitute for Redis in true multi-node clusters (FT95).
 */
export class FileRateLimitStorage implements RateLimitStorage {
  constructor(private readonly directory: string) {}

  hit(key: string, windowSeconds: number): Promise<RateLimitHitResult> {
    return this.hitAsync(key, windowSeconds);
  }

  private async hitAsync(key: string, windowSeconds: number): Promise<RateLimitHitResult> {
    await mkdir(this.directory, { recursive: true });
    const filePath = join(this.directory, `${encodeURIComponent(key)}.json`);
    const now = Math.floor(Date.now() / 1000);

    let existing: StoredWindow | undefined;
    try {
      const raw = await readFile(filePath, 'utf8');
      existing = JSON.parse(raw) as StoredWindow;
    } catch {
      existing = undefined;
    }

    if (existing === undefined || existing.resetAt <= now) {
      const next: StoredWindow = { count: 1, resetAt: now + windowSeconds };
      await this.writeAtomic(filePath, next);
      return next;
    }

    const next: StoredWindow = { count: existing.count + 1, resetAt: existing.resetAt };
    await this.writeAtomic(filePath, next);
    return next;
  }

  private async writeAtomic(filePath: string, value: StoredWindow): Promise<void> {
    const tmp = `${filePath}.${String(process.pid)}.tmp`;
    await writeFile(tmp, JSON.stringify(value), 'utf8');
    await rename(tmp, filePath);
  }
}
