import type { Context, MiddlewareHandler } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';
import type { RateLimitStorage } from './rate-limit-storage.js';
import { InMemoryRateLimitStorage } from './rate-limit-storage.js';
import { ipThrottleKey } from './throttle-keys.js';

export interface ThrottleOptions {
  readonly limit: number;
  readonly windowSeconds: number;
  readonly storage?: RateLimitStorage;
  readonly excludePaths?: readonly string[];
  readonly keyExtractor?: (c: Context) => string;
}

function applyRateHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetAt: number,
): void {
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(resetAt));
}

export function throttleMiddleware(
  problems: ProblemDetailsFactory,
  options: ThrottleOptions,
): MiddlewareHandler {
  const storage = options.storage ?? new InMemoryRateLimitStorage();
  const excludePaths = new Set(options.excludePaths ?? []);
  const keyExtractor = options.keyExtractor ?? ipThrottleKey;

  return async (c, next) => {
    if (excludePaths.has(c.req.path)) {
      await next();
      return;
    }

    const key = keyExtractor(c);
    const { count, resetAt } = storage.hit(key, options.windowSeconds);
    const remaining = Math.max(0, options.limit - count);
    const retryAfter = Math.max(0, resetAt - Math.floor(Date.now() / 1000));

    if (count > options.limit) {
      const response = problemDetailsFromContext(
        problems,
        c,
        'too-many-requests',
        'Too Many Requests',
        429,
        `Rate limit of ${String(options.limit)} requests per ${String(options.windowSeconds)} seconds exceeded. Try again in ${String(retryAfter)} seconds.`,
      );
      response.headers.set('Retry-After', String(retryAfter));
      applyRateHeaders(response, options.limit, 0, resetAt);
      return response;
    }

    await next();

    applyRateHeaders(c.res, options.limit, remaining, resetAt);
  };
}
