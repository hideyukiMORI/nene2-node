# AI Tooling Policy

nene2-node should be easy for AI agents to inspect, change, and verify without guessing.

## Source of truth

- Scope: `docs/scope.md`
- Direction: `README.md`, `docs/roadmap.md`
- Workflow: `docs/workflow.md`
- Coding rules: `docs/development/coding-standards.md`
- Current state: `docs/todo/current.md`
- Agent entry: `AGENTS.md`

## Agent workflow

Full lifecycle (Issue, branch, commit, push, PR, merge): `docs/workflow.md`.

1. Confirm or create a GitHub Issue.
2. Check roadmap and `docs/todo/current.md`.
3. Branch from `main`: `type/issue-number-summary`.
4. Make focused changes only.
5. Update docs when behavior or policy changes.
6. Run `npm run check` or the narrowest subset.
7. Commit, push, PR, merge unless the user narrowed scope (see workflow exceptions).

## Safety boundaries

- Do not commit secrets or `.env`.
- Do not implement thin API clients here — use nene2-js.
- Do not duplicate nene-mcp stdio servers.
- Destructive git operations require explicit user approval.
- For new public HTTP contracts, default to **NENE2 Issue first**, then implement here.

## Parity checks

When unsure about behavior, compare with:

- NENE2 PHP: `../NENE2/src/`
- nene2-python: `../nene2-python/src/nene2/`
- OpenAPI: `../NENE2/docs/openapi/openapi.yaml`

Record intentional Node-specific deviations in an ADR.
