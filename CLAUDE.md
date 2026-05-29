# Claude Code — Project Rules

This file is read automatically at the start of every Claude Code session.

## Always: format before check

After creating or editing **any** file, run Prettier before `npm run check`:

```sh
npx prettier --write <files>
```

Never skip this step. `npm run check` runs `prettier --check` and will fail if formatting
is wrong — causing a wasted round-trip.

## FT campaigns: state snapshot every 3 FTs

When running a multi-FT campaign, after every 3 merged FTs write the current state to
the memory file:

```
/root/.claude/projects/-home-xi-docker-nene2-node/memory/ft-campaign-state.md
```

Record: last completed FT number, next FT to start, any open friction or blockers.  
This survives context compaction and allows the session to resume accurately.

## Check command

```sh
npm run check   # type-check → lint → format → test → build (must be green before PR)
```

## Branching

One branch per FT or logical group: `ft/NNN-theme` (docs-only: `docs/NNN-theme`).  
Merge to `main` via PR.

## Releasing — never hand-cut tags

Do **not** run `git tag` to "release". `release.yml` publishes on a **GitHub
Release** (`gh release create vX.Y.Z`), which creates the tag _and_ runs
`npm publish`; a bare tag push publishes nothing and leaves an orphan tag.
Accumulate merged work under `CHANGELOG.md` `[Unreleased]` and release at a
checkpoint (end of an FT run/session), not per FT. "Current release" in docs =
the published npm/GitHub-Release version, never main's in-dev `package.json`.
Full rule: `docs/development/release-process.md`.

## Deep field trials (FT178+)

Breadth is done. From FT178 the mode is **depth: executable proof over prose** —
a claim counts only when a test runs it. Scope = the `do` bucket of
`docs/field-trials/ft178-349-catalog.md` (priority 5 🔧new → 13 🔒 → 6 📄).

- Pure framework helper → **in-tree Vitest unit tests** (sufficient).
- App-surface security/behaviour (🔒) → a `../nene2-node-FT/ftNNN-*` D3+ sandbox
  **plus executable ATK/VULN attack tests** (not prose).
- **No app-breadth**: do not mirror PHP's `NENE2-examples` gallery. node's
  consumer examples ship in-package (`src/example/` + `includeExamples`);
  `nene2-node-FT` is local validation scratch, not a published repo.

Full doctrine: `docs/development/field-trial-culture.md` § Deep field trials.

## Decision trees

Fast answers to the calls that recur — don't re-derive them. Each points to the
authoritative doc.

**1 — Build it as a node FT, or skip?** (`docs/scope.md`, catalog triage axis)

- App-domain logic (a CRUD app, or an auth _flow_ like OTP / RBAC / password
  reset / field encryption)? → **skip** — consumer / PHP-sandbox territory.
- Already covered by an existing export or how-to (check the catalog `already`
  map)? → **skip** — don't duplicate.
- Mirroring a PHP app just for breadth? → **skip** — no app-breadth.
- Else, does it **verify node runtime behaviour or close a framework gap**? →
  **do** (that one axis decides it).

**2 — In-tree test or sandbox?** (deep-FT doctrine)

- Pure framework helper, deterministic, no app slice? → **in-tree Vitest** only.
- App-surface security/behaviour needing a real endpoint/DB to prove? → an
  **in-tree integration test** (`tests/security/…`, `createApp` / in-memory
  SQLite) so the attack matrix runs in CI. A `../nene2-node-FT/ftNNN-*` sandbox
  is an optional exploratory companion, never the system of record.
- Doc-only, no exercised code? → **doesn't count** as an FT (D0); don't fake it.

**3 — Release now, or accumulate?** (`docs/development/release-process.md`)

- Just merged one FT/feature? → **accumulate** under CHANGELOG `[Unreleased]`.
  Do **not** tag or release.
- Reached a checkpoint (themed batch done / session end / a consumer needs it)?
  → **release**: `npm run release:prepare -- X.Y.Z` → review PR → merge →
  `npm run release:publish`. Never hand-tag; never release per-FT.

**4 — Changing a public export?** (added/removed/renamed in `src/index.ts`)

- Expect `tests/api/public-surface.test.ts` to fail; if the change is intended,
  `npx vitest run -u …` and review the diff.
- New export → assign a tier in `docs/STABILITY.md` (Experimental unless clearly
  stable). Breaking a Stable export → route via the 0.2.0 inventory + an ADR.

## FT backlog

Active backlog: `docs/field-trials/ft178-349-catalog.md` (`do` bucket).  
Prior campaign: `docs/field-trials/ft149-177-backlog.md`.
