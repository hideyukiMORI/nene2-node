import { randomBytes } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

const HEADER = 'X-Request-Id';

/** 32-char hex request id (parity with NENE2 runtime tests). */
export function generateRequestId(): string {
  return randomBytes(16).toString('hex');
}

export function requestIdMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const incoming = c.req.header(HEADER);
    const id =
      incoming !== undefined && /^[a-f0-9]{32}$/i.test(incoming)
        ? incoming.toLowerCase()
        : generateRequestId();

    c.set('requestId', id);
    c.header(HEADER, id);
    await next();
  };
}
