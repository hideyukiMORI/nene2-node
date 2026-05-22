# Workflow

nene2-node uses GitHub Issues for work tracking and local Markdown for project memory.

## Standard flow

1. Create or reuse a focused GitHub Issue.
2. Confirm context in `docs/roadmap.md`, `docs/milestones/`, and `docs/todo/current.md`.
3. Create a branch from `main` named like `type/issue-number-summary`.
4. Implement the smallest useful change.
5. Update docs when the decision or state changes.
6. Run the narrowest meaningful verification (`npm run check` or a subset).
7. Commit with Conventional Commits and include the Issue number.
8. Push the branch and open a PR linked to the Issue.
9. Merge after review and checks.
10. Return local `main` to the merged, clean state.

If a user explicitly requests investigation only, no commit, or no PR, follow that narrower scope.

## Branch names

Use Conventional Commit type as the prefix:

- `docs/1-initial-governance`
- `feat/12-health-endpoint`
- `fix/34-problem-details-status`
- `test/8-middleware-throttle`

## PR requirements

Every PR should include:

- purpose
- change summary
- verification results (`npm run check` or what was run)
- related Issue (`Closes #number` when applicable)
- remaining risks or follow-up work

## Local project memory

- `docs/roadmap.md` — phases and long-lived direction
- `docs/milestones/` — medium goals and acceptance criteria
- `docs/todo/current.md` — current board and handoff notes
- `docs/adr/` — architecture and contract decisions

Do not leave important decisions only in chat. Record them in `docs/` when they affect how the project should be built.

## AI agent responsibilities

When asked to complete work end-to-end, agents should:

- create or reuse the Issue
- create the Issue branch
- edit only relevant files
- verify the change
- commit, push, open PR, merge, and sync `main` unless scope was narrowed
- update local docs that describe project state
