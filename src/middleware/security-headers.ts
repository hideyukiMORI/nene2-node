import type { MiddlewareHandler } from 'hono';

export interface SecurityHeadersOptions {
  /** Send `Strict-Transport-Security` when the app is served behind HTTPS (typically production). */
  readonly enableHsts?: boolean;
}

export function securityHeadersMiddleware(options: SecurityHeadersOptions = {}): MiddlewareHandler {
  const enableHsts = options.enableHsts ?? false;

  return async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');
    c.header('Referrer-Policy', 'no-referrer-when-downgrade');
    c.header('Content-Security-Policy', "default-src 'self'");
    if (enableHsts) {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  };
}
