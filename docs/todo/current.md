# Current work

Last updated: 2026-05-22  
**Sprint:** FT Phase 2 — FT76+ — [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)

## Released

- **npm / GitHub:** [v0.1.6](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.6) — database handle, bearer paths, transactions

## Up next

| ID  | Task                         | npm     |
| --- | ---------------------------- | ------- |
| —   | Release **v0.1.7** after #68 | `0.1.7` |
| —   | **FT77** compose template    | `0.1.8` |

## In progress

- [#68](https://github.com/hideyukiMORI/nene2-node/issues/68) — FT76 pagination export

## FT sandbox ports (temporary)

See `../nene2-node-FT/PORTS.md` — HTTP **23010**, MySQL **23308** / **23309**, Postgres **25433**.

## Verification

```bash
npm run check
NENE2_NODE_TEST_MYSQL_URL='mysql://ft073:ft073_pass@127.0.0.1:23309/ft073_app' npm run test -- tests/database/mysql-integration.test.ts
```
