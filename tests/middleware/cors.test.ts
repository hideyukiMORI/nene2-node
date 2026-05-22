import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { corsMiddleware } from '../../src/middleware/cors.js';

describe('corsMiddleware', () => {
  it('handles preflight for allowed origin', async () => {
    const app = new Hono();
    app.use('*', corsMiddleware({ allowedOrigins: ['https://app.example.com'] }));
    app.get('/data', (c) => c.json({ ok: true }));

    const response = await app.request('http://localhost/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://app.example.com',
        'Access-Control-Request-Method': 'GET',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });

  it('adds CORS headers to actual responses', async () => {
    const app = new Hono();
    app.use('*', corsMiddleware({ allowedOrigins: ['https://app.example.com'] }));
    app.get('/data', (c) => c.json({ ok: true }));

    const response = await app.request('http://localhost/data', {
      headers: { Origin: 'https://app.example.com' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });
});
