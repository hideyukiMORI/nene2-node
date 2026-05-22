import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { TokenVerificationException } from '../../src/auth/token-verification-exception.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { bearerTokenMiddleware } from '../../src/middleware/bearer-token.js';

describe('bearerTokenMiddleware', () => {
  const problems = createProblemDetailsFactory('https://example.com/problems/');

  it('passes OPTIONS without auth', async () => {
    const app = new Hono();
    app.use(
      '*',
      bearerTokenMiddleware(problems, { verifier: undefined, includePaths: ['/secure'] }),
    );
    app.options('/secure', (c) => c.text('ok'));

    const res = await app.request('http://localhost/secure', { method: 'OPTIONS' });
    expect(res.status).toBe(200);
  });

  it('uses excludePaths when includePaths is empty', async () => {
    const verifier = new LocalBearerTokenVerifier('secret');
    const token = verifier.issue({ sub: 'u1' });
    const app = new Hono();
    app.use(
      '*',
      bearerTokenMiddleware(problems, {
        verifier,
        excludePaths: ['/public'],
      }),
    );
    app.get('/public', (c) => c.text('open'));
    app.get('/private', (c) => c.text('secret'));

    expect((await app.request('http://localhost/public')).status).toBe(200);
    const denied = await app.request('http://localhost/private');
    expect(denied.status).toBe(401);
    const ok = await app.request('http://localhost/private', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(ok.status).toBe(200);
  });

  it('rejects missing verifier, malformed Authorization, and empty token', async () => {
    const app = new Hono();
    app.use('*', bearerTokenMiddleware(problems, { verifier: undefined, includePaths: ['/x'] }));
    app.get('/x', (c) => c.text('ok'));

    expect((await app.request('http://localhost/x')).status).toBe(401);
    expect(
      (await app.request('http://localhost/x', { headers: { Authorization: 'Basic x' } })).status,
    ).toBe(401);
    expect(
      (await app.request('http://localhost/x', { headers: { Authorization: 'Bearer ' } })).status,
    ).toBe(401);
  });

  it('returns 500 for non-TokenVerificationException errors', async () => {
    const app = new Hono();
    app.use(
      '*',
      bearerTokenMiddleware(problems, {
        verifier: {
          verify: () => {
            throw new Error('boom');
          },
        },
        includePaths: ['/x'],
      }),
    );
    app.get('/x', (c) => c.text('ok'));
    const res = await app.request('http://localhost/x', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(500);
  });

  it('maps TokenVerificationException to 401', async () => {
    const app = new Hono();
    app.use(
      '*',
      bearerTokenMiddleware(problems, {
        verifier: {
          verify: () => {
            throw new TokenVerificationException('bad');
          },
        },
        includePaths: ['/x'],
      }),
    );
    app.get('/x', (c) => c.text('ok'));
    expect(
      (await app.request('http://localhost/x', { headers: { Authorization: 'Bearer t' } })).status,
    ).toBe(401);
  });
});
