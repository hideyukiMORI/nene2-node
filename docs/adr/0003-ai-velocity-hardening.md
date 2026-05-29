# ADR 0003 — AI-velocity hardening

**Status:** Accepted
**Date:** 2026-05-29
**Issue:** #149

---

## Context

nene2-node is developed primarily by AI agents (Claude Code) at high velocity —
the FT178–187 phase shipped 11 framework helpers and a release in a single
session. The bottleneck on quality and speed is **judgment**: every time the
agent must decide something that is not encoded anywhere — _is this in scope? may
I change this export? should I tag/release now? where does the proof live? is
this doc stale?_ — it slows down, and occasionally errs. Real incidents this
phase:

- `v0.1.24` / `v0.1.25` were hand-tagged but never published (release ambiguity).
- "Current release" version references drifted stale in living docs (twice).
- The FT187 DB-level injection proof lives only in a local, un-versioned sandbox
  (not reproducible in CI).
- The public export surface (73 exports) grew fast with no stable/experimental
  signal, so "may I change this?" is an open question on every edit.

## Decision

The north star is **robust, fast, hesitation-free AI development.** The operating
principle:

> **Every recurring AI decision becomes a rule (doc), a guardrail (CI/test), or
> automation (script). Judgment is reserved for genuinely novel choices.**

Concretely, we adopt the program below. It is sequenced by leverage: the earliest
items remove the decisions the agent hits most often.

### A — Guardrails (machine-checked; highest leverage)

- **A1. Public API surface snapshot test.** Commit a snapshot of the public
  exports (names + types); a test fails on any unintended change. Turns "did I
  alter/break the public API?" from judgment into a red test, and makes every
  surface change a reviewed, deliberate diff.
- **A2. Doc-integrity CI.** Script + CI job asserting: `INDEX.md` rows ==
  field-trial report files; no broken intra-doc links; the "current release"
  string == `package.json` version. Promotes the manual freshness checks done by
  hand this phase into a permanent gate.
- **A3. Release safety.** Detect "tag exists without a GitHub Release" (the
  drift that stranded 0.1.24/0.1.25), or discourage hand tags entirely. Pair with
  the release rule in `docs/development/release-process.md`.

### B — Stability signals (removes the biggest standing judgment)

- **B4. Stability markers.** Annotate each public export `@stable` /
  `@experimental` (JSDoc and/or a `STABILITY.md`). The agent then iterates freely
  on experimental surface and treats stable surface as frozen — no per-edit
  deliberation.
- **B5. Path-to-1.0 ADR.** Define the 1.0 criteria (public API frozen, contract
  test coverage, Node 24 LTS baseline, etc.). A written boundary is a north star
  and a decision rule.

### C — Proofs in CI (close the doctrine gap)

- **C6.** Bring the "executable proof" sandboxes (`../nene2-node-FT/ftNNN-*`) into
  the repo/CI — either as a committed workspace or by porting their attack
  matrices into in-tree integration tests — so proof-over-prose is reproducible,
  not local-only.

### D — Density over volume (lower maintenance surface)

- **D7.** Generate `INDEX.md` from report frontmatter; consolidate thin/ceremonial
  FT reports. Less prose to drift = less agent maintenance burden.

### E — Operating contract (minimise residual judgment)

- **E8.** Strengthen `CLAUDE.md` into decision trees: FT vs skip; in-tree test vs
  sandbox; release-now vs accumulate.
- **E9.** Release automation: a `release` script / `workflow_dispatch` that rolls
  `[Unreleased]` → `[X.Y.Z]`, verifies `package.json`, and runs
  `gh release create`. Removes the fragile hand-steps.

## SemVer & release-timing policy (made explicit)

- Work accumulates under CHANGELOG `[Unreleased]`; `package.json` holds the next
  target. A **release** = cutting a GitHub Release at a checkpoint (theme/session
  boundary or on-demand), which creates the tag and publishes via OIDC. Never
  per-FT, never a hand tag.
- `0.x`: additive/backward-compatible → **patch** (`0.1.x`); breaking public-API
  change → **minor** (`0.2.0`). Post-1.0: standard SemVer.

## Consequences

- **Positive:** the agent makes fewer, smaller judgment calls; mistakes (API
  drift, stale docs, release ambiguity) become failing checks rather than
  reviewer catches; velocity rises with quality held by automation.
- **Cost:** up-front work to build the snapshot/CI/scripts; a snapshot test adds a
  deliberate step when intentionally changing the API (this is the point).
- **Priority:** **A1 → A2 → B4** first (highest leverage); C/D/E as capacity
  allows. Each item ships as its own Issue + PR.

## References

- `docs/development/release-process.md` (release rule)
- `docs/development/field-trial-culture.md` § Deep field trials (proof doctrine)
- `docs/milestones/semver-0.2.0-breaking-inventory.md` (breaking-change candidates)
- `docs/scope.md` (scope boundary the agent must respect)
