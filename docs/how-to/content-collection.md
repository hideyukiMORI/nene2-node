# Content Collection

Curated article collection system with public/private visibility, idempotent item add, and position compaction. Demonstrates existence-privacy (IDOR prevention), BOLA ownership checks, and idempotent nested-resource writes.

## Endpoints

| Method   | Path                                | Auth                             |
| -------- | ----------------------------------- | -------------------------------- |
| `POST`   | `/collections`                      | Required                         |
| `GET`    | `/collections/:id`                  | Optional (public visible to all) |
| `PUT`    | `/collections/:id`                  | Owner only                       |
| `DELETE` | `/collections/:id`                  | Owner only                       |
| `POST`   | `/collections/:id/items`            | Owner only                       |
| `DELETE` | `/collections/:id/items/:articleId` | Owner only                       |

## Schema

```sql
CREATE TABLE collections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id   TEXT    NOT NULL,           -- JWT sub
  name       TEXT    NOT NULL,
  is_public  INTEGER NOT NULL DEFAULT 0, -- 0 = private, 1 = public
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

CREATE TABLE collection_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL REFERENCES collections(id),
  article_id    INTEGER NOT NULL,
  position      INTEGER NOT NULL,
  added_at      TEXT    NOT NULL,
  UNIQUE (collection_id, article_id)
);
```

## Existence-privacy pattern (GET → 404, mutations → 403)

Non-public collections return **404** to unauthenticated or non-owner callers on GET. Returning 403 would confirm the collection exists. For mutation routes (PUT/DELETE/POST items) use 403 to signal "permission denied" explicitly.

```ts
// In your UseCase or Handler
const ownerId = authSubFromContext(c); // from nene2-framework

// GET — existence-privacy
if (!collection.isPublic && collection.ownerId !== ownerId) {
  throw new CollectionNotFoundError(id); // → 404
}

// PUT/DELETE/POST items — ownership
assertResourceOwner(collection.ownerId, ownerId); // → ResourceAccessDeniedError → 403
```

Register the handler in `createApp`:

```ts
import {
  assertResourceOwner,
  authSubFromContext,
  createResourceAccessDeniedHandler,
  createSimpleDomainHandler,
} from '@hideyukimori/nene2-framework';

// In your wire function
app.use(createResourceAccessDeniedHandler());
app.use(createSimpleDomainHandler('collection-not-found', 404, 'Collection not found'));
```

## Idempotent item add (201 / 200)

Check for an existing item before inserting. Run the capacity check only for genuinely new items.

```ts
// CollectionItemUseCase.addItem
async addItem(collectionId: number, articleId: number, ownerId: string) {
  const collection = await this.repo.findById(collectionId);
  if (!collection) throw new CollectionNotFoundError(collectionId);
  assertResourceOwner(collection.ownerId, ownerId);

  const existing = await this.repo.findItem(collectionId, articleId);
  if (existing) {
    return { status: 200, articleId };  // idempotent — already added
  }

  const count = await this.repo.countItems(collectionId);
  if (count >= 50) throw new CollectionFullError();

  await this.repo.addItem(collectionId, articleId);
  return { status: 201, articleId };
}
```

In the handler, use the returned `status` directly:

```ts
const result = await useCase.addItem(id, body.articleId, authSubFromContext(c));
return c.json({ message: 'ok', articleId: result.articleId }, result.status);
```

## Position compact after delete

When an item is removed, shift later positions down to prevent gaps.

```ts
// In SqliteCollectionRepository
async removeItem(collectionId: number, articleId: number): Promise<void> {
  const item = await this.findItem(collectionId, articleId);
  if (!item) throw new CollectionItemNotFoundError();

  await this.executor.execute(
    'DELETE FROM collection_items WHERE collection_id = ? AND article_id = ?',
    [collectionId, articleId],
  );
  // Close the gap
  await this.executor.execute(
    'UPDATE collection_items SET position = position - 1 WHERE collection_id = ? AND position > ?',
    [collectionId, item.position],
  );
}
```

## Nested route parameter extraction

For `DELETE /collections/:id/items/:articleId`, Hono makes both params available:

```ts
app.delete('/collections/:id/items/:articleId', async (c) => {
  const id = Number(c.req.param('id'));
  const articleId = Number(c.req.param('articleId'));
  // ...
});
```

## Duplicate-add as 409 (alternative via DB constraint)

If you prefer to let the DB enforce uniqueness and return 409 automatically, use
`classifyDatabaseError` from nene2-framework which maps UNIQUE violations to 409:

```ts
import { classifyDatabaseError } from '@hideyukimori/nene2-framework';

try {
  await executor.execute('INSERT INTO collection_items ...', [...]);
} catch (err) {
  const kind = classifyDatabaseError(err);
  if (kind === 'unique-violation') return c.json({ error: 'already added' }, 409);
  throw err;
}
```

Choose the **application-layer check** (findItem first) when you want clean 201/200
differentiation. Choose the **DB constraint** approach when you want simplicity and
don't need to distinguish new vs. already-added.

## Framework features used

| Feature                        | Import                              |
| ------------------------------ | ----------------------------------- |
| JWT sub extraction             | `authSubFromContext`                |
| BOLA ownership check           | `assertResourceOwner`               |
| 403 handler                    | `createResourceAccessDeniedHandler` |
| UNIQUE violation → 409         | `classifyDatabaseError`             |
| UTC timestamp                  | `utcNowIso`                         |
| Transaction (delete + compact) | `runTransaction`                    |
