# Database layer

SQLite (`node:sqlite`), MySQL (`mysql2`), and PostgreSQL (`pg`) via `createDatabaseRuntime()`. Parity reference: nene2-python database adapters.

## Components

| Module                       | Role                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `DatabaseQueryExecutor`      | Parameterized queries (`SqlParameter`)                 |
| `SqliteQueryExecutor`        | `node:sqlite` implementation                           |
| `DatabaseTransactionManager` | `transaction(callback)` boundary                       |
| `SqliteTransactionManager`   | SQLite transactions                                    |
| `createDatabaseHealthCheck`  | `SELECT 1` probe → degraded `/health`                  |
| `ensureExamplesSchema`       | Notes + tags tables when `NENE2_NODE_DATABASE_URL` set |

## Wiring

`createApp()` opens the database when `NENE2_NODE_DATABASE_URL` is set, runs `ensureExamplesSchema()`, injects `SqliteNoteRepository` / `SqliteTagRepository`, and registers the database health check.

**Multi-domain:** one `SqliteQueryExecutor` per database connection — notes and tags share the same file and schema bootstrap. Add new example domains by extending `ensureExamplesSchema()` and wiring repos in `createApp()`.

## Usage in new repositories

1. Define a port interface in `src/example/<domain>/` (no Hono imports).
2. Implement `InMemory*` for fast tests and `Sqlite*` using `DatabaseQueryExecutor`.
3. Use `statement.run(...params)` — not `.bind()` (Node sqlite API).
4. Add schema DDL in `sqlite-*-schema.ts`; call from `ensureExamplesSchema()`.

## Transactions

```typescript
await transactionManager.transaction(async () => {
  // multiple executor calls — commit or rollback as a unit
});
```

Use for multi-step writes; example Note/Tag handlers currently use single statements.

## Tests

- `tests/database/sqlite-executor.test.ts` — executor + transaction manager
- Repository contract tests with `:memory:` and `ensureExamplesSchema()`

## Schema changes (example tables)

1. Edit `sqlite-note-schema.ts` / `sqlite-tag-schema.ts` (or add new `sqlite-*-schema.ts`).
2. Call DDL from `ensureExamplesSchema()` in `example-sqlite-schema.ts`.
3. Run repository contract tests with `:memory:`.

**v0.1.x:** no framework migration runner — see [database-migrations.md](database-migrations.md) (app-owned vs example bootstrap).

## MySQL / PostgreSQL

`createDatabaseRuntime()` opens `mysql2` or `pg` pools, runs **example** DDL, and wires `SqliteNoteRepository` / `SqliteTagRepository` (SQL uses `?`; PostgreSQL translates to `$n` in `PostgresQueryExecutor`). `createApp()` is async; optional `shutdown()` closes pools. Pool sizing: [database-connection-pool.md](database-connection-pool.md).

URLs: `mysql://user:pass@host:port/db`, `postgresql://…` or `postgres://…`. SQLite: `:memory:` or `file:./path.sqlite`.

**CI:** [ci-mysql-service.md](ci-mysql-service.md), [ci-postgres-service.md](ci-postgres-service.md). **Sandboxes:** `../nene2-node-FT/ft068-mysql-compose/`, `ft069-postgres-compose/`.

## References

- Phase 4 milestone: `../milestones/2026-05-phase4-database-health.md`
- FT index: `../field-trials/backlog.md` (FT16–18, FT26, FT67–148 done)
