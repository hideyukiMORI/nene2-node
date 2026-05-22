# Current work

Last updated: 2026-05-22  
**Sprint:** FT144 — [#83](https://github.com/hideyukiMORI/nene2-node/issues/83)

## Released

- **npm:** [v0.1.13](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.13) — FT141–143 Redis adapters + webhook replay window

## Up next

| ID  | Task                                     | npm      |
| --- | ---------------------------------------- | -------- |
| —   | **FT145** MySQL read-replica Compose E2E | `0.1.14` |

## In progress

- **FT144** — Redis Compose E2E docs + `ft144-redis-compose` probe

## Completed (recent)

- **FT141–143** — Redis storage + webhook timestamp ([#81](https://github.com/hideyukiMORI/nene2-node/issues/81) / [#82](https://github.com/hideyukiMORI/nene2-node/pull/82))

## Verification

```bash
npm install && npm run check
cd ../nene2-node-FT/ft144-redis-compose && docker compose up -d && npm install && node probe.mjs
```
