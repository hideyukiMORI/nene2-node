import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import type { Nene2App } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('HTTP /examples/tags', () => {
  let app: Nene2App['app'];

  beforeEach(async () => {
    ({ app } = await createApp({
      settings: loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' }),
    }));
  });

  it('creates, reads, updates, and deletes a tag', async () => {
    const createResponse = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'php' }),
    });
    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; name: string }>(createResponse);

    const getResponse = await app.request(`http://localhost/examples/tags/${String(created.id)}`);
    expect((await jsonBody(getResponse)).name).toBe('php');

    const updateResponse = await app.request(
      `http://localhost/examples/tags/${String(created.id)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'php8' }),
      },
    );
    expect((await jsonBody(updateResponse)).name).toBe('php8');

    const deleteResponse = await app.request(
      `http://localhost/examples/tags/${String(created.id)}`,
      { method: 'DELETE' },
    );
    expect(deleteResponse.status).toBe(204);
  });

  it('returns 422 for empty name', async () => {
    const response = await app.request('http://localhost/examples/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(response.status).toBe(422);
  });
});
