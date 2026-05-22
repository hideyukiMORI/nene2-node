# Database migrations — app-owned vs framework

**FT71** guidance for production applications using `@hideyukimori/nene2-framework`. Parity stance matches nene2-python: the framework ships **ports and adapters**, not a migration runner.

## Summary

| Layer                    | Who owns schema evolution                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Your business tables** | **Your application** (Prisma, Drizzle, Flyway, dbmate, hand-written SQL, etc.)                                                                             |
| **Example notes/tags**   | **Framework** — idempotent `CREATE TABLE IF NOT EXISTS` via `ensureExamplesSchema()` / `ensureExamplesSchemaAsync()` when `NENE2_NODE_DATABASE_URL` is set |

Do **not** treat `createApp()` schema bootstrap as a replacement for production migrations.

## What the framework does today

When `NENE2_NODE_DATABASE_URL` is set, `createDatabaseRuntime()`:

1. Opens SQLite, MySQL, or PostgreSQL (see [database-layer.md](database-layer.md))
2. Runs example DDL for `notes` and `tags` (backend-specific SQL in `src/example/example-sql-schema.ts`)
3. Wires `SqliteNoteRepository` / `SqliteTagRepository` for `/examples/notes` and `/examples/tags`

Properties:

- **Idempotent bootstrap** — safe on empty databases; not a versioned migration history
- **Example scope only** — aligns with OpenAPI example domains, not your product schema
- **No rollback** — no `schema_migrations` table, no down migrations

## What applications must do

### 1. Version schema outside the framework

Choose a tool that fits your team:

| Tool                        | Typical use                              |
| --------------------------- | ---------------------------------------- |
| **Prisma Migrate**          | TS-first teams, generated client         |
| **Drizzle Kit**             | Lightweight SQL migrations + TS schema   |
| **Flyway / Liquibase**      | JVM-style versioned SQL, ops-friendly    |
| **dbmate / golang-migrate** | Plain SQL files in repo                  |
| **Hand-written SQL**        | Small services; document order in README |

Run migrations in **CI deploy**, **release job**, or **init container** — not inside `createApp()`.

### 2. Inject your repositories

Production apps should pass custom implementations to `createApp()`:

```typescript
const { app } = await createApp({
  settings: loadAppSettings(),
  noteRepository: new PrismaNoteRepository(prisma),
  tagRepository: new PrismaTagRepository(prisma),
});
```

Omit `NENE2_NODE_DATABASE_URL` in production if you do not want example tables or automatic example DDL on the same database.

### 3. Separate databases (recommended)

| Database        | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| **App DB**      | Business schema + your migrator                             |
| **Dev/demo DB** | Optional SQLite file or Compose stack with examples enabled |

Using one MySQL database for both app tables and `/examples/*` is possible for local demos but couples example DDL to your migration timeline — avoid in production.

## Backend-specific notes

### SQLite (`file:…` or `:memory:`)

- **Dev:** delete the file and restart, or run your migrator against the file path
- **Framework examples:** `ensureExamplesSchema()` is sufficient for notes/tags demos

### MySQL / PostgreSQL

- **Framework:** `ensureExamplesSchemaAsync()` runs example `CREATE TABLE IF NOT EXISTS` once per process start (pool connect)
- **Production:** use your migrator before traffic; framework bootstrap must not be the only schema change mechanism
- **CI:** see [ci-mysql-service.md](ci-mysql-service.md) — tests use a disposable service database

## Changing example tables (framework contributors)

Example schema changes are **breaking** for contract tests and sandboxes:

1. Edit DDL in `sqlite-note-schema.ts` / `sqlite-tag-schema.ts` and `example-sql-schema.ts` (MySQL/Postgres variants)
2. Run `npm run check`
3. Document in `CHANGELOG.md` under `### Changed` or `### Removed`
4. Consumers with old SQLite files: delete `file:…` or migrate manually

Future framework migrator (if any) requires an ADR and explicit semver — out of scope for 0.1.x.

## Anti-patterns

| Do not                                               | Why                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Rely on `CREATE IF NOT EXISTS` for app tables        | No version tracking; destructive changes are invisible                        |
| Fork `ensureExamplesSchema()` for product DDL        | Belongs in your repo, not the published package                               |
| Skip migrations on MySQL/Postgres deploy             | Pool connects but columns may not match entity code                           |
| Assume nene2-node copies PHP NENE2 migration tooling | PHP runtime authoring stays in [NENE2](https://github.com/hideyukiMORI/NENE2) |

## References

- [database-layer.md](database-layer.md) — executors, wiring, transactions
- [composition-root.md](composition-root.md) — `createApp({ noteRepository, tagRepository })`
- [consumer-quickstart.md](../how-to/consumer-quickstart.md) — install path
- [migration-from-php-nene2.md](../migration-from-php-nene2.md) — PHP mapping
- Parent FT: [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)
