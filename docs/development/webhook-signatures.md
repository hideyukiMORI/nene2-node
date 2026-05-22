# Webhook signature verification

Inbound webhooks should verify HMAC before parsing JSON.

```ts
import { computeWebhookSignature, webhookSignatureMiddleware } from '@hideyukimori/nene2-framework';

app.use(
  '/webhooks/*',
  webhookSignatureMiddleware(problems, {
    secret: process.env.WEBHOOK_SECRET!,
    protectedPaths: ['/webhooks'],
  }),
);
```

Clients send header **`X-Webhook-Signature-256: sha256=<hex>`** where hex is `computeWebhookSignature(rawBody, secret)`.

Invalid or missing signatures return **401** Problem Details.
