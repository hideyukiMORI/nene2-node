# Publish checklist — `@hideyukimori/nene2-framework`

**Latest:** `0.1.21` — [v0.1.21](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.21) (2026-05-22). Phase 2 patch cadence: one npm release per completed FT on `main` (`0.1.2` … `0.1.21`).

## Pre-release (every patch)

- [ ] `npm run check` green on `main`
- [ ] `npm run test:coverage` meets thresholds (CI enforces ≥80% global, ≥90% example UseCases)
- [ ] `npm run build` produces `dist/` with `.d.ts` maps
- [ ] `package.json` `exports` resolves `.` → `dist/index.js`
- [ ] Version bumped in `package.json` + `CHANGELOG.md` (`[Unreleased]` → `[X.Y.Z]`)
- [ ] `private: false`
- [ ] No secrets in repo; `.env` gitignored
- [ ] OpenAPI parity spot-check against sibling `NENE2` tag when contract fixtures change (optional)

## npm (automated)

Trusted Publisher: `hideyukiMORI/nene2-node` · workflow `release.yml` (OIDC — no `NPM_TOKEN`).

### Steps for each release

See **`docs/development/release-process.md`** for full steps.

1. Bump `version` in `package.json` + `CHANGELOG.md` on `main` (PR).
2. Publish GitHub Release with tag `vX.Y.Z` matching `package.json`.
3. `.github/workflows/release.yml` runs `npm publish --provenance --access public`.

Prerelease GitHub releases are skipped (`prerelease: false` filter).

## First publish (v0.1.0) — completed 2026-05-22

- [x] `npm publish --access public` → `@hideyukimori/nene2-framework@0.1.0`
- [x] GitHub Release [v0.1.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0)
- [x] Close [#21](https://github.com/hideyukiMORI/nene2-node/issues/21)

## Post-release

- [ ] Update `docs/todo/current.md` when sprint changes
- [ ] Optional: nene2-js examples pointing at new version
