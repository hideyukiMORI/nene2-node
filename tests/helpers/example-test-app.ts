import { createApp, type Nene2App } from '../../src/app/create-app.js';
import { LocalBearerTokenVerifier } from '../../src/auth/local-bearer-token-verifier.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

export const EXAMPLE_TEST_JWT_SECRET = 'example-test-jwt-secret';

export interface ExampleTestApp extends Nene2App {
  readonly verifier: LocalBearerTokenVerifier;
}

export async function createExampleTestApp(
  env: Record<string, string> = {},
): Promise<ExampleTestApp> {
  const verifier = new LocalBearerTokenVerifier(EXAMPLE_TEST_JWT_SECRET);
  const settings = loadAppSettings({
    NODE_ENV: 'test',
    NENE2_NODE_APP_ENV: 'test',
    NENE2_LOCAL_JWT_SECRET: EXAMPLE_TEST_JWT_SECRET,
    ...env,
  });
  const nene2 = await createApp({ settings, tokenVerifier: verifier });
  return { ...nene2, verifier };
}

export function bearerAuth(
  verifier: LocalBearerTokenVerifier,
  sub = 'test-user',
): { Authorization: string } {
  return { Authorization: `Bearer ${verifier.issue({ sub })}` };
}

export function jsonAuthHeaders(
  verifier: LocalBearerTokenVerifier,
  sub = 'test-user',
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...bearerAuth(verifier, sub),
  };
}
