import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';
import type { Hono } from 'hono';

import { createApp } from '../../src/app/create-app.js';

const here = dirname(fileURLToPath(import.meta.url));

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(here, '../fixtures/contract', name), 'utf8')) as T;
}

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('OpenAPI contract — tag endpoints', () => {
  let app: Hono;

  beforeAll(async () => {
    app = (await createApp()).app;
  });

  it('GET /examples/tags matches empty list fixture', async () => {
    const expected = loadFixture<{ items: unknown[]; limit: number; offset: number }>(
      'tag-list-empty-200.json',
    );
    const response = await app.request('http://localhost/examples/tags');
    expect(response.status).toBe(200);
    expect(await jsonBody(response)).toEqual(expected);
  });

  it('POST + GET tag matches OpenAPI example shape', async () => {
    const example = loadFixture<{ name: string }>('tag-response-200.json');
    const createResponse = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: example.name }),
    });
    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; name: string }>(createResponse);
    expect(created.name).toBe(example.name);
  });
});
