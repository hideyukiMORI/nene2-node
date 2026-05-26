# Inbound Webhook Receiver

Receive webhooks from multiple external sources, validate a per-source HMAC signature, and store events with idempotency.

## Schema

```sql
CREATE TABLE webhook_sources (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  secret     TEXT    NOT NULL,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT    NOT NULL
);

CREATE TABLE inbound_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id    INTEGER NOT NULL REFERENCES webhook_sources(id),
  event_id     TEXT    NOT NULL,
  event_type   TEXT    NOT NULL,
  payload      TEXT    NOT NULL,
  processed_at TEXT    NOT NULL,
  UNIQUE (source_id, event_id)
);
```

`UNIQUE (source_id, event_id)` — idempotency per source. The same event from two different sources can have the same `event_id` without collision.

## Endpoints

| Method | Path                   | Auth     |
| ------ | ---------------------- | -------- |
| `POST` | `/sources`             | Admin    |
| `POST` | `/sources/:id/receive` | HMAC sig |
| `GET`  | `/sources/:id/events`  | Admin    |
| `GET`  | `/events/:id`          | Admin    |

## Per-source HMAC signature validation

Each source has its own secret. Validate **before** the idempotency check:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  if (!sigHeader.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(`sha256=${expected}`, 'utf8');
  const actualBuf = Buffer.from(sigHeader, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

app.post('/sources/:id/receive', async (c) => {
  const sourceId = Number(c.req.param('id'));
  const source = await sourceRepo.findById(sourceId);
  if (!source || !source.active) return c.json({ error: 'Source not found' }, 404);

  const rawBody = await c.req.text();
  const sig = c.req.header('X-Signature-256') ?? '';

  if (!verifySignature(rawBody, sig, source.secret)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const body = JSON.parse(rawBody) as { event_id: string; event_type: string };
  // ...
});
```

Alternatively use `webhookSignatureMiddleware` from the framework for a single-source setup.

## Idempotent event storage

```ts
const existing = await executor.fetchOne(
  'SELECT id FROM inbound_events WHERE source_id = ? AND event_id = ?',
  [sourceId, body.event_id],
);
if (existing) {
  return c.json({ status: 'already_processed' }, 200);
}

try {
  await executor.execute(
    'INSERT INTO inbound_events (source_id, event_id, event_type, payload, processed_at) VALUES (?, ?, ?, ?, ?)',
    [sourceId, body.event_id, body.event_type, rawBody, utcNowIso()],
  );
} catch (err) {
  if (classifyDatabaseError(err) === 'unique-violation') {
    return c.json({ status: 'already_processed' }, 200); // race condition
  }
  throw err;
}
```

## Secret never exposed

When returning source details, always omit the `secret` field:

```ts
const { secret: _secret, ...safeSource } = source;
return c.json(safeSource);
```

## Framework features used

| Feature                 | Import                                                  |
| ----------------------- | ------------------------------------------------------- |
| Webhook HMAC middleware | `webhookSignatureMiddleware`, `computeWebhookSignature` |
| UNIQUE violation        | `classifyDatabaseError`                                 |
| UTC timestamps          | `utcNowIso`                                             |
