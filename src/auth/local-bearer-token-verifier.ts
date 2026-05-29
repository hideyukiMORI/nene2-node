import { createHmac, timingSafeEqual } from 'node:crypto';

import { TokenVerificationException } from './token-verification-exception.js';
import type { TokenVerifier } from './token-verifier.js';

function base64UrlEncode(data: Buffer | string): string {
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buffer.toString('base64url');
}

function decodeJsonSegment(segment: string): Record<string, unknown> {
  let json: string;
  try {
    json = Buffer.from(segment, 'base64url').toString('utf8');
  } catch {
    throw new TokenVerificationException('Token segment has invalid base64url encoding.');
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(json) as unknown;
  } catch {
    throw new TokenVerificationException('Token segment has invalid JSON.');
  }

  if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded)) {
    throw new TokenVerificationException('Token segment must be a JSON object.');
  }

  return decoded as Record<string, unknown>;
}

/**
 * HMAC-HS256 JWT verifier and issuer for local development and testing.
 * Production deployments should use a library-backed verifier against a real IdP.
 */
export class LocalBearerTokenVerifier implements TokenVerifier {
  constructor(private readonly secret: string) {}

  verify(token: string): Promise<Readonly<Record<string, unknown>>> {
    // Synchronous work, but the TokenVerifier contract is Promise-based (0.2.0,
    // ADR 0005); wrap so verification errors surface as rejections.
    return Promise.resolve().then(() => this.verifyClaims(token));
  }

  private verifyClaims(token: string): Readonly<Record<string, unknown>> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new TokenVerificationException(
        'Token format is invalid: expected three dot-separated segments.',
      );
    }

    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const sigB64 = parts[2];
    if (headerB64 === undefined || payloadB64 === undefined || sigB64 === undefined) {
      throw new TokenVerificationException(
        'Token format is invalid: expected three dot-separated segments.',
      );
    }

    const header = decodeJsonSegment(headerB64);
    if (header['alg'] !== 'HS256') {
      throw new TokenVerificationException('Token algorithm must be HS256.');
    }

    const signingInput = `${headerB64}.${payloadB64}`;
    const expected = base64UrlEncode(
      createHmac('sha256', this.secret).update(signingInput, 'utf8').digest(),
    );

    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(sigB64);
    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      throw new TokenVerificationException('Token signature is invalid.');
    }

    const claims = decodeJsonSegment(payloadB64);
    const now = Math.floor(Date.now() / 1000);

    const nbf = claims['nbf'];
    if (typeof nbf === 'number' && nbf > now) {
      throw new TokenVerificationException('Token is not yet valid.');
    }

    const exp = claims['exp'];
    if (typeof exp === 'number' && exp < now) {
      throw new TokenVerificationException('Token has expired.');
    }

    return claims;
  }

  issue(claims: Readonly<Record<string, unknown>>): string {
    const headerB64 = base64UrlEncode(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payloadB64 = base64UrlEncode(JSON.stringify(claims));
    const signingInput = `${headerB64}.${payloadB64}`;
    const sigB64 = base64UrlEncode(
      createHmac('sha256', this.secret).update(signingInput, 'utf8').digest(),
    );
    return `${signingInput}.${sigB64}`;
  }
}
