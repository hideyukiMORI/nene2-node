import { describe, expect, it } from 'vitest';

import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { TokenVerificationException } from '../../src/auth/token-verification-exception.js';

describe('LocalBearerTokenVerifier', () => {
  const verifier = new LocalBearerTokenVerifier('test-secret');

  it('issues and verifies HS256 JWT claims', async () => {
    const token = verifier.issue({ sub: 'user-42', scope: 'read:system' });
    const claims = await verifier.verify(token);

    expect(claims['sub']).toBe('user-42');
    expect(claims['scope']).toBe('read:system');
  });

  it('rejects invalid signatures', async () => {
    const token = verifier.issue({ sub: 'user-42' });
    const tampered = `${token}x`;

    await expect(verifier.verify(tampered)).rejects.toBeInstanceOf(TokenVerificationException);
  });

  it('rejects expired tokens', async () => {
    const token = verifier.issue({ sub: 'user-42', exp: Math.floor(Date.now() / 1000) - 60 });

    await expect(verifier.verify(token)).rejects.toThrow(/expired/i);
  });
});
