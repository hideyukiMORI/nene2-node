import type { MiddlewareHandler } from 'hono';

export function securityHeadersMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');
    c.header('Referrer-Policy', 'no-referrer-when-downgrade');
    c.header('Content-Security-Policy', "default-src 'self'");
  };
}
