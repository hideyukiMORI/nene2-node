# CI — MySQL service container (FT70)

GitHub Actions job `mysql-integration` in `.github/workflows/ci.yml` validates the framework against a real MySQL 8.4 instance on every PR and `main` push.

## Layout

| Job                 | Scope                                         |
| ------------------- | --------------------------------------------- |
| `check`             | `npm run check` (SQLite in-memory, no Docker) |
| `mysql-integration` | `tests/database/mysql-integration.test.ts`    |

## Service container

- Image: `mysql:8.4`
- Database: `nene2_ci` / user `nene2_ci` / password `nene2_ci`
- Port: `3306` on the runner host (`127.0.0.1`)

Connection URL passed to tests:

```text
mysql://nene2_ci:nene2_ci@127.0.0.1:3306/nene2_ci
```

Environment variable: `NENE2_NODE_TEST_MYSQL_URL` (tests only — not used by `loadAppSettings()` in production).

## Run locally (optional)

With Docker MySQL listening on 3306:

```bash
export NENE2_NODE_TEST_MYSQL_URL='mysql://user:pass@127.0.0.1:3306/dbname'
npm run test -- tests/database/mysql-integration.test.ts
```

Without the variable, Vitest skips the suite (`describe.skipIf`).

## References

- Sandbox recipe: `../nene2-node-FT/ft068-mysql-compose/` (port **3308**)
- [database-layer.md](database-layer.md) — adapter and URL formats
- FT report: [2026-05-field-trial-70-ci-mysql-service.md](../field-trials/2026-05-field-trial-70-ci-mysql-service.md)
