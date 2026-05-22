import type { MiddlewareHandler } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';
import { InMemoryIdempotencyStorage, type IdempotencyStorage } from './idempotency-storage.js';

const DEFAULT_METHODS = ['POST', 'PUT', 'PATCH'] as const;

export interface IdempotencyOptions {
  readonly storage?: IdempotencyStorage;
  readonly methods?: readonly string[];
  /** Reject when the same key is reused with a different request body hash. */
  readonly requireBodyMatch?: boolean;
}

export function requestBodyHash(body: string): string {
  let hash = 0;
  for (let i = 0; i < body.length; i += 1) {
    hash = (hash * 31 + body.charCodeAt(i)) | 0;
  }
  return String(hash);
}

export function idempotencyMiddleware(
  problems: ProblemDetailsFactory,
  options: IdempotencyOptions = {},
): MiddlewareHandler {
  const storage = options.storage ?? new InMemoryIdempotencyStorage();
  const methods = new Set((options.methods ?? DEFAULT_METHODS).map((m) => m.toUpperCase()));
  const requireBodyMatch = options.requireBodyMatch ?? true;

  return async (c, next) => {
    if (!methods.has(c.req.method)) {
      await next();
      return;
    }

    const key = c.req.header('Idempotency-Key')?.trim();
    if (key === undefined || key === '') {
      await next();
      return;
    }

    if (key.length > 128) {
      return problemDetailsFromContext(
        problems,
        c,
        'validation-failed',
        'Validation Failed',
        422,
        'Idempotency-Key must be at most 128 characters.',
      );
    }

    const bodyText = await c.req.raw.clone().text();
    const bodyHash = requestBodyHash(bodyText);
    const cacheKey = `${c.req.method}:${c.req.path}:${key}`;

    const cached = await storage.get(cacheKey);
    if (cached !== undefined) {
      if (requireBodyMatch && cached.bodyHash !== bodyHash) {
        return problemDetailsFromContext(
          problems,
          c,
          'conflict',
          'Conflict',
          409,
          'Idempotency-Key was already used with a different request body.',
        );
      }
      return new Response(cached.body, {
        status: cached.status,
        headers: { 'Content-Type': cached.contentType, 'X-Idempotent-Replay': 'true' },
      });
    }

    await next();

    const response = c.res;
    const cloned = response.clone();
    const replayBody = await cloned.text();
    const contentType = cloned.headers.get('Content-Type') ?? 'application/json';
    await storage.set(cacheKey, {
      status: cloned.status,
      body: replayBody,
      contentType,
      bodyHash,
    });
    response.headers.set('X-Idempotent-Replay', 'false');
  };
}
