# Contributor onboarding

Fast path for humans and AI agents contributing to **this repository** (`nene2-node`). You do not need sibling repos to run `npm run check`.

## Day 1

1. Read `docs/scope.md` and `docs/development/engineering-policy.md`.
2. Clone **only** `nene2-node` — see [README.md](../../README.md) § Develop this repository.
3. `npm install && npm run check`.
4. `npm run dev` — see `local-development.md`.

**Optional:** clone [NENE2](https://github.com/hideyukiMORI/NENE2) when you need the live `openapi.yaml` on disk (`NENE2_NODE_OPENAPI_PATH`). Contract tests use pinned fixtures and do not require NENE2.

**Not required for framework work:** [nene2-js](https://github.com/hideyukiMORI/nene2-js) (HTTP client), [nene2-python](https://github.com/hideyukiMORI/nene2-python) (parity reference — consult when aligning behavior), [nene-mcp](https://github.com/hideyukiMORI/nene-mcp) (stdio MCP — out of scope).

## Before a PR

1. GitHub Issue exists (or references parent [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) for doc-only batches).
2. Branch: `type/issue-number-summary` per `docs/workflow.md`.
3. `npm run check` green; `npm run test:coverage` when touching `src/` or coverage thresholds.
4. Self-review: `docs/review/` checklists matching your change type.
5. English for user-facing docs; Conventional Commits for code.

## Field trials

FT campaigns through FT177 are complete (Phase 2 FT67–148; application-domain parity FT149–177, NENE2 PHP v1.5.111). New FTs require a dedicated Issue. Index: `docs/field-trials/INDEX.md`, template: `docs/templates/field-trial-report-compact.md`.

## References

- `docs/CONTRIBUTING.md`
- `AGENTS.md`
- `docs/integrations/cross-repo-parity.md` — when changing public JSON behavior
