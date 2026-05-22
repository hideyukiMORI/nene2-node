import type { MiddlewareHandler } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

export function requestSizeLimitMiddleware(
  problems: ProblemDetailsFactory,
  maxBytes: number,
): MiddlewareHandler {
  return async (c, next) => {
    const contentLength = c.req.header('Content-Length');
    if (contentLength !== undefined) {
      const length = Number.parseInt(contentLength, 10);
      if (Number.isFinite(length) && length > maxBytes) {
        return problemDetailsFromContext(
          problems,
          c,
          'payload-too-large',
          'Payload Too Large',
          413,
          'Request body exceeds the configured size limit.',
        );
      }
    }

    await next();
  };
}
