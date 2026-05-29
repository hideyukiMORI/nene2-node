import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';
import type { Hono } from 'hono';

import {
  bearerAuth,
  createExampleTestApp,
  jsonAuthHeaders,
  type ExampleTestApp,
} from '../helpers/example-test-app.js';

const here = dirname(fileURLToPath(import.meta.url));

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(here, '../fixtures/contract', name), 'utf8')) as T;
}

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('OpenAPI contract — tag endpoints', () => {
  let app: Hono;
  let verifier: ExampleTestApp['verifier'];

  beforeAll(async () => {
    ({ app, verifier } = await createExampleTestApp());
  });

  it('GET /examples/tags matches empty list fixture', async () => {
    const expected = loadFixture<{ items: unknown[]; limit: number; offset: number }>(
      'tag-list-empty-200.json',
    );
    const response = await app.request('http://localhost/examples/tags', {
      headers: bearerAuth(verifier),
    });
    expect(response.status).toBe(200);
    expect(await jsonBody(response)).toEqual(expected);
  });

  it('POST + GET tag matches OpenAPI example shape', async () => {
    const example = loadFixture<{ name: string }>('tag-response-200.json');
    const createResponse = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ name: example.name }),
    });
    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; name: string; created_at: string }>(
      createResponse,
    );
    expect(created.name).toBe(example.name);
    expect(created.created_at.endsWith('Z')).toBe(true);
  });

  it('GET/PUT/DELETE /examples/tags/{id} cover the id lifecycle', async () => {
    const create = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ name: 'lifecycle-original' }),
    });
    const { id } = await jsonBody<{ id: number }>(create);
    const url = `http://localhost/examples/tags/${String(id)}`;

    const get = await app.request(url, { headers: bearerAuth(verifier) });
    expect(get.status).toBe(200);
    expect((await jsonBody<{ id: number }>(get)).id).toBe(id);

    const put = await app.request(url, {
      method: 'PUT',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ name: 'lifecycle-updated' }),
    });
    expect(put.status).toBe(200);
    expect((await jsonBody<{ name: string }>(put)).name).toBe('lifecycle-updated');

    const del = await app.request(url, { method: 'DELETE', headers: bearerAuth(verifier) });
    expect(del.status).toBe(204);
    expect(await del.text()).toBe('');

    const afterDelete = await app.request(url, { headers: bearerAuth(verifier) });
    expect(afterDelete.status).toBe(404);
  });
});
