import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import {
  computeWebhookSignature,
  webhookSignatureMiddleware,
} from '../../src/middleware/webhook-signature.js';

describe('webhookSignatureMiddleware', () => {
  const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
  const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
  const secret = 'whsec_test';

  it('accepts valid sha256 signature', async () => {
    const { app } = await createApp({ settings });
    app.use('/webhooks/*', webhookSignatureMiddleware(problems, { secret }));
    app.post('/webhooks/stripe', (c) => c.json({ ok: true }));

    const body = JSON.stringify({ event: 'paid' });
    const sig = `sha256=${computeWebhookSignature(body, secret)}`;
    const response = await app.request('http://localhost/webhooks/stripe', {
      method: 'POST',
      headers: { 'X-Webhook-Signature-256': sig, 'Content-Type': 'application/json' },
      body,
    });
    expect(response.status).toBe(200);
  });

  it('rejects missing signature with 401', async () => {
    const { app } = await createApp({ settings });
    app.use('/webhooks/*', webhookSignatureMiddleware(problems, { secret }));
    app.post('/webhooks/stripe', (c) => c.json({ ok: true }));

    const response = await app.request('http://localhost/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(401);
  });

  it('rejects stale timestamp replay', async () => {
    const { app } = await createApp({ settings });
    app.use(
      '/webhooks/*',
      webhookSignatureMiddleware(problems, { secret, maxTimestampSkewSeconds: 60 }),
    );
    app.post('/webhooks/stripe', (c) => c.json({ ok: true }));

    const body = JSON.stringify({ event: 'old' });
    const ts = String(Math.floor(Date.now() / 1000) - 120);
    const sig = `sha256=${computeWebhookSignature(body, secret, ts)}`;
    const response = await app.request('http://localhost/webhooks/stripe', {
      method: 'POST',
      headers: {
        'X-Webhook-Signature-256': sig,
        'X-Webhook-Timestamp': ts,
        'Content-Type': 'application/json',
      },
      body,
    });
    expect(response.status).toBe(401);
  });
});
