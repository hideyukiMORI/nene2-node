# Coupon / Promo Code System

Admin-controlled coupon system with per-user usage limits, expiry, and admin RBAC. Demonstrates role-gated endpoints, state-check ordering, and UNIQUE-constraint idempotency.

## Endpoints

| Method   | Path                  | Auth  |
| -------- | --------------------- | ----- |
| `POST`   | `/coupons`            | admin |
| `GET`    | `/coupons/:code`      | Any   |
| `POST`   | `/coupons/:code/use`  | User  |
| `GET`    | `/coupons/:code/uses` | admin |
| `DELETE` | `/coupons/:code`      | admin |

## Schema

```sql
CREATE TABLE coupons (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT    NOT NULL UNIQUE,
  discount_pct INTEGER NOT NULL CHECK (discount_pct >= 1 AND discount_pct <= 100),
  max_uses     INTEGER NOT NULL DEFAULT 0,  -- 0 = unlimited
  use_count    INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  expires_at   TEXT,                        -- ISO-8601 or NULL
  created_by   TEXT    NOT NULL,            -- JWT sub
  created_at   TEXT    NOT NULL
);

CREATE TABLE coupon_uses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id  INTEGER NOT NULL REFERENCES coupons(id),
  user_id    TEXT    NOT NULL,  -- JWT sub
  used_at    TEXT    NOT NULL,
  UNIQUE (coupon_id, user_id)   -- one use per user per coupon
);
```

## Admin RBAC via JWT claims

Extract the `role` claim from `authClaims` set by `bearerTokenMiddleware`:

```ts
import { authSubFromContext } from '@hideyukimori/nene2-framework';

function requireAdmin(c: Context): void {
  const claims = c.get('authClaims');
  if (claims?.['role'] !== 'admin') {
    throw new ForbiddenError(); // → ResourceAccessDeniedError → 403
  }
}

// In handler
app.post('/coupons', async (c) => {
  requireAdmin(c);
  // ...
});
```

## State-check ordering for coupon use

Always check in this order to avoid leaking information and to fail fast:

```ts
// 1. Coupon exists?
const coupon = await repo.findByCode(code);
if (!coupon) throw new CouponNotFoundError(); // 404

// 2. Active?
if (!coupon.isActive) throw new CouponInactiveError(); // 422

// 3. Expired?
if (coupon.expiresAt && coupon.expiresAt < utcNowIso()) {
  throw new CouponExpiredError(); // 422
}

// 4. Already used by this user?
const alreadyUsed = await repo.findUse(coupon.id, userId);
if (alreadyUsed) throw new CouponAlreadyUsedError(); // 409

// 5. Usage limit reached?
if (coupon.maxUses > 0 && coupon.useCount >= coupon.maxUses) {
  throw new CouponLimitReachedError(); // 422
}

// All checks passed — record use atomically
await runTransaction(txManager, async (conn) => {
  await conn.execute('INSERT INTO coupon_uses (coupon_id, user_id, used_at) VALUES (?, ?, ?)', [
    coupon.id,
    userId,
    utcNowIso(),
  ]);
  await conn.execute('UPDATE coupons SET use_count = use_count + 1 WHERE id = ?', [coupon.id]);
});
```

## Preventing user_id injection

Never accept `user_id` from the request body. Always read from JWT:

```ts
const userId = authSubFromContext(c); // from JWT sub — cannot be spoofed
```

## Idempotency via UNIQUE constraint

`UNIQUE (coupon_id, user_id)` prevents double-use at the DB level. Catch the error with `classifyDatabaseError`:

```ts
import { classifyDatabaseError } from '@hideyukimori/nene2-framework';

try {
  await executor.execute('INSERT INTO coupon_uses ...', [...]);
} catch (err) {
  if (classifyDatabaseError(err) === 'unique-violation') {
    throw new CouponAlreadyUsedError();  // 409
  }
  throw err;
}
```

## Framework features used

| Feature                       | Import                              |
| ----------------------------- | ----------------------------------- |
| JWT sub (user ID)             | `authSubFromContext`                |
| Role check                    | `c.get('authClaims')`               |
| 403 for non-admin             | `createResourceAccessDeniedHandler` |
| Atomic use + count increment  | `runTransaction`                    |
| UNIQUE violation → 409        | `classifyDatabaseError`             |
| UTC timestamps + expiry check | `utcNowIso`, `parseUtcIsoTimestamp` |
