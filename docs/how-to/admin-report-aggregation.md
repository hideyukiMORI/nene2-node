# Admin Report Aggregation

Dashboard-style aggregation endpoints with date-range filters, grouping, `COALESCE` for zero-safe results, and strict date validation.

## Schema

```sql
CREATE TABLE orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT    NOT NULL,
  item_name   TEXT    NOT NULL,
  amount      INTEGER NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
  created_at  TEXT    NOT NULL
);
```

## Endpoints

| Method | Path                 | Auth  |
| ------ | -------------------- | ----- |
| `POST` | `/orders`            | Any   |
| `GET`  | `/reports/summary`   | Admin |
| `GET`  | `/reports/daily`     | Admin |
| `GET`  | `/reports/by-status` | Admin |
| `GET`  | `/reports/top-items` | Admin |

Query params: `from=YYYY-MM-DD`, `to=YYYY-MM-DD`

## Date-range filter

Build the WHERE clause dynamically; values are always bound parameters — never interpolated:

```ts
function buildDateFilter(
  from: string | null,
  to: string | null,
): { where: string; params: string[] } {
  const conditions: string[] = [];
  const params: string[] = [];
  if (from !== null) {
    conditions.push('created_at >= ?');
    params.push(from);
  }
  if (to !== null) {
    conditions.push('created_at <= ?');
    params.push(to + 'T23:59:59Z');
  }
  return {
    where: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
  };
}
```

## Date validation

Reject non-ISO-8601 dates **before** they reach the query:

```ts
function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(date);
}

// In handler
const from = searchParams.get('from');
const to = searchParams.get('to');
if (from && !isValidDate(from)) {
  throw new ValidationException([
    new ValidationError('from', 'invalid date format', 'invalid_value'),
  ]);
}
if (to && !isValidDate(to)) {
  throw new ValidationException([
    new ValidationError('to', 'invalid date format', 'invalid_value'),
  ]);
}
```

## Summary report

```ts
app.get('/reports/summary', async (c) => {
  requireAdmin(c);
  const { where, params } = buildDateFilter(c.req.query('from') ?? null, c.req.query('to') ?? null);
  const row = await executor.fetchOne(
    `SELECT
       COUNT(*) AS total_orders,
       COALESCE(SUM(amount), 0) AS total_revenue,
       COALESCE(AVG(amount), 0) AS avg_order_value,
       COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count
     FROM orders ${where}`,
    params,
  );
  return c.json(row);
});
```

`COALESCE(..., 0)` ensures zero-row queries return `0` instead of `null`.

## Daily breakdown

```ts
const rows = await executor.fetchAll(
  `SELECT DATE(created_at) AS date,
          COUNT(*) AS order_count,
          COALESCE(SUM(amount), 0) AS revenue
   FROM orders ${where}
   GROUP BY DATE(created_at)
   ORDER BY date ASC`,
  params,
);
```

## Top items by revenue

```ts
// Limit clamping: server-side, not from client
const limit = Math.min(Math.max(Number(c.req.query('limit') ?? 10), 1), 100);

const rows = await executor.fetchAll(
  `SELECT item_name,
          COUNT(*) AS order_count,
          COALESCE(SUM(amount), 0) AS total_revenue
   FROM orders ${where}
   GROUP BY item_name
   ORDER BY total_revenue DESC
   LIMIT ?`,
  [...params, limit],
);
```

## Security checklist

| Check                         | Pattern                                       |
| ----------------------------- | --------------------------------------------- |
| Date injection                | Validate format + parse before using in query |
| SQL injection via `from`/`to` | Parameterized queries only; never interpolate |
| Admin-only access             | JWT role check before any query               |
| Limit DoS                     | Clamp limit server-side                       |

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| JWT claims     | `c.get('authClaims')`                    |
| UTC timestamps | `utcNowIso`                              |
| Validation     | `ValidationException`, `ValidationError` |
