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
  const raw = readFileSync(join(here, '../fixtures/contract', name), 'utf8');
  return JSON.parse(raw) as T;
}

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('OpenAPI contract — note endpoints', () => {
  let app: Hono;
  let verifier: ExampleTestApp['verifier'];

  beforeAll(async () => {
    ({ app, verifier } = await createExampleTestApp());
  });

  it('GET /examples/notes matches empty list fixture', async () => {
    const expected = loadFixture<{ items: unknown[]; limit: number; offset: number }>(
      'note-list-empty-200.json',
    );
    const response = await app.request('http://localhost/examples/notes', {
      headers: bearerAuth(verifier),
    });
    const body = await jsonBody<typeof expected>(response);

    expect(response.status).toBe(200);
    expect(body).toEqual(expected);
  });

  it('POST + GET note matches OpenAPI example field shapes', async () => {
    const example = loadFixture<{ title: string; body: string }>('note-response-200.json');

    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ title: example.title, body: example.body }),
    });

    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; title: string; body: string; created_at: string }>(
      createResponse,
    );
    expect(created.title).toBe(example.title);
    expect(created.body).toBe(example.body);
    expect(typeof created.id).toBe('number');
    expect(created.created_at.endsWith('Z')).toBe(true);

    const getResponse = await app.request(`http://localhost/examples/notes/${String(created.id)}`, {
      headers: bearerAuth(verifier),
    });
    const fetched = await jsonBody<typeof created>(getResponse);

    expect(getResponse.status).toBe(200);
    expect(fetched.created_at).toBe(created.created_at);
  });

  it('PUT /examples/notes/{id} updates and returns 200; DELETE returns 204 then 404', async () => {
    const create = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ title: 'Original', body: 'first' }),
    });
    const { id } = await jsonBody<{ id: number }>(create);
    const url = `http://localhost/examples/notes/${String(id)}`;

    const put = await app.request(url, {
      method: 'PUT',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ title: 'Updated', body: 'second' }),
    });
    expect(put.status).toBe(200);
    const updated = await jsonBody<{ id: number; title: string; body: string }>(put);
    expect(updated.id).toBe(id);
    expect(updated.title).toBe('Updated');
    expect(updated.body).toBe('second');

    const del = await app.request(url, { method: 'DELETE', headers: bearerAuth(verifier) });
    expect(del.status).toBe(204);
    expect(await del.text()).toBe('');

    const afterDelete = await app.request(url, { headers: bearerAuth(verifier) });
    expect(afterDelete.status).toBe(404);
  });
});
