import { beforeAll, describe, expect, it } from 'vitest';

import {
  bearerAuth,
  createExampleTestApp,
  type ExampleTestApp,
} from '../helpers/example-test-app.js';

/**
 * OpenAPI contract coverage for the protected routes — 1.0 gate 2 (ADR 0004).
 * `/examples/protected` uses **bearer** auth; `/machine/health` uses an **API key**
 * (`X-NENE2-API-Key`). Both: 401 unauthenticated, 200 (+ documented shape) when authed.
 */
const MACHINE_KEY = 'test-machine-key';

describe('OpenAPI contract — protected endpoints', () => {
  let nene2: ExampleTestApp;

  beforeAll(async () => {
    nene2 = await createExampleTestApp({ NENE2_MACHINE_API_KEY: MACHINE_KEY });
  });

  describe('GET /examples/protected', () => {
    it('401 Problem Details when unauthenticated', async () => {
      const res = await nene2.app.request('http://localhost/examples/protected');
      expect(res.status).toBe(401);
      expect(res.headers.get('Content-Type')).toContain('application/problem+json');
      const body = (await res.json()) as { status: number };
      expect(body.status).toBe(401);
    });

    it('200 with claims when authenticated', async () => {
      const res = await nene2.app.request('http://localhost/examples/protected', {
        headers: bearerAuth(nene2.verifier, 'user-7'),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { message: string; claims: { sub: string } };
      expect(body.message).toBe('Welcome, authenticated user.');
      expect(body.claims.sub).toBe('user-7');
    });
  });

  describe('GET /machine/health (API key)', () => {
    it('401 when no API key', async () => {
      const res = await nene2.app.request('http://localhost/machine/health');
      expect(res.status).toBe(401);
      expect(res.headers.get('Content-Type')).toContain('application/problem+json');
    });

    it('401 when the API key is wrong', async () => {
      const res = await nene2.app.request('http://localhost/machine/health', {
        headers: { 'X-NENE2-API-Key': 'wrong' },
      });
      expect(res.status).toBe(401);
    });

    it('200 with status/service/credential_type for a valid API key', async () => {
      const res = await nene2.app.request('http://localhost/machine/health', {
        headers: { 'X-NENE2-API-Key': MACHINE_KEY },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        status: string;
        service: string;
        credential_type?: unknown;
      };
      expect(body.status).toBe('ok');
      expect(typeof body.service).toBe('string');
      expect(body).toHaveProperty('credential_type');
    });
  });
});
