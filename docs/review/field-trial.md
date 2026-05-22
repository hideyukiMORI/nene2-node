# Field Trial Self-Review

Use when closing an FT Issue (sandbox, report, tests).

**Policies:** `field-trial-culture.md`, `workflow.md`, `coding-standards.md`, `security-policy.md`

## Checklist

- [ ] GitHub Issue exists; FT number recorded in report filename and INDEX.
- [ ] Scope is one theme; PR does not mix unrelated work.
- [ ] Tests added; `npm run check` passed.
- [ ] Report uses `docs/templates/field-trial-report.md`.
- [ ] **DX review:** `docs/templates/ft-dx-personas.md` completed (six personas + summary).
- [ ] **Security diagnosis:** `docs/templates/ft-security-diagnosis.md` completed when FT# % 3 = 0; VULN findings fixed or filed.
- [ ] **Adversarial review:** `docs/templates/ft-adversarial-review.md` completed when FT# % 4 = 0; no exploit recipes in report.
- [ ] Friction points have follow-up Issues or same-PR doc/ADR fixes.
- [ ] No secrets, tokens, production URLs, or attack how-to in report or sandbox.
- [ ] Upstream NENE2 / nene2-python FT referenced when parity-related.
- [ ] `docs/field-trials/README.md` or `INDEX.md` updated (🔒 / 🔍 flags when applicable).
- [ ] `docs/todo/current.md` updated for handoff if needed.
- [ ] PR mentions this checklist.
