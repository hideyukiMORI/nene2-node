# How-to: distributed lock

A distributed lock gives one worker exclusive access to a named resource (a
payment, a file, a queue job). Locks carry a TTL so a crashed holder does not
block forever, and only the **owner** may release or renew.

> Parity: PHP NENE2 FT288 (`distlocklog`). node FT181.

## Usage

```ts
import { createLockManager } from '@hideyukimori/nene2-framework';

const locks = createLockManager(); // process-local, 30s default TTL

const lock = await locks.acquire('payment:42', workerId, 10_000);
if (lock === null) {
  // Held by another worker, not expired — not an error; retry later.
  return c.json({ acquired: false, resource: 'payment:42' });
}
try {
  await chargePayment();
} finally {
  await locks.release('payment:42', workerId);
}
```

## API

| Method                             | Returns                                         | Notes                                         |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| `acquire(resource, owner, ttlMs?)` | `LockRecord` \| `null`                          | `null` = held by another, not expired (retry) |
| `release(resource, owner)`         | `'released'` \| `'not-found'` \| `'forbidden'`  | owner-verified                                |
| `renew(resource, owner, ttlMs?)`   | `{ ok: true, lock }` \| `{ ok: false, reason }` | owner-verified                                |
| `status(resource)`                 | `LockRecord` \| `null`                          | `null` if absent or expired                   |

Map outcomes to HTTP in your handler:

```ts
const result = await locks.release(resource, owner);
if (result === 'released') return c.body(null, 204);
if (result === 'forbidden')
  return problems.jsonResponse(c, problems.build('forbidden', 'Owner mismatch.', 403));
return problems.jsonResponse(c, problems.build('not-found', 'Lock not found.', 404));
```

`acquired: false` is **not** a 4xx — it means "try again later". Don't surface it
as an error.

## Behaviour & security

| Scenario                             | Result                       |
| ------------------------------------ | ---------------------------- |
| Acquire a free resource              | lock granted                 |
| Same owner re-acquires               | lease extended               |
| **Acquire held by another (valid)**  | `null` (ATK-01 blocked)      |
| Acquire after TTL expiry (any owner) | granted — by design (ATK-03) |
| **Release by a different owner**     | `forbidden` 403 (ATK-02)     |
| **Renew by a different owner**       | `forbidden` 403 (ATK-04)     |
| Release/renew an expired lock        | `not-found`                  |

Expired-lock re-acquisition is intentional: the TTL is precisely how a crashed
holder's lock is reclaimed. Tighten the window with a shorter TTL plus periodic
`renew` (heartbeat) from the holder.

## Storage & multi-instance

The default `InMemoryLockStorage` is **process-local**. For true cross-instance
mutual exclusion, use the shipped **`RedisLockStorage`**, whose acquire is atomic
(`SET … NX EX`):

```ts
import { createLockManager, RedisLockStorage } from '@hideyukimori/nene2-framework';
import { wrapNodeRedisClient } from '@hideyukimori/nene2-framework';

const locks = createLockManager({
  storage: new RedisLockStorage(wrapNodeRedisClient(redisClient)),
  defaultTtlMs: 10_000,
});
```

`LockStorage` is `get` / `putIfAbsent` (atomic) / `put` / `delete`; the atomic
`putIfAbsent` is what guarantees only one acquirer wins. Implement it on any
store whose set-if-absent is atomic (Redis `SET NX`, a DB `UNIQUE` insert, …).
The in-memory store is single-threaded so its `putIfAbsent` is trivially atomic.

## What NOT to do

| Anti-pattern                       | Risk                                         |
| ---------------------------------- | -------------------------------------------- |
| No TTL                             | A crashed holder blocks the resource forever |
| Release without owner check        | Any caller can free someone else's lock      |
| Treat `acquire → null` as an error | Spurious 4xx; it just means "retry"          |
| In-memory store for multi-instance | No mutual exclusion across nodes             |
| Non-atomic shared-store acquire    | Two workers can both win the lock            |
