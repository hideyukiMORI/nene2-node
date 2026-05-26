# Cursor Pagination

Efficient, stable pagination for chronological or ID-ordered feeds using a cursor (last-seen ID) instead of an offset. Avoids the drift problem of offset pagination when rows are inserted during browsing.

## When to use cursor vs offset

|                      | Offset (`parsePaginationQuery`)              | Cursor (`parseCursorQuery`)        |
| -------------------- | -------------------------------------------- | ---------------------------------- |
| Use case             | Admin lists, search results, sortable tables | Feeds, timelines, infinite scroll  |
| Stable under inserts | ❌ rows shift, duplicates or gaps            | ✅ cursor anchors to a specific ID |
| Random access        | ✅ jump to any page                          | ❌ must walk from start            |
| Default limit        | 20                                           | 10                                 |

## Import

```ts
import { parseCursorQuery, type CursorQuery } from '@hideyukimori/nene2-framework';
```

## Interface

```ts
interface CursorQuery {
  cursor: number | undefined; // undefined = first page
  limit: number;
}

function parseCursorQuery(
  searchParams: URLSearchParams,
  defaults?: { defaultLimit?: number; maxLimit?: number },
): CursorQuery;
```

## Query parameters

| Param       | Meaning                                   | Invalid input                             |
| ----------- | ----------------------------------------- | ----------------------------------------- |
| `?cursor=N` | Return items with `id < N` (last seen ID) | Silently returns `undefined` → first page |
| `?limit=N`  | Page size, 1–100 (default 10)             | Throws `ValidationException`              |

The `cursor` failure mode is intentionally lenient: absent, empty, zero, negative, non-numeric, and float values all silently produce `undefined`. This matches the PHP NENE2 `ctype_digit` convention and allows clients to safely omit the cursor on the first request.

## Handler pattern

```ts
app.get('/events', async (c) => {
  const { cursor, limit } = parseCursorQuery(new URL(c.req.url).searchParams);

  const items = cursor
    ? await repo.listBefore(cursor, limit + 1) // fetch one extra to detect next page
    : await repo.listFirst(limit + 1);

  const hasMore = items.length > limit;
  if (hasMore) items.pop(); // remove the extra item

  const nextCursor = hasMore ? (items.at(-1)?.id ?? null) : null;

  return c.json({ items, next_cursor: nextCursor, has_more: hasMore });
});
```

## Repository pattern

```ts
async listBefore(cursor: number, count: number): Promise<Event[]> {
  const rows = await executor.fetchAll(
    'SELECT * FROM events WHERE id < ? ORDER BY id DESC LIMIT ?',
    [cursor, count],
  );
  return rows.map(mapRow);
}

async listFirst(count: number): Promise<Event[]> {
  const rows = await executor.fetchAll(
    'SELECT * FROM events ORDER BY id DESC LIMIT ?',
    [count],
  );
  return rows.map(mapRow);
}
```

The `LIMIT limit+1` trick avoids a separate COUNT query: if the DB returns more than `limit` rows, there is a next page.

## Response shape

```json
{
  "items": [
    { "id": 10, "type": "follow", "actor_id": "u2", "created_at": "2026-01-02T00:00:00Z" },
    { "id": 9, "type": "like", "actor_id": "u3", "created_at": "2026-01-01T00:00:00Z" }
  ],
  "next_cursor": 9,
  "has_more": true
}
```

The client passes `?cursor=9` on the next request to continue.  
When `has_more` is `false`, `next_cursor` is `null` — no further pages.

## Custom limits

```ts
// Smaller feed: default 5, max 20
const { cursor, limit } = parseCursorQuery(searchParams, { defaultLimit: 5, maxLimit: 20 });
```

## Framework features used

| Feature           | Import                                    |
| ----------------- | ----------------------------------------- |
| Cursor pagination | `parseCursorQuery`, `CursorQuery`         |
| Offset pagination | `parsePaginationQuery`, `PaginationQuery` |
| Validation error  | `ValidationException`, `ValidationError`  |
