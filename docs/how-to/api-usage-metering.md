# API Usage Metering

Per-user daily quota enforcement with append-only usage events. Quota check before processing; per-endpoint breakdown for dashboards and billing.

## Schema

```sql
CREATE TABLE quotas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL UNIQUE,
  daily_limit INTEGER NOT NULL DEFAULT 1000 CHECK (daily_limit > 0),
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE usage_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT    NOT NULL,
  endpoint   TEXT    NOT NULL,
  day_key    TEXT    NOT NULL,  -- YYYY-MM-DD; partitions usage by day
  created_at TEXT    NOT NULL
);

CREATE INDEX idx_usage_events_user_day ON usage_events (user_id, day_key);
```

## Endpoints

| Method | Path                     | Auth  |
| ------ | ------------------------ | ----- |
| `POST` | `/quotas`                | Admin |
| `GET`  | `/quotas/:userId`        | Self  |
| `POST` | `/quota-check`           | Any   |
| `GET`  | `/usage/:userId/summary` | Self  |

## Day key

```ts
function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" UTC
}
```

## Quota check middleware

```ts
async function checkAndRecordUsage(userId: string, endpoint: string): Promise<void> {
  const dayKey = todayKey();

  // Current usage today
  const usageRow = await executor.fetchOne(
    'SELECT COUNT(*) AS cnt FROM usage_events WHERE user_id = ? AND day_key = ?',
    [userId, dayKey],
  );
  const used = Number(usageRow?.['cnt'] ?? 0);

  // User's quota
  const quotaRow = await executor.fetchOne('SELECT daily_limit FROM quotas WHERE user_id = ?', [
    userId,
  ]);
  const limit = quotaRow ? Number(quotaRow['daily_limit']) : 1000; // default quota

  if (used >= limit) {
    throw new QuotaExceededError(used, limit); // → 429
  }

  // Record the usage event
  await executor.execute(
    'INSERT INTO usage_events (user_id, endpoint, day_key, created_at) VALUES (?, ?, ?, ?)',
    [userId, endpoint, dayKey, utcNowIso()],
  );
}
```

## Per-endpoint breakdown

```ts
app.get('/usage/:userId/summary', async (c) => {
  const userId = c.req.param('userId');
  assertSelfOrAdmin(c, userId);

  const dayKey = c.req.query('day') ?? todayKey();

  const rows = await executor.fetchAll(
    `SELECT endpoint, COUNT(*) AS calls
     FROM usage_events WHERE user_id = ? AND day_key = ?
     GROUP BY endpoint ORDER BY calls DESC`,
    [userId, dayKey],
  );

  const total = rows.reduce((sum, r) => sum + Number(r['calls']), 0);
  const quotaRow = await executor.fetchOne('SELECT daily_limit FROM quotas WHERE user_id = ?', [
    userId,
  ]);
  const limit = quotaRow ? Number(quotaRow['daily_limit']) : 1000;

  return c.json({
    day: dayKey,
    total,
    limit,
    remaining: Math.max(0, limit - total),
    breakdown: rows,
  });
});
```

## Response headers (optional)

Add rate-limit headers for client transparency:

```ts
c.header('X-RateLimit-Limit', String(limit));
c.header('X-RateLimit-Remaining', String(Math.max(0, limit - used)));
c.header(
  'X-RateLimit-Reset',
  new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime() / 1000 + 86400 + '',
);
```

## Framework features used

| Feature          | Import                |
| ---------------- | --------------------- |
| JWT sub          | `authSubFromContext`  |
| Admin role check | `c.get('authClaims')` |
| UTC timestamps   | `utcNowIso`           |
