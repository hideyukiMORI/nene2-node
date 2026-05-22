import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

describe('createApp bearerIncludePaths', () => {
  it('protects custom path prefixes', async () => {
    const verifier = new LocalBearerTokenVerifier('secret');
    const token = verifier.issue({ sub: 'biz-1' });
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_LOCAL_JWT_SECRET: 'secret',
    });
    const nene2 = await createApp({
      settings,
      tokenVerifier: verifier,
      bearerIncludePaths: ['/orders'],
    });
    nene2.app.get('/orders/demo', (c) => c.json({ ok: true }, 200));

    const without = await nene2.app.request('http://localhost/orders/demo');
    expect(without.status).toBe(401);

    const withToken = await nene2.app.request('http://localhost/orders/demo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(withToken.status).toBe(200);
  });
});
