# Field trial report — FT17: Database health → 503

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** N/A

## Validated

- `createDatabaseHealthCheck` wired when `NENE2_NODE_DATABASE_URL` set.
- `tests/http/health-database.test.ts` — degraded `/health` returns 503.

## Doc updates (docs-first)

- `production-deployment.md` — `/health` vs `/machine/health`.
- `database-layer.md` — health probe section.

## Friction

- _None blocking._

## DX

Orchestrators should use `/health` for liveness; do not expose DB errors in response body beyond Problem Details safe fields.

## Follow-up

- None.
