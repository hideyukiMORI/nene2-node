import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('GET /examples/protected', () => {
  it('returns 401 without Bearer token', async () => {
    const { app } = createApp({
      settings: loadAppSettings({
        NODE_ENV: 'test',
        NENE2_NODE_APP_ENV: 'test',
        NENE2_LOCAL_JWT_SECRET: 'secret',
      }),
    });

    const response = await app.request('http://localhost/examples/protected');

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toBe('Bearer realm="api"');
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
  });

  it('returns JWT claims when Bearer token is valid', async () => {
    const verifier = new LocalBearerTokenVerifier('secret');
    const token = verifier.issue({ sub: 'user-42', scope: 'read:system' });

    const { app } = createApp({
      settings: loadAppSettings({
        NODE_ENV: 'test',
        NENE2_NODE_APP_ENV: 'test',
        NENE2_LOCAL_JWT_SECRET: 'secret',
      }),
      tokenVerifier: verifier,
    });

    const response = await app.request('http://localhost/examples/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await jsonBody<{ message: string; claims: { sub: string; scope: string } }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(body.message).toBe('Welcome, authenticated user.');
    expect(body.claims.sub).toBe('user-42');
    expect(body.claims.scope).toBe('read:system');
  });

  it('returns 401 when JWT secret is not configured', async () => {
    const { app } = createApp({
      settings: loadAppSettings({
        NODE_ENV: 'test',
        NENE2_NODE_APP_ENV: 'test',
      }),
    });

    const response = await app.request('http://localhost/examples/protected', {
      headers: { Authorization: 'Bearer any-token' },
    });

    expect(response.status).toBe(401);
  });
});
