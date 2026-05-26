# Product Review & Rating System

Per-product reviews with a strict one-user-one-product uniqueness constraint, integer rating validation, aggregate summary (average + star distribution), and cursor-paginated listing.

## Endpoints

| Method   | Path                                     | Auth       |
| -------- | ---------------------------------------- | ---------- |
| `POST`   | `/products/:productId/reviews`           | Required   |
| `GET`    | `/products/:productId/reviews`           | Required   |
| `GET`    | `/products/:productId/reviews/summary`   | Required   |
| `PUT`    | `/products/:productId/reviews/:reviewId` | Owner only |
| `DELETE` | `/products/:productId/reviews/:reviewId` | Owner only |

## Schema

```sql
CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id    TEXT    NOT NULL,  -- JWT sub
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body       TEXT,
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL,
  UNIQUE (product_id, user_id)
);
```

`UNIQUE (product_id, user_id)` prevents double-reviews at the DB level.  
`CHECK (rating >= 1 AND rating <= 5)` prevents out-of-range ratings.

## One review per user per product

Check before inserting; re-submission after deletion is allowed (the UNIQUE row is gone).

```ts
async create(productId: number, userId: string, rating: number, body: string | null) {
  const existing = await this.repo.findByProductAndUser(productId, userId);
  if (existing) throw new ReviewAlreadyExistsError(); // → 409

  const now = utcNowIso();
  return this.repo.insert({ productId, userId, rating, body, createdAt: now, updatedAt: now });
}
```

Alternatively, rely on the DB constraint and catch the UNIQUE violation:

```ts
try {
  await executor.execute('INSERT INTO reviews ...', [...]);
} catch (err) {
  if (classifyDatabaseError(err) === 'unique-violation') throw new ReviewAlreadyExistsError();
  throw err;
}
```

## Integer rating validation

The `rating` field must be a whole integer in `[1, 5]`. Reject floats (JSON `4.5`) and strings.

```ts
function validateRating(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ValidationException([
      new ValidationError('rating', 'Rating must be an integer.', 'required'),
    ]);
  }
  if (value < 1 || value > 5) {
    throw new ValidationException([
      new ValidationError('rating', 'Rating must be between 1 and 5.', 'out_of_range'),
    ]);
  }
  return value;
}
```

| Input   | Result               |
| ------- | -------------------- |
| `5`     | ✅                   |
| `4.5`   | 422 — not an integer |
| `0`     | 422 — out of range   |
| `6`     | 422 — out of range   |
| missing | 422                  |

## Rating summary (average + distribution)

```ts
async getSummary(productId: number): Promise<ReviewSummary> {
  const aggRow = await executor.fetchOne(
    'SELECT COUNT(*) AS total, AVG(rating) AS avg_rating FROM reviews WHERE product_id = ?',
    [productId],
  );

  const total = Number(aggRow?.['total'] ?? 0);
  const avgRating = total > 0 ? Number(aggRow?.['avg_rating']) : null;

  // Star distribution: one query per star, or a single GROUP BY
  const distRows = await executor.fetchAll(
    'SELECT rating, COUNT(*) AS cnt FROM reviews WHERE product_id = ? GROUP BY rating',
    [productId],
  );
  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const row of distRows) {
    distribution[String(row['rating'])] = Number(row['cnt']);
  }

  return { total, avgRating, distribution };
}
```

Response example:

```json
{
  "total": 150,
  "avg_rating": 4.23,
  "distribution": { "1": 5, "2": 8, "3": 20, "4": 52, "5": 65 }
}
```

When there are zero reviews: `"avg_rating": null`.

## Ownership check with product cross-check

For `PUT /products/:productId/reviews/:reviewId`, verify both resource ownership **and** that the review belongs to the specified product:

```ts
const review = await repo.findById(reviewId);
if (!review || review.productId !== productId) {
  throw new ReviewNotFoundError(reviewId); // 404 — hide existence of other products' reviews
}
assertResourceOwner(review.userId, authSubFromContext(c)); // 403
```

The `productId` cross-check prevents an attacker from editing a review of another product by guessing its ID.

## Cursor-paginated listing

```ts
app.get('/products/:productId/reviews', async (c) => {
  const productId = Number(c.req.param('productId'));
  const { cursor, limit } = parseCursorQuery(new URL(c.req.url).searchParams);

  const items = await reviewRepo.list(productId, cursor, limit + 1);
  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  return c.json({
    items,
    next_cursor: hasMore ? (items.at(-1)?.id ?? null) : null,
    has_more: hasMore,
  });
});
```

Repository:

```ts
async list(productId: number, cursor: number | undefined, count: number): Promise<Review[]> {
  const rows = cursor
    ? await executor.fetchAll(
        'SELECT * FROM reviews WHERE product_id = ? AND id < ? ORDER BY id DESC LIMIT ?',
        [productId, cursor, count],
      )
    : await executor.fetchAll(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC LIMIT ?',
        [productId, count],
      );
  return rows.map(mapRow);
}
```

## Framework features used

| Feature                | Import                                   |
| ---------------------- | ---------------------------------------- |
| Cursor pagination      | `parseCursorQuery`                       |
| JWT sub                | `authSubFromContext`                     |
| BOLA ownership         | `assertResourceOwner`                    |
| 403 handler            | `createResourceAccessDeniedHandler`      |
| UNIQUE violation → 409 | `classifyDatabaseError`                  |
| UTC timestamps         | `utcNowIso`                              |
| Validation             | `ValidationException`, `ValidationError` |
