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

**v0.1.x:** no automatic migrations — delete the SQLite file or bump schema with a documented breaking change in CHANGELOG. Production apps should version migrations outside the framework (ADR if we ship a migrator later).

## MySQL / PostgreSQL (planned)

**Not implemented in v0.1.x.** The port (`DatabaseQueryExecutor`, `DatabaseTransactionManager`) is ready; adapters need driver choice (e.g. `mysql2`, `pg`), Issues, and Phase 2 FTs (FT68–FT72).

Until adapters ship:

- Use SQLite via `NENE2_NODE_DATABASE_URL=file:…` for local/dev parity.
- **mysql://** and **postgresql://** URLs are rejected with an explicit error (issue #37) — not passed to SQLite.
- Run application FTs against Docker MySQL/Postgres in `../nene2-node-FT/` and file friction Issues.

See `../field-trials/2026-05-ft-phase2-application-integration.md`.

## References

- Phase 4 milestone: `../milestones/2026-05-phase4-database-health.md`
- FT backlog: `../field-trials/backlog.md` (FT16–FT18, FT26, FT67+)
