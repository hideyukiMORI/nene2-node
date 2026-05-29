# Release process (npm + GitHub)

Automated publish via OIDC Trusted Publisher — see `.github/workflows/release.yml`.

## The one rule that prevents drift

> **A release happens only by creating a GitHub Release. The GitHub Release
> creates the tag _and_ triggers the npm publish. Never `git tag` by hand.**

`release.yml` triggers on `release: published` — **not** on a tag push. A
hand-cut tag therefore publishes nothing; it just creates an orphan tag that
looks released but is not. (This is exactly how `v0.1.24`/`v0.1.25` drifted —
see "Current release status" below.)

### Single source of truth

| Question                         | Answer                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| What is "the current release"?   | The latest **GitHub Release** = latest **npm** version.       |
| What is `package.json` `version` | The **next** release target while work accumulates on `main`. |
| Where do unreleased changes live | `CHANGELOG.md` **`[Unreleased]`**.                            |

Docs that cite a "current release" (`README.md`, `docs/todo/current.md`,
`docs/roadmap.md`) MUST cite the published version, never main's in-development
`package.json`. Distinguish **published** from **prepared / pending release**.

## Version cadence (0.1.x)

- Pre-1.0: stay on `0.1.x`; a breaking public-API change warrants `0.2.0`
  (see `docs/milestones/semver-0.2.0-breaking-inventory.md`).
- **Release at a deliberate checkpoint — end of an FT run or session — not once
  per FT.** Multiple merged FTs ship together in one release. npm tolerates
  version gaps; consumers map changes via CHANGELOG, not per-FT tags.

## Steps

Two scripts (Phase 9 E9) encode the mechanical steps; both accept `--dry-run`.

1. **Accumulate:** merge FT/feature PRs to `main`. Each PR adds its notes under
   `CHANGELOG.md` `[Unreleased]`.
2. **Prepare (release PR):**
   ```sh
   npm run release:prepare -- X.Y.Z   # rolls [Unreleased] → [X.Y.Z]; bumps package.json
   npm run check                      # must be green
   ```
   Review the diff, open the PR, merge.
3. **Publish (from `main`, after merge):**
   ```sh
   git checkout main && git pull
   npm run release:publish            # preconditions → gh release create vX.Y.Z
   ```
   `release:publish` verifies you are on a clean, in-sync `main`, the tag does not
   already exist, and a `## [X.Y.Z]` CHANGELOG section exists; then it creates the
   GitHub Release (notes from that section), which is the publish trigger. Never
   hand-tag.
4. The workflow runs `npm ci`, `npm run check`, `npm publish --provenance --access public`.
5. **Verify:** `npm view @hideyukimori/nene2-framework version` == `X.Y.Z`, and the
   GitHub Release is not a prerelease (prereleases are skipped by the workflow).
6. **Post-release:** update the "current release" line in `README.md` /
   `docs/roadmap.md` / `docs/todo/current.md` (the doc-integrity check enforces
   this matches `package.json`).

## Current release status

_Last reconciled: 2026-05-29._

| Version  | State                                                             |
| -------- | ----------------------------------------------------------------- |
| `0.1.23` | ✅ Published (npm + GitHub Release) — the real latest             |
| `0.1.24` | ⚠️ Tag only (lightweight, hand-cut). Never published. FT153 work. |
| `0.1.25` | ⚠️ Tag only (lightweight, hand-cut). Never published. FT177 work. |
| `0.1.26` | 🛠️ In development on `main` (FT178+). Not tagged, not released.   |

**Next release** will publish as `0.1.26` and fold in everything since `0.1.23`
(FT153 + FT177 + FT178+). npm will jump `0.1.23 → 0.1.26`; the orphan
`v0.1.24`/`v0.1.25` tags remain only as historical bump markers — **do not** try
to publish them. Do not delete pushed tags.

## Preconditions

- npm package Trusted Publisher: repo `hideyukiMORI/nene2-node`, workflow `release.yml`
- No `NPM_TOKEN` secret required
- Prerelease GitHub releases are skipped by the workflow

## Troubleshooting publish

| Symptom                                                     | Action                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Actions `npm publish` **404** on `@hideyukimori/...` | On [npm package settings](https://www.npmjs.com/package/@hideyukimori/nene2-framework/access), confirm **Trusted Publisher**: repo `hideyukiMORI/nene2-node`, workflow `release.yml`, environment blank. Re-run failed workflow or re-publish release. |
| A tag exists but nothing was published                      | No GitHub Release was created for it. Create the Release (step 3) — the tag push alone never publishes.                                                                                                                                                |
| Local publish asks for **OTP**                              | `npm publish --access public --otp=<6-digit>` (account 2FA).                                                                                                                                                                                           |
| Stale files in `dist/`                                      | `npm run rebuild` before publish (removed sources are not deleted by `tsc` alone).                                                                                                                                                                     |

## References

- `docs/publish-checklist.md`
- `docs/development/commit-conventions.md`
