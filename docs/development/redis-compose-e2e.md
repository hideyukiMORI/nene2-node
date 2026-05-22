# Redis Compose E2E

Validates **FT141–142** adapters against a real Redis instance (not mocks). Sandbox: `../nene2-node-FT/ft144-redis-compose/`.

## Compose

```yaml
# Host port 26379 — see nene2-node-FT/PORTS.md
services:
  redis:
    image: redis:7-alpine
    ports:
      - '26379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 10
```

## Run probe

```bash
cd ../nene2-node-FT/ft144-redis-compose
docker compose up -d
npm install
NENE2_NODE_REDIS_URL=redis://127.0.0.1:26379 node probe.mjs
docker compose down
```

## Env (async throttle factory)

| Variable                      | Example                   |
| ----------------------------- | ------------------------- |
| `NENE2_NODE_THROTTLE_STORAGE` | `redis`                   |
| `NENE2_NODE_REDIS_URL`        | `redis://127.0.0.1:26379` |

```ts
const storage = await createThrottleStorageFromEnvAsync();
```

Install peer: `npm install redis`.

## Friction (FT144)

| ID  | Summary                                         | Status                                            |
| --- | ----------------------------------------------- | ------------------------------------------------- |
| F-1 | No bundled compose in framework repo            | **documented** — external FT sandbox              |
| F-2 | Apps must `npm install redis` + async bootstrap | **documented** — see throttle-storage-adapters.md |
