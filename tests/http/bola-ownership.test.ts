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

describe('BOLA ownership — example note/tag routes', () => {
  let app: Nene2App['app'];
  let verifier: ExampleTestApp['verifier'];

  beforeEach(async () => {
    ({ app, verifier } = await createExampleTestApp());
  });

  it('returns 403 when another user reads a note by id', async () => {
    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier, 'owner-user'),
      body: JSON.stringify({ title: 'Private', body: 'Secret' }),
    });
    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number }>(createResponse);

    const denied = await app.request(`http://localhost/examples/notes/${String(created.id)}`, {
      headers: bearerAuth(verifier, 'other-user'),
    });
    expect(denied.status).toBe(403);
    const body = await jsonBody<{ type: string; status: number; resource: string }>(denied);
    expect(body.status).toBe(403);
    expect(body.type).toContain('forbidden');
    expect(body.resource).toBe('note');
  });

  it('does not leak another user note in list results', async () => {
    await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier, 'owner-user'),
      body: JSON.stringify({ title: 'Hidden', body: 'x' }),
    });

    const listResponse = await app.request('http://localhost/examples/notes', {
      headers: bearerAuth(verifier, 'other-user'),
    });
    const listBody = await jsonBody<{ items: { title: string }[] }>(listResponse);
    expect(listResponse.status).toBe(200);
    expect(listBody.items).toEqual([]);
  });

  it('returns 403 when another user reads a tag by id', async () => {
    const createResponse = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier, 'owner-user'),
      body: JSON.stringify({ name: 'private-tag' }),
    });
    const created = await jsonBody<{ id: number }>(createResponse);

    const denied = await app.request(`http://localhost/examples/tags/${String(created.id)}`, {
      headers: bearerAuth(verifier, 'intruder'),
    });
    expect(denied.status).toBe(403);
  });

  it('returns 403 when bearer token has no sub claim', async () => {
    const token = verifier.issue({ role: 'admin' });
    const response = await app.request('http://localhost/examples/notes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(403);
  });

  it('returns 403 when another user updates or deletes a note', async () => {
    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: jsonAuthHeaders(verifier, 'owner-user'),
      body: JSON.stringify({ title: 'Mine', body: 'Body' }),
    });
    const created = await jsonBody<{ id: number }>(createResponse);

    const updateDenied = await app.request(
      `http://localhost/examples/notes/${String(created.id)}`,
      {
        method: 'PUT',
        headers: jsonAuthHeaders(verifier, 'intruder'),
        body: JSON.stringify({ title: 'Stolen', body: 'Nope' }),
      },
    );
    expect(updateDenied.status).toBe(403);

    const deleteDenied = await app.request(
      `http://localhost/examples/notes/${String(created.id)}`,
      {
        method: 'DELETE',
        headers: bearerAuth(verifier, 'intruder'),
      },
    );
    expect(deleteDenied.status).toBe(403);
  });
});
