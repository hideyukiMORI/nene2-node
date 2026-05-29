# Milestone — Master plan (NENE2 functional parity)

**Horizon:** 2026 Q2–Q3  
**Current release:** [v0.2.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.2.0) (2026-05-29).  
**North star:** `@hideyukimori/nene2-framework` serves **OpenAPI-compatible JSON APIs** with the same public behavior as [NENE2](https://github.com/hideyukiMORI/NENE2), built with **strict TypeScript**, **testable clean architecture**, and **Node-native** patterns (not PHP transliteration).

**Parity benchmark:** [nene2-python](https://github.com/hideyukiMORI/nene2-python) module boundaries.  
**Contract source:** `../NENE2/docs/openapi/openapi.yaml`.

## Success criteria (v0.1.0 candidate)

| Area          | Done when                                                             |
| ------------- | --------------------------------------------------------------------- |
| System routes | `/`, `/health`, `/machine/health`, `/examples/ping` — contract-tested |
| Errors        | RFC 9457 for documented error responses                               |
| Auth          | Bearer + API key + composite patterns for example routes              |
| Example Note  | Full CRUD under `/examples/notes` — contract-tested                   |
| Middleware    | Error handler, throttle, logging, CORS — documented order             |
| Health        | Optional DB check → degraded `/health`                                |
| Quality       | `npm run check` green; coverage gate on UseCase layer (Phase 3+)      |

## Phase map

| Phase | Milestone doc                         | Target                                                                                              |
| ----- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0     | `2026-05-initial-bootstrap.md`        | Governance ✅                                                                                       |
| 1     | `2026-05-phase1-runtime-skeleton.md`  | Hono + system routes ✅                                                                             |
| 1b    | `2026-05-phase1b-contract-and-dev.md` | OpenAPI pin + `npm run dev` ✅                                                                      |
| 2     | `2026-05-phase2-middleware-auth.md`   | Pipeline + Bearer + throttle + logging ✅                                                           |
| 3     | `2026-05-phase3-note-crud.md`         | Note UseCase / SQLite / OpenAPI notes ✅                                                            |
| 4     | `2026-05-phase4-database-health.md`   | Executor, transactions, DB health ✅                                                                |
| 5     | `2026-05-phase5-mcp-publish.md`       | MCP boundary + npm `0.1.0` ✅ (publish [#21](https://github.com/hideyukiMORI/nene2-node/issues/21)) |

## Execution rules

1. **One Issue → one branch → one PR** (`docs/workflow.md`).
2. **OpenAPI wins** — new public shapes land in NENE2 first when shared across runtimes.
3. **Tests before merge** — HTTP or UseCase tests for every public behavior change.
4. **No `any` in `src/`** — extensions need ADR.
5. Update `docs/todo/current.md` when starting or finishing a milestone slice.

## Out of scope (this master plan)

- NENE2 PHP field-trial app library (`*log` repos)
- nene2-js client features
- Full Tag/Comment/MCP tool parity before Note reference is stable
