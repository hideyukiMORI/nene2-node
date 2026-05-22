# Release process (npm + GitHub)

Automated publish via OIDC Trusted Publisher — see `.github/workflows/release.yml`.

## Steps

1. **PR on `main`:** bump `version` in `package.json` and `CHANGELOG.md` (Keep a Changelog format).
2. **Merge** after `npm run check` green.
3. **GitHub Release:** tag `vX.Y.Z` must match `package.json` version exactly.
4. Workflow runs `npm ci`, `npm run check`, `npm publish --provenance --access public`.
5. Verify npm page and GitHub release notes.

## Preconditions

- npm package Trusted Publisher: repo `hideyukiMORI/nene2-node`, workflow `release.yml`
- No `NPM_TOKEN` secret required
- Prerelease GitHub releases are skipped by workflow

## Post-release

- Update `docs/todo/current.md` if sprint changes
- Optional: nene2-js examples pointing at new version

## References

- `docs/publish-checklist.md`
- `docs/development/commit-conventions.md`
