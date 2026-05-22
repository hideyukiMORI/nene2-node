# Field trial report — FT134: Read replica URL (D4)

**Date:** 2026-05-22 | **Issue:** [#77](https://github.com/hideyukiMORI/nene2-node/issues/77) | **Sandbox:** `../nene2-node-FT/ft134-read-replica/`

## Validated

- `NENE2_NODE_DATABASE_READ_URL` → `Nene2App.database.readExecutor`
- MySQL/Postgres: second pool; SQLite: alias (documented)

## Friction

### F-1: No read/write split (FT118) — **resolved** (opt-in URL)

### F-2: SQLite has no replica (severity: medium) — **documented**

`readExecutor === executor` — apps must not assume separate host.

### F-3: No automatic query routing (severity: low) — **accepted**

Repositories choose executor explicitly.

## Probes

| Probe                          | Result               |
| ------------------------------ | -------------------- |
| `ft134-read-replica/probe.mjs` | readExecutor defined |
