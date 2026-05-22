# Current work

Last updated: 2026-05-22  
**Sprint:** FT127–129 execution — [#73](https://github.com/hideyukiMORI/nene2-node/issues/73) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29))

## Released

- **npm:** [v0.1.8](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.8) — Postgres TX, FT77–126 docs
- **pending:** **v0.1.9** — constraint mapper + idempotency (PR in flight)

## Up next

| ID  | Task                                                                     | npm     |
| --- | ------------------------------------------------------------------------ | ------- |
| —   | Release **v0.1.9**                                                       | `0.1.9` |
| —   | **FT130+** — optimistic lock (85), Redis throttle (95), BOLA enforcement | `0.2.0` |

## Completed this session

- **FT127** — UNIQUE → 409 (`classifyDatabaseError`)
- **FT128** — `idempotencyMiddleware` (in-memory; Redis open)
- **FT129** — FK → 422 + SQLite PRAGMA doc

## FT sandbox ports

See `../nene2-node-FT/PORTS.md` — HTTP **23010**, MySQL **23307–23309**, Postgres **25433**.

## Verification

```bash
npm run check
```
