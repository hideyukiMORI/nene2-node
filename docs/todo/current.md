# Current work

Last updated: 2026-05-22  
**Sprint:** Phase 2b — throttle, CORS, logging (next)  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## In progress

| ID   | Task                                 | Milestone                                              | Issue |
| ---- | ------------------------------------ | ------------------------------------------------------ | ----- |
| P2-4 | Throttle + CORS + structured logging | [phase2](milestones/2026-05-phase2-middleware-auth.md) | TBD   |

## Up next (ordered)

| ID   | Task                          | Phase |
| ---- | ----------------------------- | ----- |
| P4-1 | DB executor + transactions    | 4     |
| P4-2 | Database health → `/health`   | 4     |
| P5-1 | MCP boundary + npm 0.1.0 prep | 5     |

## Completed (recent)

- [x] Phase 3 Note CRUD ([#13](https://github.com/hideyukiMORI/nene2-node/issues/13))
- [x] Phase 2a domain errors + validation + Bearer ([#11](https://github.com/hideyukiMORI/nene2-node/issues/11))
- [x] Phase 1b contract + dev ([#9](https://github.com/hideyukiMORI/nene2-node/issues/9) / [#10](https://github.com/hideyukiMORI/nene2-node/pull/10))

## Verification

```bash
npm run check   # 44 tests
npm run dev     # http://localhost:3000 — try POST /examples/notes
```

## Handoff

- Notes: `src/example/note/`, wired in `createApp()`
- OpenAPI: `resolveOpenApiPath()` → `../NENE2/docs/openapi/openapi.yaml`
- Fixtures: `tests/fixtures/contract/note-*.json`
