# Current work

Last updated: 2026-05-22  
**Sprint:** FT Phase 2 — FT74+ — [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)

## Released

- **npm:** `@hideyukimori/nene2-framework@0.1.1` ([#48](https://github.com/hideyukiMORI/nene2-node/issues/48))
- **GitHub:** [v0.1.2](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.2) ([#50](https://github.com/hideyukiMORI/nene2-node/issues/50))
- **GitHub:** [v0.1.3](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.3) — migration docs ([#54](https://github.com/hideyukiMORI/nene2-node/issues/54))
- **Code:** [v0.1.4](https://github.com/hideyukiMORI/nene2-node/pull/62) — `Nene2App.database` ([#57](https://github.com/hideyukiMORI/nene2-node/issues/57))

## Up next

| ID  | Task                                    | npm     |
| --- | --------------------------------------- | ------- |
| —   | Release tag **v0.1.5** after FT74 PR    | `0.1.5` |
| —   | **FT75** order + items transaction (D4) | `0.1.6` |

## In progress

- [#63](https://github.com/hideyukiMORI/nene2-node/issues/63) — FT74 bearer on business routes

## Verification

```bash
npm run check
NENE2_NODE_TEST_MYSQL_URL='mysql://ft068:ft068_pass@127.0.0.1:3308/ft068_app' npm run test -- tests/database/mysql-integration.test.ts
```
