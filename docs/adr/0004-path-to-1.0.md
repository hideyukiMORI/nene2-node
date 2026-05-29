# ADR 0004 — Path to 1.0

**Status:** Accepted
**Date:** 2026-05-29
**Issue:** #165
**Supersedes context in:** [ADR 0003](0003-ai-velocity-hardening.md) §B5

---

## Context

`@hideyukimori/nene2-framework` is at `0.1.26` with a large public surface (159
exports), classified into **Stable** / **Experimental** by
[`docs/STABILITY.md`](../STABILITY.md). Under SemVer `0.x` every change is
nominally breaking, so consumers can't yet rely on stability. The agent also
lacks a decision boundary for "is this change 1.0-blocking?". This ADR fixes the
road to 1.0 so that boundary is explicit.

A breaking-change backlog already exists:
[`semver-0.2.0-breaking-inventory.md`](../milestones/semver-0.2.0-breaking-inventory.md)
(5 candidates: remove `openApiFileExists`/`DEFAULT_OPENAPI_RELATIVE`, sync
`createApp`, rename `executor`→`queryExecutor`, Node 24 minimum, `TokenVerifier.verify`
→ `Promise`).

## Decision

### Sequence: `0.1.x → 0.2.0 → 1.0`

Ship the breaking cleanup as **0.2.0** _before_ 1.0, so 1.0 freezes an
already-clean API rather than baking the cleanup into the freeze. Patch
(`0.1.x`) releases continue meanwhile for additive work.

### Freeze scope: curated Stable core, keep the Experimental tier

At 1.0 the **Stable** exports become frozen under standard SemVer. The
**Experimental tier mechanism persists**: 1.x minors may introduce new surface as
Experimental and promote it later. This keeps the framework evolvable post-1.0
without forcing a 2.0, and reuses the existing `STABILITY.md` two-tier model.

### 1.0 gates (all required)

1. **0.2.0 shipped.** Every decided item in the 0.2.0 breaking inventory is
   released — **including raising the minimum runtime to Node 24 LTS** (SQLite no
   longer experimental).
2. **OpenAPI contract coverage.** Every public route has a contract test against
   NENE2 `openapi.yaml`.
3. **Experimental tier empty at the cut.** Each Experimental export is either
   **promoted to Stable** (proven across a release cycle, tested) or **removed**.
   The tier mechanism stays for future surface; it is just empty at the 1.0 tag.

### Explicitly NOT a gate

- **Real-consumer adoption.** Desirable (dogfooding), but not a blocker for tagging
  1.0.

### Post-1.0 SemVer

Standard SemVer: breaking change to a Stable export → **major (2.0)**; additive →
**minor**; fixes → **patch**. Removing/renaming a Stable export is a 2.0 concern,
routed through an inventory + ADR (same discipline as 0.2.0).

## Consequences

- **North star + decision boundary.** "Is this 1.0-blocking?" reduces to: does it
  advance a gate (0.2.0 items, contract coverage, Experimental promotion)? If not,
  it is 1.x/2.0 scope.
- **Experimental promotion becomes a release ritual** — at each minor, review
  Experimental entries for promotion/removal (already noted in `STABILITY.md`);
  by 1.0 the tier must be empty.
- **No 1.0 date is committed** — it is gate-driven, not calendar-driven.
- **Cost:** 0.2.0 (5 breaking items + ADRs/Issues) and a contract-coverage audit
  are prerequisites; both are tracked work, not open-ended.

## Checklist (gate tracking)

- [x] 0.2.0 — shipped (ADR 0005 batch). ✅ **gate 1**
- [x] Node 24 LTS minimum (part of 0.2.0; `engines` bumped, experimental-SQLite caveats dropped).
- [x] OpenAPI contract tests for every public route — all 9 `openapi.yaml` paths covered (system, protected, notes/tags GET/POST + `/{id}` GET/PUT/DELETE). ✅ **gate 2**
- [~] Experimental tier — 0.2.0 helpers promoted; distributed-lock cluster promoted after `RedisLockStorage` validated the interface. Only the new `RedisLockStorage` is Experimental (one cycle); tier empties when it promotes.
- [ ] Tag `1.0.0` via the normal release flow (`release:prepare`/`release:publish`).

## References

- `docs/STABILITY.md` (tiers; promotion rule)
- `docs/milestones/semver-0.2.0-breaking-inventory.md` (0.2.0 candidates)
- `docs/development/release-process.md` (release flow)
- [ADR 0003](0003-ai-velocity-hardening.md) (this is its §B5)
