# Points / Loyalty System

Earn, spend, and adjust points with idempotent transactions, multi-layer balance protection, and admin-only adjustment. Balance is derived solely from the transaction ledger.

## Endpoints

| Method | Path                            | Auth          |
| ------ | ------------------------------- | ------------- |
| `GET`  | `/users/:userId/points`         | Self or admin |
| `GET`  | `/users/:userId/points/history` | Self or admin |
| `POST` | `/users/:userId/points/earn`    | Self or admin |
| `POST` | `/users/:userId/points/spend`   | Self or admin |
| `POST` | `/users/:userId/points/adjust`  | Admin only    |

## Schema

```sql
CREATE TABLE point_transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT    NOT NULL,  -- JWT sub
  type          TEXT    NOT NULL CHECK (type IN ('earn', 'spend', 'adjust', 'expire')),
  amount        INTEGER NOT NULL CHECK (amount > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  description   TEXT    NOT NULL,
  reference_id  TEXT    UNIQUE,  -- idempotency key (nullable)
  created_at    TEXT    NOT NULL
);
```

`CHECK (amount > 0)` prevents zero/negative amounts at the DB level.  
`CHECK (balance_after >= 0)` prevents the balance going negative at the DB level.

## Balance from ledger (no separate balance column)

```ts
async getBalance(userId: string): Promise<number> {
  const row = await executor.fetchOne(
    'SELECT balance_after FROM point_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userId],
  );
  return row ? Number(row['balance_after']) : 0;
}
```

The latest `balance_after` is the current balance — no separate `users.balance` column to keep in sync.

## Idempotent transactions via `reference_id`

```ts
async earn(userId: string, amount: number, description: string, referenceId?: string) {
  // Check for existing transaction with same reference
  if (referenceId) {
    const existing = await executor.fetchOne(
      'SELECT id, balance_after FROM point_transactions WHERE reference_id = ?',
      [referenceId],
    );
    if (existing) return existing;  // idempotent — return original result
  }

  const balance = await this.getBalance(userId);
  const balanceAfter = balance + amount;

  return runTransaction(txManager, async (conn) => {
    const id = await conn.insert(
      'INSERT INTO point_transactions (user_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 'earn', amount, balanceAfter, description, referenceId ?? null, utcNowIso()],
    );
    return { id, balanceAfter };
  });
}
```

Using `UNIQUE reference_id` as the DB idempotency key. On duplicate insert, `classifyDatabaseError` maps to 409.

## Multi-layer balance protection

```ts
async spend(userId: string, amount: number, description: string) {
  const balance = await this.getBalance(userId);

  // Layer 1 — application check (fast, user-friendly error)
  if (balance < amount) throw new InsufficientPointsError(balance, amount);

  return runTransaction(txManager, async (conn) => {
    const balanceAfter = balance - amount;

    // Layer 2 — DB CHECK constraint (balance_after >= 0) prevents race condition
    try {
      await conn.insert(
        'INSERT INTO point_transactions (user_id, type, amount, balance_after, ...) VALUES (?, ?, ?, ?, ...)',
        [userId, 'spend', amount, balanceAfter, ...],
      );
    } catch (err) {
      if (classifyDatabaseError(err) === 'check-violation') {
        throw new InsufficientPointsError(balance, amount);
      }
      throw err;
    }
  });
}
```

## Per-transaction earn cap

Prevent bulk fraud by capping the maximum earn per single transaction:

```ts
const MAX_EARN_PER_TX = 10_000;
if (amount > MAX_EARN_PER_TX) {
  throw new ValidationException([
    { field: 'amount', message: `max ${MAX_EARN_PER_TX} per transaction` },
  ]);
}
```

## Framework features used

| Feature                 | Import                                          |
| ----------------------- | ----------------------------------------------- |
| JWT sub                 | `authSubFromContext`                            |
| Admin role check        | `c.get('authClaims')`                           |
| Atomic earn/spend       | `runTransaction`                                |
| Idempotency key         | `UNIQUE reference_id` + `classifyDatabaseError` |
| DB constraint violation | `classifyDatabaseError`                         |
| UTC timestamps          | `utcNowIso`                                     |
| Validation              | `ValidationException`, `ValidationError`        |
