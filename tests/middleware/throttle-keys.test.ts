import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { jwtSubThrottleKey } from '../../src/middleware/throttle-keys.js';

describe('throttle key extractors', () => {
  it('jwtSubThrottleKey prefers sub over IP', async () => {
    const app = new Hono();
    app.get('/t', (c) => {
      c.set('authClaims', { sub: 'user-99' });
      return c.json({ key: jwtSubThrottleKey(c) });
    });
    const res = await app.request('http://localhost/t', {
      headers: { 'X-Forwarded-For': '203.0.113.1' },
    });
    const body = (await res.json()) as { key: string };
    expect(body.key).toBe('sub:user-99');
  });

  it('jwtSubThrottleKey falls back to IP without auth', async () => {
    const app = new Hono();
    app.get('/t', (c) => c.json({ key: jwtSubThrottleKey(c) }));
    const res = await app.request('http://localhost/t', {
      headers: { 'X-Forwarded-For': '203.0.113.2' },
    });
    const body = (await res.json()) as { key: string };
    expect(body.key).toBe('ip:203.0.113.2');
  });
});
