# Contributing

nene2-node is built through small, Issue-driven changes. This document is the shared entry point for humans and AI agents.

**Language:** user-facing documentation in this repository is **English** (README, `docs/`, ADRs, Issue/PR templates). Commit subjects use English descriptions (see commit conventions).

## Required reading

| Topic                    | Document                                         |
| ------------------------ | ------------------------------------------------ |
| Scope (do / do not)      | `docs/scope.md`                                  |
| Engineering policy index | `docs/development/engineering-policy.md`         |
| Issue-driven workflow    | `docs/workflow.md` (Issue → branch → PR → merge) |
| Commit messages          | `docs/development/commit-conventions.md`         |
| Coding standards         | `docs/development/coding-standards.md`           |
| Quality gates            | `docs/development/quality-tools.md`              |
| Domain layer             | `docs/development/domain-layer.md`               |
| API errors               | `docs/development/api-error-responses.md`        |
| Security                 | `docs/development/security-policy.md`            |
| Self-review              | `docs/development/self-review.md`                |
| AI tools                 | `docs/integrations/ai-tools.md`                  |
| NENE2 relationship       | `docs/integrations/relationship-to-nene2.md`     |
| nene2-js sibling         | `docs/integrations/relationship-to-nene2-js.md`  |
| Roadmap                  | `docs/roadmap.md`                                |
| Current work             | `docs/todo/current.md`                           |

## Collaboration policy

Full lifecycle: **`docs/workflow.md`** (Issue → branch → implement → commit → push → PR → merge → sync `main`).

- Start work from a GitHub Issue.
- Use one branch and one PR per focused work unit.
- Keep `docs/roadmap.md`, `docs/milestones/`, and `docs/todo/current.md` updated when direction changes.
- Explain intent, impact, verification, and remaining risk in PRs.
- Prefer documentation that helps the next developer or AI agent decide what to do without rereading chat history.

## Secrets

Do not commit passwords, tokens, private URLs, production credentials, or local `.env` files. Commit only non-secret examples such as `.env.example`.

## Engineering theme

Strictness is intentional: inherit NENE2 / nene2-python rules unless an ADR documents a Node-specific exception. See `docs/development/engineering-policy.md`.

- strict TypeScript, explicit exports, small modules
- OpenAPI-compatible HTTP behavior over ad-hoc response shapes
- clean architecture — domain code free of framework imports
- security-first middleware, validation, and safe Problem Details
- self-review checklists under `docs/review/` before PR
- `npm run check` before push when code changes
