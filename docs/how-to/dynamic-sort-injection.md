# How-to: dynamic sort/filter with ORDER BY injection prevention

`ORDER BY` clauses **cannot** use parameterized bind values — the column name is
interpolated directly into SQL. So a sortable list endpoint must validate the
column and direction against a strict **allowlist** before interpolation.
`parseSortQuery` does exactly this.

> Parity: PHP NENE2 FT341 (`sortlog`). node FT179. Proven by the
> `ft179-sort-injection` sandbox attack matrix.

## Endpoint

```
GET /articles?sort=created_at&order=desc&status=published&limit=20
```

| Param    | Allowed                               | Default      |
| -------- | ------------------------------------- | ------------ |
| `sort`   | `id`, `title`, `status`, `created_at` | `created_at` |
| `order`  | `asc`, `desc`                         | `desc`       |
| `status` | `draft`, `published`, `archived`      | (all)        |
| `limit`  | 1–100                                 | 20           |

## Usage

```ts
import { parseSortQuery, parsePaginationQuery } from '@hideyukimori/nene2-framework';

app.get('/articles', (c) => {
  const { searchParams } = new URL(c.req.url);

  const { column, order } = parseSortQuery(searchParams, {
    columns: ['id', 'title', 'status', 'created_at'],
    defaultColumn: 'created_at', // must be in columns
    // defaultOrder: 'desc'      // optional
  });
  const { limit, offset } = parsePaginationQuery(searchParams);

  // column & order come from the allowlist → safe to interpolate.
  // WHERE values still use ? placeholders.
  const sql = `SELECT * FROM articles ORDER BY ${column} ${order} LIMIT ? OFFSET ?`;
  return c.json(/* … */);
});
```

`parseSortQuery` throws `ValidationException` (→ 422) when `sort` or `order` is
present but not in the allowlist. `createApp`'s error handler renders it as a
`validation-failed` Problem Details response automatically.

## Why allowlist, not regex

```ts
columns.includes(sort); // ✅ O(n), case-sensitive, no backtracking
```

- **`Array.includes` is O(n)** and short-circuits — immune to ReDoS on long
  attacker payloads. A 50,000-char `sort` value is rejected in ~2 ms.
- A regex like `/^[a-z_]+$/` can backtrack catastrophically **and** still admits
  unknown column names such as `password`.
- The match is **case-sensitive by design**: `ORDER BY CREATED_AT` is valid SQL,
  so `sort=Created_At` must be rejected, not silently accepted.

## Rejected payloads (all → 422)

| Vector            | Example                                    |
| ----------------- | ------------------------------------------ |
| SQL injection     | `sort='; DROP TABLE articles--`            |
| UNION             | `sort=id UNION SELECT 1,2,3`               |
| Subquery          | `sort=(SELECT name FROM sqlite_master)`    |
| Comment / null    | `sort=created_at--`, `sort=created_at%00`  |
| Whitespace bypass | `sort=%20created_at`, `sort=created_at%09` |
| Column index      | `sort=1`                                   |
| Wrong case        | `sort=Created_At`                          |
| Direction inject  | `order=asc; UNION SELECT 1,2--`            |
| Status filter     | `status=' OR '1'='1`                       |

The `status` filter value goes into a `WHERE status = ?` placeholder, but it
should still be allowlisted so only known states reach the query — validate it
the same way (an inline allowlist throwing `ValidationException`).

## What NOT to do

| Anti-pattern                          | Risk                                                |
| ------------------------------------- | --------------------------------------------------- |
| `ORDER BY ${sort}` with no validation | Full `ORDER BY` injection                           |
| Regex `/^[a-z_]+$/` only              | ReDoS; admits unknown columns (`password`)          |
| Case-insensitive compare              | `ORDER BY CREATED_AT` bypasses case-sensitive tests |
| Bind `ORDER BY ?`                     | Drivers treat it as a literal or throw              |
| Allowlist `sort` but not `order`      | `order=asc; UNION …` bypasses the column check      |
