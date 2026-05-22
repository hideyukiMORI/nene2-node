# Database layer

SQLite via `node:sqlite` for example domains and health checks. Parity reference: nene2-python database adapters.

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

## References

- Phase 4 milestone: `../milestones/2026-05-phase4-database-health.md`
- FT backlog: `../field-trials/backlog.md` (FT16–FT18)
