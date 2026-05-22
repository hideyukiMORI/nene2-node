# Agent / AI Guide

Entry point for AI agents working on **nene2-node**.

## Read first

- Scope (mandatory): `docs/scope.md`
- Engineering policy (mandatory): `docs/development/engineering-policy.md`
- Collaboration: `docs/CONTRIBUTING.md`
- Issue-driven workflow: `docs/workflow.md` (Issue → branch → commit → push → PR → merge)
- Coding standards: `docs/development/coding-standards.md`
- Quality / security: `docs/development/quality-tools.md`, `docs/development/security-policy.md`
- Domain / errors: `docs/development/domain-layer.md`, `docs/development/api-error-responses.md`
- Self-review: `docs/development/self-review.md`, `docs/review/`
- Field trials: `docs/development/field-trial-culture.md`
- Commits: `docs/development/commit-conventions.md`
- NENE2 boundary: `docs/integrations/relationship-to-nene2.md`
- Client sibling: `docs/integrations/relationship-to-nene2-js.md`
- Roadmap: `docs/roadmap.md`
- Current work: `docs/todo/current.md`
- Field trials: `docs/field-trials/backlog.md`, `docs/field-trials/INDEX.md` (FT1–148 complete for Phase 2 scope)
- Cross-repo parity: `docs/integrations/cross-repo-parity.md`
- Contributor path: `docs/development/contributor-onboarding.md`
- Release: `docs/development/release-process.md`

## Operating rules

- Follow `docs/development/engineering-policy.md`; do not relax upstream rules without an ADR.
- Run `npm run check` before finishing code changes; use `docs/review/` checklists in PR notes.
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
- npm package `@hideyukimori/nene2-framework` published (latest: see [CHANGELOG.md](CHANGELOG.md))
- **English** for user-facing docs in this repo (international audience)

PHP runtime and OpenAPI **authoring** stay in [NENE2](https://github.com/hideyukiMORI/NENE2). Parity reference: [nene2-python](https://github.com/hideyukiMORI/nene2-python).

## Local commands

```bash
npm install
npm run check
```
