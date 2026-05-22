# Current work

Last updated: 2026-05-22  
**Sprint:** Phase 5 — MCP boundary and publish prep  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## In progress

| ID   | Task                         | Milestone                                          | Issue                                                       |
| ---- | ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| P5-1 | Build, MCP boundary, publish | [phase5](milestones/2026-05-phase5-mcp-publish.md) | [#17](https://github.com/hideyukiMORI/nene2-node/issues/17) |

## Up next (ordered)

| ID  | Task                 | Notes              |
| --- | -------------------- | ------------------ |
| —   | npm publish (manual) | After checklist OK |

## Completed (recent)

- [x] Phase 4 database + health ([#16](https://github.com/hideyukiMORI/nene2-node/issues/16))
- [x] Phase 2b throttle, CORS, logging ([#15](https://github.com/hideyukiMORI/nene2-node/issues/15))
- [x] Phase 3 Note CRUD ([#13](https://github.com/hideyukiMORI/nene2-node/issues/13))

## Verification

```bash
npm run check   # 53 tests
NENE2_NODE_DATABASE_URL=:memory: npm run dev
```
