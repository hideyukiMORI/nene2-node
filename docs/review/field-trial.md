# Field Trial Self-Review

Use when closing an FT Issue (sandbox, report, tests).

**Policies:** `field-trial-culture.md`, `workflow.md`, `coding-standards.md`, `security-policy.md`

## Checklist

- [ ] GitHub Issue exists; FT number recorded in report filename and INDEX.
- [ ] Scope is one theme; PR does not mix unrelated work.
- [ ] Tests added; `npm run check` passed.
- [ ] Report in `docs/field-trials/` uses `docs/templates/field-trial-report.md`.
- [ ] Friction points have follow-up Issues or same-PR doc/ADR fixes.
- [ ] Security section present when FT# % 3 = 0.
- [ ] No secrets, tokens, or production URLs in report or sandbox.
- [ ] Upstream NENE2 / nene2-python FT referenced when parity-related.
- [ ] `docs/field-trials/README.md` or `INDEX.md` updated when applicable.
- [ ] `docs/todo/current.md` updated for handoff if needed.
- [ ] PR mentions this checklist.
