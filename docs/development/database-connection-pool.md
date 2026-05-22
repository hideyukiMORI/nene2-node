# Database connection pools (MySQL / PostgreSQL)

Framework pools are created inside `createDatabaseRuntime()` and `createApp()` when `NENE2_NODE_DATABASE_URL` uses `mysql://` or `postgresql://` / `postgres://`.

## Defaults

| Backend    | Driver   | Default max connections | Env override              |
| ---------- | -------- | ----------------------- | ------------------------- |
| MySQL      | `mysql2` | 10 (`connectionLimit`)  | `NENE2_MYSQL_POOL_MAX`    |
| PostgreSQL | `pg`     | 10 (`max`)              | `NENE2_POSTGRES_POOL_MAX` |

Invalid or empty env values fall back to **10**. Values must be integers ≥ 1.

## One pool per process

`createApp()` opens **one** pool for example note/tag repositories and the database health check. Business apps should:

1. Prefer **`await createApp()`** and use `nene2.database.executor` for custom repositories (see FT73), **or**
2. Call `createDatabaseRuntime(url)` once and pass repositories into `createApp()` **without** setting `NENE2_NODE_DATABASE_URL` (advanced).

Opening two pools against the same URL (e.g. `createDatabaseRuntime` + `createApp` with the same env) wastes connections and can confuse shutdown — avoid it.

## Serverless and small containers

- Size `NENE2_*_POOL_MAX` to **(expected concurrent requests per instance) + small headroom**, not “as high as possible”.
- In serverless, prefer **one connection per invocation** or an external pooler (PgBouncer, RDS Proxy) — the framework does not manage per-request pool lifecycle beyond `shutdown()`.
- Call `await nene2.shutdown?.()` on process exit (SIGTERM) so pools close cleanly.

## SQLite

`:memory:` and `file:` URLs use a single `node:sqlite` handle — no pool env vars apply.

## References

- [database-layer.md](database-layer.md)
- FT72 report: `../field-trials/2026-05-field-trial-72-connection-pool.md`
- Sandboxes: `../nene2-node-FT/ft068-mysql-compose/`, `ft069-postgres-compose/`
