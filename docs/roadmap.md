# Roadmap

nene2-node is the Node.js framework port of [NENE2](https://github.com/hideyukiMORI/NENE2), parallel to [nene2-python](https://github.com/hideyukiMORI/nene2-python). Phases are Issue-driven; update this file when scope or priority changes.

## Phase 0 — Governance (current)

**Goal:** repository bootstrap with clear scope, English docs, and CI aligned with nene2-js workflow.

- [x] README, LICENSE, scope, workflow, commit conventions (English)
- [x] AGENTS.md and AI tooling policy
- [x] ADR 0001 — scope and sibling repositories
- [x] ADR 0002 — HTTP runtime direction (draft)
- [ ] GitHub repository and default branch protection
- [ ] Initial Issues for Phase 1 deliverables

## Phase 1 — Runtime skeleton

**Goal:** smallest useful HTTP server matching NENE2 `/health` and `/examples/ping`.

- HTTP adapter choice finalized (see ADR 0002)
- Request/response types, JSON body parsing
- Problem Details response factory (RFC 9457 subset used by NENE2)
- `GET /health`, `GET /examples/ping` with Vitest HTTP-level tests
- Contract check against pinned OpenAPI revision (fixture or live optional)

## Phase 2 — Middleware and auth baseline

**Goal:** production-oriented pipeline comparable to NENE2 Phase 1–2 middleware.

- Error handler, security headers, request ID, request size limit
- Throttle / rate limit (in-memory storage first)
- Bearer token and API key middleware
- Structured logging (Node-idiomatic; JSON in production)

## Phase 3 — Example domain (Note)

**Goal:** full Note CRUD as reference implementation (parity with NENE2 Example).

- UseCase / Repository / Handler layering
- SQLite adapter for tests
- Domain exceptions → Problem Details
- OpenAPI operation coverage for `/examples/notes`

## Phase 4 — Database and health checks

**Goal:** real DB adapter and degradable `/health`.

- Transaction manager and query executor interfaces
- Optional MySQL verification (Docker Compose, CI job)
- Database health check integration

## Phase 5 — MCP and publish prep

**Goal:** safe MCP boundary and first npm publish candidate.

- Local MCP server or HTTP client aligned with NENE2 catalog format
- README quick start, migration guide from PHP NENE2
- `0.1.0` publish of `@hideyukimori/nene2-framework` when API stable

## Non-goals

- Replacing nene2-js client packages
- Replacing nene-mcp stdio servers
- Full feature parity with every NENE2 field trial on day one

See `docs/scope.md` for the authoritative boundary list.
