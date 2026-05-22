# Current work

Last updated: 2026-05-22  
**Sprint:** Phase 2 — middleware and auth (next)  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## In progress

| ID | Task | Milestone | Status |
| -- | ---- | --------- | ------ |
| P1b | OpenAPI contract + dev server | [phase1b](milestones/2026-05-phase1b-contract-and-dev.md) | PR pending |
| P2-1 | Domain exception + error middleware | [phase2](milestones/2026-05-phase2-middleware-auth.md) | Next Issue |

## Up next (ordered)

| ID | Task | Phase |
| -- | ---- | ----- |
| P2-2 | Validation + `validation-failed` | 2 |
| P2-3 | Bearer token + `/examples/protected` | 2 |
| P2-4 | Throttle + CORS + structured logging | 2 |
| P3-1 | Note domain (interfaces + in-memory) | 3 |
| P3-2 | Note HTTP + SQLite | 3 |
| P3-3 | OpenAPI contract tests for notes | 3 |

## Completed (recent)

- [x] Phase 0 governance + FT culture
- [x] Phase 1 Hono runtime ([#7](https://github.com/hideyukiMORI/nene2-node/issues/7))
- [x] Master plan + milestones `2026-05-phase*` (7 docs)
- [x] Phase 1b contract fixtures + `npm run dev` (this sprint)

## Verification

```bash
npm run check   # 14 tests
npm run dev     # http://localhost:3000
```

## Handoff

- OpenAPI: `resolveOpenApiPath()` → `../NENE2/docs/openapi/openapi.yaml`
- Fixtures: `tests/fixtures/contract/`
- Runtime: `createApp()` in `src/app/create-app.ts`
