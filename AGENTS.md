# Agent / AI Guide

Entry point for AI agents working on **nene2-node**.

## Read first

- Scope (mandatory): `docs/scope.md`
- Collaboration: `docs/CONTRIBUTING.md`
- Workflow: `docs/workflow.md`
- Coding standards: `docs/development/coding-standards.md`
- Commits: `docs/development/commit-conventions.md`
- NENE2 boundary: `docs/integrations/relationship-to-nene2.md`
- Client sibling: `docs/integrations/relationship-to-nene2-js.md`
- Roadmap: `docs/roadmap.md`
- Current work: `docs/todo/current.md`

## Operating rules

- Work from GitHub Issues. Create an Issue before implementation or policy doc changes.
- Do not commit directly to `main`. Branch: `type/issue-number-summary`.
- Keep `docs/todo/current.md` aligned with Issues and PRs.
- One focused change per PR — no mixed runtime rollout + unrelated refactors.
- Do not commit secrets, `.env`, or generated `dist/` unless release policy changes.
- **Do not** add client-only fetch wrappers here — use [nene2-js](https://github.com/hideyukiMORI/nene2-js).
- **Do not** duplicate nene-mcp stdio server behavior; follow NENE2 HTTP/MCP boundaries.

## Project direction

Node.js framework port of NENE2:

- OpenAPI-aligned HTTP surface and Problem Details
- Clean architecture (UseCase, Repository, Handler)
- Strict TypeScript, Vitest, ESLint, Prettier
- npm publish path for `@hideyukimori/nene2-framework` when stable
- **English** for user-facing docs in this repo (international audience)

PHP runtime and OpenAPI **authoring** stay in [NENE2](https://github.com/hideyukiMORI/NENE2). Parity reference: [nene2-python](https://github.com/hideyukiMORI/nene2-python).

## Local commands

```bash
npm install
npm run check
```
