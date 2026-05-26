# Application Caching (Cache-Aside)

Cache-Aside pattern with TTL-based expiry, write-through invalidation, and cache statistics. Works with any key-value store.

## Pattern overview

Cache-Aside (look-aside): the application controls cache reads and writes — the cache is not automatically updated by the DB.

```
READ:   check cache → hit: return | miss: query DB → populate cache → return
WRITE:  update DB → invalidate/update cache
```

## In-memory cache implementation

```ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Date.now() epoch ms
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly defaultTtlMs = 60_000) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key); // evict expired
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  flush(): void {
    this.store.clear();
  }

  stats() {
    return { hits: this.hits, misses: this.misses, size: this.store.size };
  }
}
```

For production, use Redis via `createRedisKeyValueClientFromUrl` from the framework.

## Cache-Aside GET handler

```ts
const PRODUCT_TTL_MS = 60_000; // 1 minute

app.get('/products/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const cacheKey = `product:${id}`;

  const cached = cache.get<Product>(cacheKey);
  if (cached) return c.json(cached);

  const product = await productRepo.findById(id);
  if (!product) throw new ProductNotFoundError(id);

  cache.set(cacheKey, product, PRODUCT_TTL_MS);
  return c.json(product);
});
```

## Write-through invalidation

Invalidate the cache after a write — do not update it (the next GET will repopulate):

```ts
app.put('/products/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();

  await productRepo.update(id, body);

  // Invalidate both the item cache and the list cache
  cache.delete(`product:${id}`);
  cache.delete('products:list');

  return c.json({ message: 'updated' });
});
```

## List cache with invalidation

```ts
app.get('/products', async (c) => {
  const cached = cache.get<Product[]>('products:list');
  if (cached) return c.json({ items: cached });

  const items = await productRepo.findAll();
  cache.set('products:list', items, PRODUCT_TTL_MS);
  return c.json({ items });
});

app.post('/products', async (c) => {
  const body = await c.req.json();
  const product = await productRepo.create(body);

  cache.delete('products:list'); // new item → list stale
  return c.json(product, 201);
});
```

## Redis-backed cache

Use the framework's Redis client for a distributed cache that survives process restarts:

```ts
import { createRedisKeyValueClientFromUrl } from '@hideyukimori/nene2-framework';

const redis = await createRedisKeyValueClientFromUrl(process.env['REDIS_URL']!);

// SET with TTL
await redis.set('product:1', JSON.stringify(product), { ttlMs: 60_000 });

// GET
const raw = await redis.get('product:1');
const product = raw ? (JSON.parse(raw) as Product) : null;
```

## Cache stats endpoint

```ts
app.get('/cache/stats', (c) => c.json(cache.stats()));
// → { "hits": 142, "misses": 23, "size": 7 }

app.post('/cache/clear', (c) => {
  cache.flush();
  return c.json({ message: 'cache cleared' });
});
```

## Cache key conventions

| Pattern         | Key                                         |
| --------------- | ------------------------------------------- |
| Single resource | `resource:id` (e.g., `product:42`)          |
| List            | `resources:list` or `resources:list:page:2` |
| User-scoped     | `user:sub:resource` (e.g., `user:u1:cart`)  |

Prefix keys by resource type to avoid collisions when sharing a cache.

## Framework features used

| Feature      | Import                                                    |
| ------------ | --------------------------------------------------------- |
| Redis client | `createRedisKeyValueClientFromUrl`, `RedisKeyValueClient` |
