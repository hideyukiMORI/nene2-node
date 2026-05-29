# MySQL read replica Compose E2E

Validates **FT134** `NENE2_NODE_DATABASE_READ_URL` against real MySQL (separate read pool). Sandbox: `../nene2-node-FT/ft145-mysql-read-replica/`.

## Compose

Single MySQL 8 instance (dev/staging often points read URL at the same host until a replica hostname exists):

```yaml
# Host port 23310 — see nene2-node-FT/PORTS.md
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ft145_root
      MYSQL_DATABASE: ft145_app
      MYSQL_USER: ft145
      MYSQL_PASSWORD: ft145_pass
    ports:
      - '23310:3306'
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', '127.0.0.1', '-uft145', '-pft145_pass']
      interval: 5s
      timeout: 5s
      retries: 10
```

## Env

| Variable                       | Example                                              |
| ------------------------------ | ---------------------------------------------------- |
| `NENE2_NODE_DATABASE_URL`      | `mysql://ft145:ft145_pass@127.0.0.1:23310/ft145_app` |
| `NENE2_NODE_DATABASE_READ_URL` | same URL (separate pool) or replica hostname in prod |

## Run probe

```bash
cd ../nene2-node-FT/ft145-mysql-read-replica
docker compose up -d
npm install
node probe.mjs
docker compose down
```

## App pattern

```ts
const { database } = await createApp({ settings });
// writes + transactions
await database.queryExecutor.insert(/* … */);
// read-only lists
await database.readExecutor?.fetchAll(/* … */);
```

Repositories must **choose** `readExecutor` explicitly — the framework does not auto-route.

## Friction (FT145)

| ID  | Summary                                | Status                                            |
| --- | -------------------------------------- | ------------------------------------------------- |
| F-1 | No bundled compose in framework repo   | **documented** — external FT sandbox              |
| F-2 | No automatic read/write routing        | **accepted** — app chooses executor               |
| F-3 | Dev often uses same host for both URLs | **documented** — production uses replica hostname |
