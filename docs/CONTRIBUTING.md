# Contributing

nene2-node is built through small, Issue-driven changes. This document is the shared entry point for humans and AI agents.

**Language:** user-facing documentation in this repository is **English** (README, `docs/`, ADRs, Issue/PR templates). Commit subjects use English descriptions (see commit conventions).

## Required reading

| Topic               | Document                                        |
| ------------------- | ----------------------------------------------- |
| Scope (do / do not) | `docs/scope.md`                                 |
| Workflow            | `docs/workflow.md`                              |
| Commit messages     | `docs/development/commit-conventions.md`        |
| Coding standards    | `docs/development/coding-standards.md`          |
| AI tools            | `docs/integrations/ai-tools.md`                 |
| NENE2 relationship  | `docs/integrations/relationship-to-nene2.md`    |
| nene2-js sibling    | `docs/integrations/relationship-to-nene2-js.md` |
| Roadmap             | `docs/roadmap.md`                               |
| Current work        | `docs/todo/current.md`                          |

## Collaboration policy

- Start work from a GitHub Issue.
- Use one branch and one PR per focused work unit.
- Keep `docs/roadmap.md`, `docs/milestones/`, and `docs/todo/current.md` updated when direction changes.
- Explain intent, impact, verification, and remaining risk in PRs.
- Prefer documentation that helps the next developer or AI agent decide what to do without rereading chat history.

## Secrets

Do not commit passwords, tokens, private URLs, production credentials, or local `.env` files. Commit only non-secret examples such as `.env.example`.

## Engineering theme

- strict TypeScript, explicit exports, small modules
- OpenAPI-compatible HTTP behavior over ad-hoc response shapes
- clean architecture — domain code free of framework imports
- tests that lock HTTP contracts and Problem Details shapes
- structure readable to humans and AI agents
