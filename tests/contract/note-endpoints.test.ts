import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';
import type { Hono } from 'hono';

import { createApp } from '../../src/app/create-app.js';

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

  beforeAll(async () => {
    app = (await createApp()).app;
  });

  it('GET /examples/notes matches empty list fixture', async () => {
    const expected = loadFixture<{ items: unknown[]; limit: number; offset: number }>(
      'note-list-empty-200.json',
    );
    const response = await app.request('http://localhost/examples/notes');
    const body = await jsonBody<typeof expected>(response);

    expect(response.status).toBe(200);
    expect(body).toEqual(expected);
  });

  it('POST + GET note matches OpenAPI example field shapes', async () => {
    const example = loadFixture<{ title: string; body: string }>('note-response-200.json');

    const createResponse = await app.request('http://localhost/examples/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: example.title, body: example.body }),
    });

    expect(createResponse.status).toBe(201);
    const created = await jsonBody<{ id: number; title: string; body: string }>(createResponse);
    expect(created.title).toBe(example.title);
    expect(created.body).toBe(example.body);
    expect(typeof created.id).toBe('number');

    const getResponse = await app.request(`http://localhost/examples/notes/${String(created.id)}`);
    const fetched = await jsonBody<typeof created>(getResponse);

    expect(getResponse.status).toBe(200);
    expect(fetched).toEqual(created);
  });
});
