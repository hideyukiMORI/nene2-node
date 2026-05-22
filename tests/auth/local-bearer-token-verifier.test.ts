import { describe, expect, it } from 'vitest';

import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { TokenVerificationException } from '../../src/auth/token-verification-exception.js';

describe('LocalBearerTokenVerifier', () => {
  const verifier = new LocalBearerTokenVerifier('test-secret');

  it('issues and verifies HS256 JWT claims', () => {
    const token = verifier.issue({ sub: 'user-42', scope: 'read:system' });
    const claims = verifier.verify(token);

    expect(claims['sub']).toBe('user-42');
    expect(claims['scope']).toBe('read:system');
  });

  it('rejects invalid signatures', () => {
    const token = verifier.issue({ sub: 'user-42' });
    const tampered = `${token}x`;

    expect(() => verifier.verify(tampered)).toThrow(TokenVerificationException);
  });

  it('rejects expired tokens', () => {
    const token = verifier.issue({ sub: 'user-42', exp: Math.floor(Date.now() / 1000) - 60 });

    expect(() => verifier.verify(token)).toThrow(/expired/i);
  });
});
