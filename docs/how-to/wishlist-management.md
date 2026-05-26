# Wishlist Management

Priority-annotated wishlist with idempotent item add and existence-privacy. Similar to Content Collection (FT149) but without position ordering.

## Endpoints

| Method   | Path                              | Auth                             |
| -------- | --------------------------------- | -------------------------------- |
| `POST`   | `/wishlists`                      | Required                         |
| `GET`    | `/wishlists/:id`                  | Optional (public visible to all) |
| `PUT`    | `/wishlists/:id`                  | Owner only                       |
| `DELETE` | `/wishlists/:id`                  | Owner only                       |
| `POST`   | `/wishlists/:id/items`            | Owner only                       |
| `DELETE` | `/wishlists/:id/items/:productId` | Owner only                       |

## Schema

```sql
CREATE TABLE wishlists (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id   TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  is_public  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

CREATE TABLE wishlist_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  wishlist_id INTEGER NOT NULL REFERENCES wishlists(id),
  product_id  INTEGER NOT NULL,
  priority    TEXT    NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('high', 'medium', 'low')),
  note        TEXT,
  added_at    TEXT    NOT NULL,
  UNIQUE (wishlist_id, product_id)
);
```

No `position` column — this is the key difference from Content Collection (FT149).

## Existence-privacy pattern

Identical to Content Collection: GET returns 404 for non-public, non-owner. Mutations return 403.

```ts
// GET /wishlists/:id
const wishlist = await repo.findById(id);
if (!wishlist) throw new WishlistNotFoundError(id);

const isOwner = wishlist.ownerId === authSubFromContext(c);
const isPublic = wishlist.isPublic;

if (!isPublic && !isOwner) throw new WishlistNotFoundError(id); // 404 — hide existence

// PUT/DELETE/POST items
assertResourceOwner(wishlist.ownerId, authSubFromContext(c)); // 403 if not owner
```

## Idempotent item add (201 / 200)

```ts
async addItem(wishlistId: number, productId: number, priority: string, note: string | null, ownerId: string) {
  const wishlist = await this.repo.findById(wishlistId);
  if (!wishlist) throw new WishlistNotFoundError(wishlistId);
  assertResourceOwner(wishlist.ownerId, ownerId);

  const existing = await this.repo.findItem(wishlistId, productId);
  if (existing) {
    return { status: 200 as const, item: existing };  // already in wishlist
  }

  const item = await this.repo.addItem(wishlistId, productId, priority, note);
  return { status: 201 as const, item };
}
```

## Priority fallback validation

Accept only `'high'`, `'medium'`, `'low'`. Reject or default silently:

```ts
// Reject unknown values (recommended — explicit contract)
const VALID_PRIORITIES = ['high', 'medium', 'low'] as const;
if (!VALID_PRIORITIES.includes(body.priority)) {
  throw new ValidationException([{ field: 'priority', message: 'must be high, medium, or low' }]);
}

// — OR — default to 'medium' for missing/unknown (lenient)
const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : 'medium';
```

## Framework features used

| Feature          | Import                                   |
| ---------------- | ---------------------------------------- |
| JWT sub          | `authSubFromContext`                     |
| BOLA ownership   | `assertResourceOwner`                    |
| 403 handler      | `createResourceAccessDeniedHandler`      |
| UTC timestamp    | `utcNowIso`                              |
| Validation error | `ValidationException`, `ValidationError` |
