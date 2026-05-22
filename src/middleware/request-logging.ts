import type { MiddlewareHandler } from 'hono';

export interface RequestLoggingOptions {
  readonly excludePaths?: readonly string[];
  readonly log?: (entry: RequestLogEntry) => void;
}

export interface RequestLogEntry {
  readonly event: 'request.completed';
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly durationMs: number;
}

function defaultLog(entry: RequestLogEntry): void {
  console.info(JSON.stringify(entry));
}

export function requestLoggingMiddleware(options: RequestLoggingOptions = {}): MiddlewareHandler {
  const excludePaths = new Set(options.excludePaths ?? []);
  const log = options.log ?? defaultLog;

  return async (c, next) => {
    if (excludePaths.has(c.req.path)) {
      await next();
      return;
    }

    const start = performance.now();
    await next();
    const durationMs = Math.round((performance.now() - start) * 10) / 10;

    log({
      event: 'request.completed',
      requestId: c.get('requestId'),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    });
  };
}
