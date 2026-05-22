# Current work

Last updated: 2026-05-22  
**Sprint:** FT Phase 2 — FT75+ — [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)

## Released

- **GitHub:** [v0.1.3](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.3) … [v0.1.5](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.5)
- **v0.1.4** — `Nene2App.database` ([#57](https://github.com/hideyukiMORI/nene2-node/issues/57))
- **v0.1.5** — `bearerIncludePaths` ([#63](https://github.com/hideyukiMORI/nene2-node/issues/63))

## Up next

| ID  | Task                             | npm     |
| --- | -------------------------------- | ------- |
| —   | Release **v0.1.6** after FT75 PR | `0.1.6` |
| —   | **FT76** list/filter at scale    | `0.1.7` |

## In progress

- [#65](https://github.com/hideyukiMORI/nene2-node/issues/65) — FT75 MySQL `transactionManager`

## Verification

```bash
npm run check
NENE2_NODE_TEST_MYSQL_URL='mysql://ft073:ft073_pass@127.0.0.1:3309/ft073_app' npm run test -- tests/database/mysql-integration.test.ts
```
