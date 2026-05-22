import { describe, expect, it } from 'vitest';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

import { createJoseJwtVerifier } from '../../src/auth/jose-jwt-verifier.js';
import { TokenVerificationException } from '../../src/auth/token-verification-exception.js';
import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

describe('createJoseJwtVerifier', () => {
  it('verifies RS256 tokens against a local JWKS', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    const verifier = await createJoseJwtVerifier({
      jwks: { keys: [{ ...jwk, kid: 'test-key', alg: 'RS256' }] },
      issuer: 'https://issuer.test',
      audience: 'api.test',
    });

    const token = await new SignJWT({ sub: 'user-1' })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer('https://issuer.test')
      .setAudience('api.test')
      .setExpirationTime('2h')
      .sign(privateKey);

    const claims = await verifier.verify(token);
    expect(claims.sub).toBe('user-1');
  });

  it('integrates with bearer middleware via createApp', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    const tokenVerifier = await createJoseJwtVerifier({
      jwks: { keys: [{ ...jwk, kid: 'prod-key', alg: 'RS256' }] },
    });
    const token = await new SignJWT({ sub: 'prod-user' })
      .setProtectedHeader({ alg: 'RS256', kid: 'prod-key' })
      .setExpirationTime('1h')
      .sign(privateKey);

    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const { app } = await createApp({
      settings,
      tokenVerifier,
      bearerIncludePaths: ['/api/me'],
    });
    app.get('/api/me', (c) => c.json({ sub: c.get('authClaims')?.sub }));

    const ok = await app.request('http://localhost/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(ok.status).toBe(200);
    expect((await ok.json()).sub).toBe('prod-user');
  });

  it('throws when jwksUri and jwks are both missing', async () => {
    await expect(createJoseJwtVerifier({})).rejects.toThrow('jwksUri or jwks');
  });

  it('throws TokenVerificationException for invalid tokens', async () => {
    const { publicKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    const verifier = await createJoseJwtVerifier({
      jwks: { keys: [{ ...jwk, kid: 'k', alg: 'RS256' }] },
    });
    await expect(verifier.verify('not-a-jwt')).rejects.toBeInstanceOf(TokenVerificationException);
  });
});
