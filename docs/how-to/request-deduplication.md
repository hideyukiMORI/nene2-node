# Request Deduplication

Prevent duplicate processing from network retries or double-clicks using an `Idempotency-Key` header. The server caches responses per key and replays them on retries.

## Framework middleware

The nene2-framework includes `idempotencyMiddleware` — the recommended approach:

```ts
import {
  idempotencyMiddleware,
  FileIdempotencyStorage,
  RedisIdempotencyStorage,
} from '@hideyukimori/nene2-framework';

// File-backed (single-process)
const storage = new FileIdempotencyStorage('./data/idempotency');

// Redis-backed (distributed)
// const redis = await createRedisKeyValueClientFromUrl(process.env['REDIS_URL']!);
// const storage = new RedisIdempotencyStorage(redis);

app.use('/payments', idempotencyMiddleware({ storage }));
app.use('/orders', idempotencyMiddleware({ storage }));
```

The middleware:

1. Requires `Idempotency-Key` header (returns 400 if absent)
2. On first request: processes normally, caches the response
3. On repeat request with same key: replays the cached response

## Manual implementation (custom schema)

If you need the idempotency keys in your own DB table (for auditing or cross-service queries):

```sql
CREATE TABLE idempotency_keys (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT    NOT NULL UNIQUE,
  method          TEXT    NOT NULL,
  path            TEXT    NOT NULL,
  status_code     INTEGER NOT NULL,
  response_body   TEXT    NOT NULL,
  created_at      TEXT    NOT NULL,
  expires_at      TEXT    NOT NULL
);
```

```ts
app.post('/payments', async (c) => {
  const key = c.req.header('Idempotency-Key')?.trim();
  if (!key) return c.json({ error: 'Idempotency-Key header is required' }, 400);

  // Check for existing response
  const cached = await executor.fetchOne(
    'SELECT * FROM idempotency_keys WHERE idempotency_key = ? AND expires_at > ?',
    [key, utcNowIso()],
  );
  if (cached) {
    const body = JSON.parse(String(cached['response_body'])) as Record<string, unknown>;
    return c.json({ ...body, replayed: true }, Number(cached['status_code']));
  }

  // Process the payment
  const body = await c.req.json();
  const result = await processPayment(body);
  const statusCode = 201;

  // Cache the response (TTL: 24 hours)
  const now = utcNowIso();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    await executor.execute(
      'INSERT INTO idempotency_keys (idempotency_key, method, path, status_code, response_body, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [key, 'POST', '/payments', statusCode, JSON.stringify(result), now, expiresAt],
    );
  } catch (err) {
    if (classifyDatabaseError(err) !== 'unique-violation') throw err;
    // Race condition: another request just cached it — that's fine
  }

  return c.json(result, statusCode);
});
```

The `replayed: true` field in the response signals to clients that the response came from cache.

## Key recommendations

| Practice               | Reason                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| Use UUID v4 for keys   | Prevents guessable keys that could be used to probe other users' operations |
| TTL 24 hours           | Balance retry window vs storage cost                                        |
| Key is per-user scoped | Store `(user_id, idempotency_key)` if keys could collide across users       |
| Body hash check        | Optional: verify the request body matches the original before replaying     |

## Framework features used

| Feature                | Import                                        |
| ---------------------- | --------------------------------------------- |
| Idempotency middleware | `idempotencyMiddleware`, `IdempotencyOptions` |
| File storage           | `FileIdempotencyStorage`                      |
| Redis storage          | `RedisIdempotencyStorage`                     |
| In-memory storage      | `InMemoryIdempotencyStorage`                  |
| Body hash              | `requestBodyHash`                             |
| UNIQUE violation       | `classifyDatabaseError`                       |
| UTC timestamps         | `utcNowIso`                                   |
