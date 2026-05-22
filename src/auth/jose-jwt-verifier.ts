import type { TokenVerifier } from './token-verifier.js';
import { TokenVerificationException } from './token-verification-exception.js';

export interface JoseJwtVerifierOptions {
  /** Remote JWKS document URL (e.g. `https://idp.example/.well-known/jwks.json`). */
  readonly jwksUri?: string;
  /** Inline JWKS for tests or pinned keys — mutually exclusive with `jwksUri`. */
  readonly jwks?: JsonWebKeySetInput;
  readonly issuer?: string;
  readonly audience?: string | readonly string[];
}

type JoseModule = typeof import('jose');
type JsonWebKeySetInput = Parameters<JoseModule['createLocalJWKSet']>[0];

async function loadJose(): Promise<JoseModule> {
  try {
    return await import('jose');
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Cannot find') || error.message.includes('Cannot resolve'))
    ) {
      throw new Error('JoseJwtVerifier requires peer dependency `jose`. Install: npm install jose');
    }
    throw error;
  }
}

/**
 * Production JWT verification via `jose` (RS256/ES256/etc.) and JWKS.
 * Use `createApp({ tokenVerifier })` — do not use `LocalBearerTokenVerifier` in production.
 */
export async function createJoseJwtVerifier(
  options: JoseJwtVerifierOptions,
): Promise<TokenVerifier> {
  const jose = await loadJose();
  const verifyOptions: Parameters<JoseModule['jwtVerify']>[2] = {};
  if (options.issuer !== undefined) {
    verifyOptions.issuer = options.issuer;
  }
  if (options.audience !== undefined) {
    verifyOptions.audience =
      typeof options.audience === 'string' ? options.audience : [...options.audience];
  }

  let keySet:
    | ReturnType<JoseModule['createRemoteJWKSet']>
    | ReturnType<JoseModule['createLocalJWKSet']>;
  if (options.jwksUri !== undefined) {
    keySet = jose.createRemoteJWKSet(new URL(options.jwksUri));
  } else if (options.jwks !== undefined) {
    keySet = jose.createLocalJWKSet(options.jwks);
  } else {
    throw new Error('createJoseJwtVerifier requires jwksUri or jwks.');
  }

  return {
    async verify(token: string): Promise<Readonly<Record<string, unknown>>> {
      try {
        const { payload } = await jose.jwtVerify(token, keySet, verifyOptions);
        return payload;
      } catch {
        throw new TokenVerificationException('The provided Bearer token is invalid or expired.');
      }
    },
  };
}
