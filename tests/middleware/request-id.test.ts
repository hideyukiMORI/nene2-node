import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { generateRequestId, requestIdMiddleware } from '../../src/middleware/request-id.js';

describe('requestIdMiddleware', () => {
  it('preserves valid incoming request ids', async () => {
    const id = generateRequestId();
    const app = new Hono();
    app.use('*', requestIdMiddleware());
    app.get('/', (c) => c.json({ id: c.get('requestId') }));

    const res = await app.request('http://localhost/', {
      headers: { 'X-Request-Id': id.toUpperCase() },
    });
    expect((await res.json()).id).toBe(id.toLowerCase());
    expect(res.headers.get('X-Request-Id')).toBe(id.toLowerCase());
  });

  it('generates a new id when incoming header is invalid', async () => {
    const app = new Hono();
    app.use('*', requestIdMiddleware());
    app.get('/', (c) => c.json({ id: c.get('requestId') }));

    const res = await app.request('http://localhost/', {
      headers: { 'X-Request-Id': 'not-valid' },
    });
    const body = (await res.json()) as { id: string };
    expect(body.id).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe('generateRequestId', () => {
  it('returns 32 hex chars', () => {
    expect(generateRequestId()).toMatch(/^[a-f0-9]{32}$/);
  });
});
