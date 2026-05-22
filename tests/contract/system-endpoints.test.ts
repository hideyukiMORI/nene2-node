import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { openApiFileExists, resolveOpenApiPath } from '../../src/openapi/resolve-openapi-path.js';

const here = dirname(fileURLToPath(import.meta.url));

function loadFixture<T>(name: string): T {
  const raw = readFileSync(join(here, '../fixtures/contract', name), 'utf8');
  return JSON.parse(raw) as T;
}

describe('OpenAPI contract — system endpoints', () => {
  const { app } = createApp();

  it('GET / matches framework-smoke fixture', async () => {
    const expected = loadFixture<Record<string, string>>('framework-smoke-200.json');
    const response = await app.request('http://localhost/');
    const body = (await response.json()) as Record<string, string>;

    expect(response.status).toBe(200);
    expect(body).toEqual(expected);
  });

  it('GET /health matches health fixture', async () => {
    const expected = loadFixture<Record<string, string>>('health-200.json');
    const response = await app.request('http://localhost/health');
    const body = (await response.json()) as Record<string, string>;

    expect(response.status).toBe(200);
    expect(body).toEqual(expected);
  });

  it('GET /examples/ping matches ping fixture', async () => {
    const expected = loadFixture<Record<string, string>>('ping-200.json');
    const response = await app.request('http://localhost/examples/ping');
    const body = (await response.json()) as Record<string, string>;

    expect(response.status).toBe(200);
    expect(body).toEqual(expected);
  });

  it('unknown route matches not-found Problem Details shape', async () => {
    const expected = loadFixture<{ type: string; title: string; status: number }>(
      'not-found-problem.json',
    );
    const response = await app.request('http://localhost/unknown-route');
    const body = (await response.json()) as {
      type: string;
      title: string;
      status: number;
      detail?: string;
      instance?: string;
    };

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
    expect(body.type).toBe(expected.type);
    expect(body.title).toBe(expected.title);
    expect(body.status).toBe(expected.status);
    expect(body.instance).toBe('/unknown-route');
  });
});

describe('OpenAPI contract — upstream file', () => {
  it('resolves sibling NENE2 openapi path when present', () => {
    const path = resolveOpenApiPath();
    if (!openApiFileExists(path)) {
      expect(path).toContain('openapi.yaml');
      return;
    }

    const content = readFileSync(path, 'utf8');
    expect(content).toContain('openapi: 3.1.0');
    expect(content).toContain('operationId: getHealth');
    expect(content).toContain('/examples/ping');
  });
});
