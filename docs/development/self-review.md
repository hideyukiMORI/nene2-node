# Self-Review Checklist Policy

Task-oriented checklists reduce missed mandatory rules before push or PR. Mirrors NENE2 `docs/development/self-review.md`.

## How to use

1. Identify the work type (API, middleware, docs, OpenAPI sync).
2. Open matching files under `docs/review/`.
3. Check every applicable item; mark others `N/A` in the PR — do not delete checklist lines.
4. Run `npm run check` when code changed.
5. Note checklists in the PR body:

```text
Self-review: backend-api, openapi-contract
```

## Checklist index

| File                                 | Use when                                             |
| ------------------------------------ | ---------------------------------------------------- |
| `docs/review/backend-api.md`         | Endpoints, handlers, UseCases, validation, responses |
| `docs/review/middleware-security.md` | Middleware, auth, headers, CORS, throttle            |
| `docs/review/openapi-contract.md`    | OpenAPI pin, contract tests, Problem Details types   |
| `docs/review/docs-policy.md`         | Documentation-only PRs                               |

## Design rules for checklists

- Link to policy docs; do not copy entire policies.
- Include stable commands (`npm run check`).
- Avoid vague items (“code is clean”).

## AI agents

Before finalizing a change:

- Pick relevant checklist(s).
- Do not claim an item passed without running the check.
- If no checklist fits, use `engineering-policy.md`, `coding-standards.md`, and `workflow.md` directly.

## Updates

When policy adds a mandatory rule, update the checklist in the **same PR** when possible.

## ADRs vs checklists

- Checklists: repeatable review risks.
- ADRs: one-time architectural decisions — do not expand checklists into design essays.
