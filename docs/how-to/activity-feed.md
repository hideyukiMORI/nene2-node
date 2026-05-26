# Activity Feed

Per-user social activity feed (follows, likes, comments, etc.) with cursor-based pagination and self-or-admin access control.

## Endpoints

| Method | Path                  | Auth             |
| ------ | --------------------- | ---------------- |
| `GET`  | `/users/:userId/feed` | Self or admin    |
| `POST` | `/users/:userId/feed` | Service or admin |

## Schema

```sql
CREATE TABLE feed_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT    NOT NULL,  -- owner of this feed entry (JWT sub)
  type       TEXT    NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'mention')),
  actor_id   TEXT    NOT NULL,  -- who triggered the event
  target_id  TEXT,              -- optional: target resource ID
  created_at TEXT    NOT NULL
);

CREATE INDEX idx_feed_events_user_id_id ON feed_events (user_id, id DESC);
```

The composite index on `(user_id, id DESC)` ensures the `WHERE user_id = ? AND id < ?` cursor query is a fast index scan.

## Access control (self or admin)

```ts
function assertSelfOrAdmin(c: Context, userId: string): void {
  const claims = c.get('authClaims');
  const sub = authSubFromContext(c);
  if (sub !== userId && claims?.['role'] !== 'admin') {
    throw new ResourceAccessDeniedError();
  }
}
```

## Cursor-paginated GET handler

```ts
import { parseCursorQuery } from '@hideyukimori/nene2-framework';

app.get('/users/:userId/feed', async (c) => {
  const userId = c.req.param('userId');
  assertSelfOrAdmin(c, userId);

  const { cursor, limit } = parseCursorQuery(new URL(c.req.url).searchParams);

  const items = await feedRepo.list(userId, cursor, limit + 1);
  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  const nextCursor = hasMore ? (items.at(-1)?.id ?? null) : null;

  return c.json({ items, next_cursor: nextCursor, has_more: hasMore });
});
```

## Repository

```ts
class SqliteFeedRepository {
  async list(userId: string, cursor: number | undefined, count: number): Promise<FeedEvent[]> {
    const rows = cursor
      ? await this.executor.fetchAll(
          'SELECT * FROM feed_events WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT ?',
          [userId, cursor, count],
        )
      : await this.executor.fetchAll(
          'SELECT * FROM feed_events WHERE user_id = ? ORDER BY id DESC LIMIT ?',
          [userId, count],
        );
    return rows.map(mapFeedRow);
  }
}
```

## POST — append a feed event

```ts
app.post('/users/:userId/feed', async (c) => {
  // Service-to-service or admin only — enforce via JWT role check
  requireAdmin(c);

  const userId = c.req.param('userId');
  const body = await c.req.json();
  // validate body.type, body.actor_id, body.target_id ...

  const id = await feedRepo.insert({
    userId,
    type: body.type,
    actorId: body.actor_id,
    targetId: body.target_id ?? null,
    createdAt: utcNowIso(),
  });

  return c.json({ id }, 201);
});
```

## Sample response

```json
{
  "items": [
    {
      "id": 42,
      "type": "like",
      "actor_id": "u7",
      "target_id": "post:88",
      "created_at": "2026-05-27T10:00:00Z"
    },
    {
      "id": 41,
      "type": "follow",
      "actor_id": "u3",
      "target_id": null,
      "created_at": "2026-05-27T09:55:00Z"
    },
    {
      "id": 40,
      "type": "comment",
      "actor_id": "u5",
      "target_id": "post:80",
      "created_at": "2026-05-27T09:50:00Z"
    }
  ],
  "next_cursor": 40,
  "has_more": true
}
```

Next page: `GET /users/u1/feed?cursor=40&limit=3`

## Framework features used

| Feature           | Import                              |
| ----------------- | ----------------------------------- |
| Cursor pagination | `parseCursorQuery`                  |
| JWT sub           | `authSubFromContext`                |
| Admin role check  | `c.get('authClaims')`               |
| 403 handler       | `createResourceAccessDeniedHandler` |
| UTC timestamps    | `utcNowIso`                         |
