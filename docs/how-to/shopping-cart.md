# Shopping Cart

Per-user cart with quantity-accumulating add (idempotent), `quantity=0` delete shorthand, and per-product item totals. Cart is ephemeral — prices are read from the `products` table at query time, not snapshotted into the cart.

## Endpoints

| Method   | Path                     | Auth     |
| -------- | ------------------------ | -------- |
| `GET`    | `/cart`                  | Required |
| `POST`   | `/cart/items`            | Required |
| `PUT`    | `/cart/items/:productId` | Required |
| `DELETE` | `/cart/items/:productId` | Required |
| `DELETE` | `/cart`                  | Required |

## Schema

```sql
CREATE TABLE cart_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT    NOT NULL,  -- JWT sub
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  added_at   TEXT    NOT NULL,
  updated_at TEXT    NOT NULL,
  UNIQUE (user_id, product_id)
);
```

Design notes:

- `UNIQUE (user_id, product_id)` — one row per product per user; re-adding accumulates quantity
- `CHECK (quantity > 0)` — zero-quantity rows are impossible; `quantity=0` PUT deletes instead
- Price is joined from a `products` table at read time — no price snapshot needed for ephemeral carts

## Idempotent add (quantity accumulation)

POST `/cart/items` with an already-present `product_id` adds to the existing quantity (200), not a new row (201).

```ts
async addItem(userId: string, productId: number, quantity: number): Promise<{ status: 200 | 201; item: CartItem }> {
  const existing = await this.repo.findCartItem(userId, productId);
  const now = utcNowIso();

  if (existing) {
    const newQty = existing.quantity + quantity;
    await this.repo.updateQuantity(userId, productId, newQty, now);
    return { status: 200, item: { ...existing, quantity: newQty, updatedAt: now } };
  }

  const item = await this.repo.insert(userId, productId, quantity, now);
  return { status: 201, item };
}
```

In the handler:

```ts
const result = await useCase.addItem(userId, body.productId, body.quantity);
return c.json(result.item, result.status);
```

## `quantity=0` deletes the item

PUT `/cart/items/:productId` with `quantity: 0` removes the item and returns 204. This is more ergonomic than forcing clients to switch between PUT and DELETE:

```ts
app.put('/cart/items/:productId', async (c) => {
  const productId = Number(c.req.param('productId'));
  const body = await c.req.json();
  const quantity = validateQuantityAllowZero(body.quantity); // integer >= 0

  const userId = authSubFromContext(c);

  if (quantity === 0) {
    await cartRepo.removeItem(userId, productId);
    return c.body(null, 204);
  }

  await cartRepo.updateQuantity(userId, productId, quantity, utcNowIso());
  return c.json({ message: 'updated' });
});
```

## Integer quantity validation

Reject floats and strings. `Number.isInteger` covers both:

```ts
function validateQuantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ValidationException([
      new ValidationError('quantity', 'quantity must be an integer', 'invalid_type'),
    ]);
  }
  if (value < 1) {
    throw new ValidationException([
      new ValidationError('quantity', 'quantity must be at least 1', 'out_of_range'),
    ]);
  }
  return value;
}
```

| Input | Result                             |
| ----- | ---------------------------------- |
| `3`   | ✅                                 |
| `2.5` | 422                                |
| `"2"` | 422                                |
| `0`   | 422 (use DELETE or PUT quantity=0) |
| `-1`  | 422                                |

## Cart totals (GET /cart)

Join items with product prices and compute per-item subtotals and cart total in the application layer:

```ts
async getCart(userId: string): Promise<CartResponse> {
  const rows = await executor.fetchAll(
    `SELECT ci.id, ci.product_id, ci.quantity, ci.added_at, ci.updated_at,
            p.name AS product_name, p.price
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.added_at ASC, ci.id ASC`,
    [userId],
  );

  const items = rows.map((row) => ({
    id: Number(row['id']),
    productId: Number(row['product_id']),
    productName: String(row['product_name']),
    price: Number(row['price']),
    quantity: Number(row['quantity']),
    subtotal: Number(row['price']) * Number(row['quantity']),
    addedAt: String(row['added_at']),
    updatedAt: String(row['updated_at']),
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total, count: items.length };
}
```

## Cart isolation between users

The `WHERE user_id = ?` filter ensures each user's cart is independent. Never accept `user_id` from the request body — always read it from the JWT:

```ts
const userId = authSubFromContext(c); // from JWT sub — cannot be spoofed
```

## Framework features used

| Feature          | Import                                   |
| ---------------- | ---------------------------------------- |
| JWT sub          | `authSubFromContext`                     |
| UTC timestamps   | `utcNowIso`                              |
| Validation error | `ValidationException`, `ValidationError` |
