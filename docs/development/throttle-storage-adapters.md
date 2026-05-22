# Throttle storage adapters

`throttleMiddleware` accepts a `RateLimitStorage` implementation. Default is in-memory (single process).

## Per-user keys

```ts
import { jwtSubThrottleKey, throttleMiddleware } from '@hideyukimori/nene2-framework';

app.use(
  '*',
  throttleMiddleware(problems, {
    limit: 60,
    windowSeconds: 60,
    keyExtractor: jwtSubThrottleKey,
  }),
);
```

Anonymous requests fall back to `ipThrottleKey`.

## File-backed (`FileRateLimitStorage`)

For **single-host, multi-process** Node workers (not multi-region):

```ts
import { FileRateLimitStorage, throttleMiddleware } from '@hideyukimori/nene2-framework';

const storage = new FileRateLimitStorage('/var/lib/nene2/ratelimit');
app.use('*', throttleMiddleware(problems, { limit: 100, windowSeconds: 60, storage }));
```

`storage.hit()` may return a `Promise` — `throttleMiddleware` awaits automatically.

## Redis (app-owned)

The framework does not bundle `ioredis`. Implement `RateLimitStorage.hit()` (sync or async) with your Redis client. Use key prefix `rl:` + `jwtSubThrottleKey(c)`.

## Redis (`RedisRateLimitStorage`)

Requires optional peer **`redis`** and a shared Redis URL:

```ts
import {
  createRedisKeyValueClientFromUrl,
  RedisRateLimitStorage,
  createThrottleStorageFromEnvAsync,
} from '@hideyukimori/nene2-framework';

// NENE2_NODE_THROTTLE_STORAGE=redis + NENE2_NODE_REDIS_URL=redis://127.0.0.1:6379
const storage = await createThrottleStorageFromEnvAsync();

// Or manual:
const client = await createRedisKeyValueClientFromUrl(process.env.REDIS_URL!);
const storage = new RedisRateLimitStorage(client);
```

Sync `createThrottleStorageFromEnv()` cannot use `redis` kind — throws with guidance (FT141 F-2).

## Idempotency (`RedisIdempotencyStorage`)

Same `RedisKeyValueClient` — see FT142 report.
