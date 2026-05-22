# Current work

Last updated: 2026-05-22  
**Sprint:** Phase 2b — throttle, CORS, logging (next)  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## In progress

| ID   | Task                                 | Milestone                                              | Issue |
| ---- | ------------------------------------ | ------------------------------------------------------ | ----- |
| P2-4 | Throttle + CORS + structured logging | [phase2](milestones/2026-05-phase2-middleware-auth.md) | TBD   |

## Up next (ordered)

| ID   | Task                                 | Phase |
| ---- | ------------------------------------ | ----- |
| P3-1 | Note domain (interfaces + in-memory) | 3     |
| P3-2 | Note HTTP + SQLite                   | 3     |
| P3-3 | OpenAPI contract tests for notes     | 3     |

## Completed (recent)

- [x] Phase 2a domain errors + validation + Bearer ([#11](https://github.com/hideyukiMORI/nene2-node/issues/11))
- [x] Phase 0 governance + FT culture
- [x] Phase 1 Hono runtime ([#7](https://github.com/hideyukiMORI/nene2-node/issues/7))
- [x] Master plan + milestones `2026-05-phase*` (7 docs)
- [x] Phase 1b contract + dev ([#9](https://github.com/hideyukiMORI/nene2-node/issues/9) / [#10](https://github.com/hideyukiMORI/nene2-node/pull/10))

## Verification

```bash
npm run check   # 23 tests
npm run dev     # http://localhost:3000
```

## Handoff

- OpenAPI: `resolveOpenApiPath()` → `../NENE2/docs/openapi/openapi.yaml`
- Fixtures: `tests/fixtures/contract/`
- Runtime: `createApp()` in `src/app/create-app.ts`
