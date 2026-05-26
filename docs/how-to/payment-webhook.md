# Payment Webhook

Receive payment provider webhooks with HMAC-SHA256 signature verification, idempotent processing via `event_id`, and guarded status-machine transitions.

## Endpoints

| Method | Path                | Auth           |
| ------ | ------------------- | -------------- |
| `POST` | `/webhooks/payment` | HMAC signature |
| `GET`  | `/payments`         | Admin          |
| `GET`  | `/payments/:id`     | Admin          |

## Schema

```sql
CREATE TABLE payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT    NOT NULL UNIQUE,
  amount      INTEGER NOT NULL,  -- smallest currency unit (cents)
  currency    TEXT    NOT NULL DEFAULT 'usd',
  status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE webhook_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     TEXT    NOT NULL UNIQUE,  -- idempotency key
  event_type   TEXT    NOT NULL,
  payload      TEXT    NOT NULL,         -- JSON string
  processed_at TEXT    NOT NULL
);
```

`webhook_events.event_id` is the idempotency key — the same event delivered twice is processed once.

## HMAC-SHA256 signature verification

Use the framework's `webhookSignatureMiddleware` for zero-boilerplate verification:

```ts
import { webhookSignatureMiddleware } from '@hideyukimori/nene2-framework';

app.use(
  '/webhooks/payment',
  webhookSignatureMiddleware({
    secret: process.env['PAYMENT_WEBHOOK_SECRET']!,
    headerName: 'X-Signature-256', // provider-specific header name
    algorithm: 'sha256',
    prefix: 'sha256=', // e.g., "sha256=abc123..."
  }),
);
```

Or verify manually:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifySignature(secret: string, payload: string, signature: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuf = Buffer.from(`sha256=${expected}`);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
```

Always use `timingSafeEqual` — naive string comparison is vulnerable to timing attacks.

## Status-machine transitions

```
pending → succeeded
pending → failed
succeeded → refunded
```

Any other transition is rejected:

```ts
const VALID_TRANSITIONS: Record<string, { from: string; to: string }> = {
  'payment.succeeded': { from: 'pending', to: 'succeeded' },
  'payment.failed': { from: 'pending', to: 'failed' },
  'payment.refunded': { from: 'succeeded', to: 'refunded' },
};

async processEvent(eventType: string, externalId: string): Promise<void> {
  const transition = VALID_TRANSITIONS[eventType];
  if (!transition) return; // unknown event type — ignore

  const payment = await repo.findByExternalId(externalId);
  if (!payment) throw new PaymentNotFoundError(externalId);

  if (payment.status !== transition.from) {
    throw new InvalidTransitionError(payment.status, transition.to); // → 409
  }

  await repo.updateStatus(payment.id, transition.to, utcNowIso());
}
```

## Idempotent webhook handler

```ts
app.post('/webhooks/payment', async (c) => {
  const body = await c.req.json();
  const eventId: string = body.event_id;
  const eventType: string = body.event_type;
  const externalId: string = body.data?.payment_id;

  // Idempotency: check if already processed
  const existing = await executor.fetchOne('SELECT id FROM webhook_events WHERE event_id = ?', [
    eventId,
  ]);
  if (existing) {
    return c.json({ status: 'already_processed' }, 200); // 200 — tell provider to stop retrying
  }

  await processEvent(eventType, externalId);

  // Record as processed
  try {
    await executor.execute(
      'INSERT INTO webhook_events (event_id, event_type, payload, processed_at) VALUES (?, ?, ?, ?)',
      [eventId, eventType, JSON.stringify(body), utcNowIso()],
    );
  } catch (err) {
    if (classifyDatabaseError(err) === 'unique-violation') {
      return c.json({ status: 'already_processed' }, 200); // race condition — safe to ignore
    }
    throw err;
  }

  return c.json({ status: 'processed' }, 200);
});
```

Always return **200** to the payment provider to stop retry loops — even for duplicate events. Return 4xx only for signature failures or completely malformed payloads.

## Security checklist

| Check                     | Pattern                                    |
| ------------------------- | ------------------------------------------ |
| Signature forgery         | `timingSafeEqual` HMAC comparison          |
| Replay (same event twice) | `UNIQUE event_id` in `webhook_events`      |
| Invalid state transition  | Guard with allowed-transitions table → 409 |
| Missing signature         | Return 401 before processing               |

## Framework features used

| Feature                 | Import                                                  |
| ----------------------- | ------------------------------------------------------- |
| Webhook HMAC middleware | `webhookSignatureMiddleware`, `computeWebhookSignature` |
| UTC timestamps          | `utcNowIso`                                             |
| UNIQUE violation → 200  | `classifyDatabaseError`                                 |
| Atomic status update    | `runTransaction`                                        |
