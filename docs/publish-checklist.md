# Publish checklist — `@hideyukimori/nene2-framework@0.1.0`

Use this checklist before the first public npm release.

## Pre-release

- [x] `npm run check` green on `main`
- [x] `npm run build` produces `dist/` with `.d.ts` maps
- [x] `package.json` `exports` resolves `.` → `dist/index.js`
- [x] Version bumped to `0.1.0` in `package.json`
- [x] `CHANGELOG.md` updated for `0.1.0`
- [x] `private: false` (release PR)
- [x] No secrets in repo; `.env` gitignored
- [ ] OpenAPI parity spot-check against sibling `NENE2` tag (maintainer)

## npm

```bash
npm login   # @hideyukimori scope
npm publish --access public
```

- [ ] `npm whoami` / registry access for `@hideyukimori` scope
- [x] Dry-run: `npm pack --dry-run` (tarball includes `dist/`, README, LICENSE, CHANGELOG)
- [ ] `npm publish --access public`
- [ ] GitHub Release with tag `v0.1.0`

```bash
gh release create v0.1.0 --title "v0.1.0" --notes-file CHANGELOG.md
```

## Post-release

- [ ] nene2-js Issue to target Node server URL in examples (optional)
- [ ] Update `docs/todo/current.md` and close [#21](https://github.com/hideyukiMORI/nene2-node/issues/21)
