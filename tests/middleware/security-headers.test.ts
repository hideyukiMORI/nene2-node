import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { securityHeadersMiddleware } from '../../src/middleware/security-headers.js';

describe('securityHeadersMiddleware', () => {
  it('sets baseline headers without HSTS by default', async () => {
    const app = new Hono();
    app.use('*', securityHeadersMiddleware());
    app.get('/', (c) => c.text('ok'));

    const response = await app.request('http://localhost/');

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'");
    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('sets HSTS when enableHsts is true', async () => {
    const app = new Hono();
    app.use('*', securityHeadersMiddleware({ enableHsts: true }));
    app.get('/', (c) => c.text('ok'));

    const response = await app.request('http://localhost/');

    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains',
    );
  });
});
