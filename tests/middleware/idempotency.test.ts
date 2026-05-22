import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { idempotencyMiddleware } from '../../src/middleware/idempotency.js';

describe('idempotencyMiddleware', () => {
  it('replays the first response for the same Idempotency-Key', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const { app } = await createApp({ settings });
    let hits = 0;

    app.use('/pay', idempotencyMiddleware(problems));
    app.post('/pay', (c) => {
      hits += 1;
      return c.json({ chargeId: hits }, 201);
    });

    const headers = {
      'Content-Type': 'application/json',
      'Idempotency-Key': 'pay-001',
    };
    const body = JSON.stringify({ amount: 10 });

    const first = await app.request('http://localhost/pay', {
      method: 'POST',
      headers,
      body,
    });
    const second = await app.request('http://localhost/pay', {
      method: 'POST',
      headers,
      body,
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.headers.get('X-Idempotent-Replay')).toBe('true');
    expect(hits).toBe(1);
    expect(await first.json()).toEqual(await second.json());
  });

  it('returns 409 when the same key is used with a different body', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const { app } = await createApp({ settings });

    app.use('/pay', idempotencyMiddleware(problems));
    app.post('/pay', (c) => c.json({ ok: true }, 201));

    const key = { 'Idempotency-Key': 'pay-002', 'Content-Type': 'application/json' };
    await app.request('http://localhost/pay', {
      method: 'POST',
      headers: key,
      body: JSON.stringify({ amount: 1 }),
    });
    const conflict = await app.request('http://localhost/pay', {
      method: 'POST',
      headers: key,
      body: JSON.stringify({ amount: 2 }),
    });

    expect(conflict.status).toBe(409);
  });
});
