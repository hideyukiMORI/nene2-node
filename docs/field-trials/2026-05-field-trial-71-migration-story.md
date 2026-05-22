# Field trial report — FT71: Migration story (app-owned vs framework)

**Date:** 2026-05-22 | **Issue:** [#54](https://github.com/hideyukiMORI/nene2-node/issues/54) (parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)) | **Security:** N/A | **Adversarial:** N/A

## Validated

- Documented split: framework `ensureExamplesSchema*` vs application migrators
- `npm run check` — all tests green

## Doc updates (docs-first)

- [x] `docs/development/database-migrations.md` — primary deliverable
- [x] `database-layer.md` — cross-link; removed stale “mysql rejected” note
- [x] `development/README.md`, `consumer-quickstart.md`

## Friction

### F-0: No sandbox run (difficulty D0 — policy doc only)

**Observed:** FT71 did not execute a Tier A business app or migration tool against a real database.  
**Impact:** “No friction” here means **friction was not exercised**, not that production apps have no obstacles.  
**Action:** Raise difficulty from **FT73** — nested REST + multi-table app in `../nene2-node-FT/` (see [field-trial-culture.md](../development/field-trial-culture.md) difficulty ramp).

## DX (one paragraph)

Teams can keep Prisma/Drizzle/Flyway for product schema while optionally enabling example routes on a separate DB URL; the framework does not compete with migration tools in 0.1.x.

## Follow-up

- FT72 — connection pool settings documentation
- ADR only if a first-party migrator is proposed (not planned for 0.1.x)
