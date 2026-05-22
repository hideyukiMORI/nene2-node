# Database constraint errors → HTTP

When a repository or route handler lets a **driver error** bubble to `createApp()`'s `onError`, the framework maps known constraint violations to Problem Details:

| Constraint  | HTTP | Problem `type` suffix | Typical drivers                        |
| ----------- | ---- | --------------------- | -------------------------------------- |
| UNIQUE      | 409  | `conflict`            | MySQL `1062`, Postgres `23505`, SQLite |
| FOREIGN KEY | 422  | `validation-failed`   | MySQL `1452`, Postgres `23503`, SQLite |

## Detection

Use `classifyDatabaseError(error)` when building custom handlers. Global mapping runs in `resolveHttpError()` before domain handlers.

Errors wrapped with `cause` (e.g. `new Error('query failed', { cause: driverErr })`) are supported.

## SQLite caveat

SQLite enforces foreign keys only when `PRAGMA foreign_keys = ON`. Without it, invalid FK inserts may succeed silently — enable in app bootstrap or migrations.

## Idempotency (FT128)

`idempotencyMiddleware()` stores responses in `InMemoryIdempotencyStorage` by default. Production apps should supply Redis/durable storage (see FT95). Reusing a key with a different body returns **409**.
