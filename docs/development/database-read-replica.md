# Read replica URL

Set **`NENE2_NODE_DATABASE_READ_URL`** alongside **`NENE2_NODE_DATABASE_URL`** to expose a second pool on `Nene2App.database.readExecutor`.

## Behaviour

| Backend    | `readExecutor` when read URL set                        |
| ---------- | ------------------------------------------------------- |
| MySQL      | Separate pool (must be `mysql://…`)                     |
| PostgreSQL | Separate pool (`NENE2_POSTGRES_READ_POOL_MAX` optional) |
| SQLite     | Same handle as `executor` (no real replica — FT118 F-2) |

Use `database.executor` for writes and transactions; route read-only queries to `database.readExecutor` in app repositories.

## Friction

- Framework does not auto-route — apps must choose executor per query.
- Mismatched backend between primary and read URL throws at boot.
