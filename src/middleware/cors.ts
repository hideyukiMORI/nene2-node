import type { MiddlewareHandler } from 'hono';

export interface CorsOptions {
  readonly allowedOrigins: readonly string[];
  readonly allowedMethods?: readonly string[];
  readonly allowedHeaders?: readonly string[];
  readonly allowCredentials?: boolean;
  readonly maxAgeSeconds?: number;
}

const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'X-Request-Id'] as const;

function isPreflight(
  method: string,
  origin: string | undefined,
  requestMethod: string | undefined,
): boolean {
  return (
    method === 'OPTIONS' &&
    origin !== undefined &&
    origin !== '' &&
    requestMethod !== undefined &&
    requestMethod !== ''
  );
}

export function corsMiddleware(options: CorsOptions): MiddlewareHandler {
  if (options.allowedOrigins.includes('*')) {
    throw new Error(
      'corsMiddleware: do not pass "*" in allowedOrigins. List each allowed origin explicitly.',
    );
  }

  const allowedOrigins = new Set(options.allowedOrigins);
  const allowedMethods = options.allowedMethods ?? DEFAULT_METHODS;
  const allowedHeaders = options.allowedHeaders ?? DEFAULT_HEADERS;
  const allowCredentials = options.allowCredentials ?? false;
  const maxAgeSeconds = options.maxAgeSeconds ?? 3600;

  if (maxAgeSeconds <= 0) {
    throw new Error(`corsMiddleware: maxAgeSeconds must be positive, got ${String(maxAgeSeconds)}`);
  }

  return async (c, next) => {
    const origin = c.req.header('Origin');

    if (allowedOrigins.size === 0) {
      await next();
      return;
    }

    if (isPreflight(c.req.method, origin, c.req.header('Access-Control-Request-Method'))) {
      const response = c.body(null, 204);
      response.headers.set('Vary', 'Origin');
      if (origin !== undefined && allowedOrigins.has(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
        response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
        response.headers.set('Access-Control-Max-Age', String(maxAgeSeconds));
        if (allowCredentials) {
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
      }
      return response;
    }

    await next();

    c.res.headers.set('Vary', 'Origin');
    if (origin !== undefined && origin !== '' && allowedOrigins.has(origin)) {
      c.res.headers.set('Access-Control-Allow-Origin', origin);
      c.res.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
      c.res.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      if (allowCredentials) {
        c.res.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    }
  };
}
