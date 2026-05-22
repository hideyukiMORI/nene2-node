# Publish checklist — `@hideyukimori/nene2-framework@0.1.0`

Use this checklist before the first public npm release.

## Pre-release

- [ ] `npm run check` green on `main`
- [ ] `npm run build` produces `dist/` with `.d.ts` maps
- [ ] `package.json` `exports` resolves `.` → `dist/index.js`
- [ ] Version bumped to `0.1.0` in `package.json`
- [ ] `CHANGELOG.md` updated for `0.1.0`
- [ ] `private: false` only when ready to publish
- [ ] No secrets in repo; `.env` gitignored
- [ ] OpenAPI parity spot-check against sibling `NENE2` tag

## npm

- [ ] `npm whoami` / registry access for `@hideyukimori` scope
- [ ] `npm publish --access public` (dry-run: `npm pack` first)
- [ ] GitHub Release with tag `v0.1.0`

## Post-release

- [ ] nene2-js Issue to target Node server URL in examples (optional)
- [ ] Update `docs/todo/current.md` and close publish Issue
