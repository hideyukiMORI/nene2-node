import type { Context, MiddlewareHandler } from 'hono';

import { TokenVerificationException } from '../auth/token-verification-exception.js';
import type { TokenVerifier } from '../auth/token-verifier.js';
import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

const WWW_AUTHENTICATE = 'Bearer realm="api"';

export interface BearerTokenOptions {
  readonly verifier: TokenVerifier | undefined;
  readonly includePaths?: readonly string[];
  readonly excludePaths?: readonly string[];
}

function pathRequiresBearer(
  path: string,
  includePaths: readonly string[],
  excludePaths: readonly string[],
): boolean {
  if (includePaths.length > 0) {
    return includePaths.some((prefix) => path.startsWith(prefix));
  }
  if (excludePaths.length > 0) {
    return !excludePaths.includes(path);
  }
  return false;
}

function unauthorized(problems: ProblemDetailsFactory, c: Context, detail: string): Response {
  const response = problemDetailsFromContext(
    problems,
    c,
    'unauthorized',
    'Unauthorized',
    401,
    detail,
  );
  response.headers.set('WWW-Authenticate', WWW_AUTHENTICATE);
  return response;
}

export function bearerTokenMiddleware(
  problems: ProblemDetailsFactory,
  options: BearerTokenOptions,
): MiddlewareHandler {
  const includePaths = options.includePaths ?? [];
  const excludePaths = options.excludePaths ?? [];

  return async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      await next();
      return;
    }

    if (!pathRequiresBearer(c.req.path, includePaths, excludePaths)) {
      await next();
      return;
    }

    if (options.verifier === undefined) {
      return unauthorized(
        problems,
        c,
        'Bearer token authentication is required but not configured.',
      );
    }

    const auth = c.req.header('Authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return unauthorized(problems, c, 'A valid Bearer token is required.');
    }

    const token = auth.slice('Bearer '.length).trim();
    if (token === '') {
      return unauthorized(problems, c, 'A valid Bearer token is required.');
    }

    try {
      const claims = await options.verifier.verify(token);
      c.set('authClaims', claims);
      c.set('credentialType', 'bearer');
      await next();
    } catch (error) {
      if (error instanceof TokenVerificationException) {
        return unauthorized(problems, c, 'The provided Bearer token is invalid or expired.');
      }
      throw error;
    }
  };
}
