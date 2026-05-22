# Publish checklist — `@hideyukimori/nene2-framework@0.1.0`

**Status:** Released 2026-05-22 — [GitHub v0.1.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0)

## Pre-release

- [x] `npm run check` green on `main`
- [x] `npm run build` produces `dist/` with `.d.ts` maps
- [x] `package.json` `exports` resolves `.` → `dist/index.js`
- [x] Version bumped to `0.1.0` in `package.json`
- [x] `CHANGELOG.md` updated for `0.1.0`
- [x] `private: false`
- [x] No secrets in repo; `.env` gitignored
- [ ] OpenAPI parity spot-check against sibling `NENE2` tag (optional follow-up)

## npm

- [x] `npm publish --access public` → `@hideyukimori/nene2-framework@0.1.0`
- [x] GitHub Release [v0.1.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0)

## Post-release

- [ ] nene2-js Issue to target Node server URL in examples (optional)
- [x] Close [#21](https://github.com/hideyukiMORI/nene2-node/issues/21)
