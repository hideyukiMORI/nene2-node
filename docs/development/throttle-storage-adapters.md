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

## Redis (app-owned)

The framework does not bundle `ioredis`. Implement `RateLimitStorage.hit()` with your Redis client and pass it as `storage`. Use key prefix `rl:` + `jwtSubThrottleKey(c)` for multi-instance parity.

FT95 friction (no built-in Redis adapter) remains **open** until a peer-optional package or documented reference implementation ships.
