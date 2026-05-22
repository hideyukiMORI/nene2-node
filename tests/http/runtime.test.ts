import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import type { HealthCheck } from '../../src/http/health-check.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('HTTP runtime', () => {
  it('returns framework smoke JSON at GET /', async () => {
    const { app } = await createApp({
      settings: loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' }),
    });

    const response = await app.request('http://localhost/');

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('X-Request-Id')).toMatch(/^[a-f0-9]{32}$/);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'");

    const body = await jsonBody<{ name: string; description: string; status: string }>(response);
    expect(body.name).toBe('NENE2');
    expect(body.status).toBe('ok');
  });

  it('returns Problem Details for unknown routes', async () => {
    const { app } = await createApp();

    const response = await app.request('http://localhost/missing');
    const body = await jsonBody<{ type: string; title: string; status: number }>(response);

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
    expect(body.type).toBe('https://nene2.dev/problems/not-found');
    expect(body.title).toBe('Not Found');
  });

  it('returns health JSON at GET /health', async () => {
    const { app } = await createApp();

    const response = await app.request('http://localhost/health');
    const body = await jsonBody<{ status: string; service: string }>(response);

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('NENE2');
  });

  it('returns degraded health when a check fails', async () => {
    const failingCheck: HealthCheck = {
      name: 'database',
      check: () => 'error',
    };
    const { app } = await createApp({ healthChecks: [failingCheck] });

    const response = await app.request('http://localhost/health');
    const body = await jsonBody<{
      status: string;
      service: string;
      checks: Record<string, string>;
    }>(response);

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.checks.database).toBe('error');
  });

  it('requires API key for GET /machine/health', async () => {
    const { app } = await createApp({ machineApiKey: 'test-key' });

    const response = await app.request('http://localhost/machine/health');
    const body = await jsonBody<{ type: string }>(response);

    expect(response.status).toBe(401);
    expect(body.type).toBe('https://nene2.dev/problems/unauthorized');
  });

  it('accepts configured API key for GET /machine/health', async () => {
    const { app } = await createApp({ machineApiKey: 'test-key' });

    const response = await app.request('http://localhost/machine/health', {
      headers: { 'X-NENE2-API-Key': 'test-key' },
    });
    const body = await jsonBody<{
      status: string;
      service: string;
      credential_type: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('NENE2');
    expect(body.credential_type).toBe('api_key');
  });

  it('returns example ping JSON at GET /examples/ping', async () => {
    const { app } = await createApp();

    const response = await app.request('http://localhost/examples/ping');
    const body = await jsonBody<{ message: string; status: string }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('pong');
    expect(body.status).toBe('ok');
  });

  it('returns 405 Problem Details for unsupported methods', async () => {
    const { app } = await createApp();

    const response = await app.request('http://localhost/', { method: 'POST' });
    const body = await jsonBody<{ type: string }>(response);

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(body.type).toBe('https://nene2.dev/problems/method-not-allowed');
  });

  it('returns 413 when Content-Length exceeds limit', async () => {
    const { app } = await createApp({
      settings: loadAppSettings({
        NENE2_NODE_REQUEST_MAX_BODY_BYTES: '1048576',
      }),
    });

    const response = await app.request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Length': '1048577' },
    });
    const body = await jsonBody<{ type: string }>(response);

    expect(response.status).toBe(413);
    expect(body.type).toBe('https://nene2.dev/problems/payload-too-large');
  });
});
