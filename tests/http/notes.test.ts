import { beforeEach, describe, expect, it } from 'vitest';

import type { Nene2App } from '../../src/app/create-app.js';
import {
  bearerAuth,
  createExampleTestApp,
  jsonAuthHeaders,
  type ExampleTestApp,
} from '../helpers/example-test-app.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('HTTP /examples/notes', () => {
  let app: Nene2App['app'];
  let verifier: ExampleTestApp['verifier'];

  beforeEach(async () => {
    ({ app, verifier } = await createExampleTestApp());
  });

  it('returns 401 without bearer token', async () => {
    const response = await app.request('http://localhost/examples/notes');
    expect(response.status).toBe(401);
  });

  it('lists empty notes', async () => {
    const response = await app.request('http://localhost/examples/notes', {
      headers: bearerAuth(verifier),
    });
    const body = await jsonBody<{ items: unknown[]; limit: number; offset: number }>(response);

    expect(response.status).toBe(200);
    expect(body.items).toEqual([]);
    expect(body.limit).toBe(20);
    expect(body.offset).toBe(0);
  });

  it('creates, reads, updates, and deletes a note', async () => {
    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ title: 'Hello', body: 'World' }),
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.headers.get('Location')).toMatch(/^\/examples\/notes\/\d+$/);

    const created = await jsonBody<{ id: number; title: string; body: string }>(createResponse);

    const getResponse = await app.request(`http://localhost/examples/notes/${String(created.id)}`, {
      headers: bearerAuth(verifier),
    });
    expect(getResponse.status).toBe(200);
    expect((await jsonBody(getResponse)).title).toBe('Hello');

    const updateResponse = await app.request(
      `http://localhost/examples/notes/${String(created.id)}`,
      {
        method: 'PUT',
        headers: jsonAuthHeaders(verifier),
        body: JSON.stringify({ title: 'Updated', body: 'Updated body' }),
      },
    );
    expect(updateResponse.status).toBe(200);
    expect((await jsonBody(updateResponse)).title).toBe('Updated');

    const deleteResponse = await app.request(
      `http://localhost/examples/notes/${String(created.id)}`,
      { method: 'DELETE', headers: bearerAuth(verifier) },
    );
    expect(deleteResponse.status).toBe(204);

    const missingResponse = await app.request(
      `http://localhost/examples/notes/${String(created.id)}`,
      { headers: bearerAuth(verifier) },
    );
    expect(missingResponse.status).toBe(404);
  });

  it('returns 422 for empty title', async () => {
    const response = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ title: '', body: 'x' }),
    });
    const body = await jsonBody<{ errors: { field: string }[] }>(response);

    expect(response.status).toBe(422);
    expect(body.errors[0]?.field).toBe('title');
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: '{not-json',
    });
    const body = await jsonBody<{ type: string; status: number }>(response);

    expect(response.status).toBe(400);
    expect(body.type).toContain('invalid-json');
    expect(body.status).toBe(400);
  });

  it('returns 422 for out-of-range limit', async () => {
    const response = await app.request('http://localhost/examples/notes?limit=0', {
      headers: bearerAuth(verifier),
    });
    expect(response.status).toBe(422);
  });
});
