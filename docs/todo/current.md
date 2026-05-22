# Current work

Last updated: 2026-05-22  
**Sprint:** FT77–126 campaign — [#71](https://github.com/hideyukiMORI/nene2-node/issues/71) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29))

## Released

- **npm:** [v0.1.7](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.7) — `parsePaginationQuery` export

## Up next

| ID  | Task                                                        | npm     |
| --- | ----------------------------------------------------------- | ------- |
| —   | Release **v0.1.8** (Postgres TX + FT77–126 docs)            | `0.1.8` |
| —   | **FT127+** open friction (idempotency, 409, Redis throttle) | `0.1.9` |

## Completed this session

- **FT77–126** — 50 high-friction reports + index ([#71](https://github.com/hideyukiMORI/nene2-node/issues/71))
- **FT81–82** — `PostgresTransactionManager`, CI postgres job

## FT sandbox ports

See `../nene2-node-FT/PORTS.md` — HTTP **23010**, MySQL **23307–23309**, Postgres **25433**.

## Verification

```bash
npm run check
NENE2_NODE_TEST_MYSQL_URL='mysql://ft073:ft073_pass@127.0.0.1:23309/ft073_app' npm run test -- tests/database/mysql-integration.test.ts
NENE2_NODE_TEST_POSTGRES_URL='postgresql://ft069:ft069_pass@127.0.0.1:25433/ft069_app' npm run test -- tests/database/postgres-integration.test.ts
```
