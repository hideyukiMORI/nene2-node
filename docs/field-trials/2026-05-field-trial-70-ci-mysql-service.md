# Field trial report — FT70: CI MySQL service container

**Date:** 2026-05-22 | **Issue:** [#50](https://github.com/hideyukiMORI/nene2-node/issues/50) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)) | **Security:** N/A | **Adversarial:** required (🔍)

## Validated

- `.github/workflows/ci.yml` job `mysql-integration` — MySQL 8.4 service + health wait
- `tests/database/mysql-integration.test.ts` — `createApp()` health 200, note POST/GET
- `docs/development/ci-mysql-service.md`

## Doc updates (docs-first)

- [x] `ci-mysql-service.md` — job layout, env var, local optional run

## Friction

### F-1: `LIMIT ? OFFSET ?` with `execute()` (severity: high)

**Observed:** `ER_WRONG_ARGUMENTS` on list notes under MySQL 8.4.  
**Action:** `MysqlQueryExecutor` switched from `execute()` to `query()` for parameterized SQL.

## DX (one paragraph)

Consumers can mirror the CI service block for their own GitHub Actions pipelines; framework tests skip MySQL locally unless `NENE2_NODE_TEST_MYSQL_URL` is set, keeping default `npm run check` fast on SQLite only.

## Follow-up

- FT71 — migration story (app-owned vs framework)
- PostgreSQL CI service container (optional follow-up Issue if friction appears)
