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

describe('HTTP /examples/tags', () => {
  let app: Nene2App['app'];
  let verifier: ExampleTestApp['verifier'];

  beforeEach(async () => {
    ({ app, verifier } = await createExampleTestApp());
  });

  it('returns 401 without bearer token', async () => {
    const response = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'php' }),
    });
    expect(response.status).toBe(401);
  });

  it('creates, reads, updates, and deletes a tag', async () => {
    const createResponse = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ name: 'php' }),
    });
    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; name: string }>(createResponse);

    const getResponse = await app.request(`http://localhost/examples/tags/${String(created.id)}`, {
      headers: bearerAuth(verifier),
    });
    expect((await jsonBody(getResponse)).name).toBe('php');

    const updateResponse = await app.request(
      `http://localhost/examples/tags/${String(created.id)}`,
      {
        method: 'PUT',
        headers: jsonAuthHeaders(verifier),
        body: JSON.stringify({ name: 'php8' }),
      },
    );
    expect((await jsonBody(updateResponse)).name).toBe('php8');

    const deleteResponse = await app.request(
      `http://localhost/examples/tags/${String(created.id)}`,
      { method: 'DELETE', headers: bearerAuth(verifier) },
    );
    expect(deleteResponse.status).toBe(204);
  });

  it('returns 422 for empty name', async () => {
    const response = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier),
      body: JSON.stringify({ name: '' }),
    });
    expect(response.status).toBe(422);
  });
});
