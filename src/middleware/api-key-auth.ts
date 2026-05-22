import { timingSafeEqual } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

const DEFAULT_HEADER = 'X-NENE2-API-Key';

export interface ApiKeyAuthOptions {
  readonly expectedKey: string | undefined;
  readonly protectedPaths: readonly string[];
  readonly headerName?: string;
}

function keysMatch(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

function pathRequiresAuth(path: string, protectedPaths: readonly string[]): boolean {
  return protectedPaths.some((protectedPath) => path === protectedPath);
}

export function apiKeyAuthMiddleware(
  problems: ProblemDetailsFactory,
  options: ApiKeyAuthOptions,
): MiddlewareHandler {
  const headerName = options.headerName ?? DEFAULT_HEADER;

  return async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      await next();
      return;
    }

    if (!pathRequiresAuth(c.req.path, options.protectedPaths)) {
      await next();
      return;
    }

    if (options.expectedKey === undefined) {
      return problemDetailsFromContext(
        problems,
        c,
        'unauthorized',
        'Unauthorized',
        401,
        'API key authentication is required.',
      );
    }

    const provided = c.req.header(headerName) ?? '';
    if (provided === '' || !keysMatch(options.expectedKey, provided)) {
      return problemDetailsFromContext(
        problems,
        c,
        'unauthorized',
        'Unauthorized',
        401,
        'The provided API key is missing or invalid.',
      );
    }

    c.set('credentialType', 'api_key');
    await next();
  };
}
