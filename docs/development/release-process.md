# Release process (npm + GitHub)

Automated publish via OIDC Trusted Publisher — see `.github/workflows/release.yml`.

## Version cadence (Phase 2 field trials)

During **FT67–100** (application integration), bump the **patch** version when a field trial ships on `main`:

| Event                         | Version example                                                     |
| ----------------------------- | ------------------------------------------------------------------- |
| FT work merged, ready for npm | `0.1.1` → `0.1.2` → `0.1.3` …                                       |
| Pre-1.0 API                   | Stay on `0.1.x` until a breaking public API change warrants `0.2.0` |

Each release: update `package.json`, `CHANGELOG.md` (`[Unreleased]` → `[X.Y.Z]`), merge to `main`, then create GitHub Release tag `vX.Y.Z` (workflow publishes npm).

Do **not** skip versions; consumers can map FT reports to npm tags via CHANGELOG dates.

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

## Troubleshooting publish

| Symptom                                                     | Action                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Actions `npm publish` **404** on `@hideyukimori/...` | On [npm package settings](https://www.npmjs.com/package/@hideyukimori/nene2-framework/access), confirm **Trusted Publisher**: repo `hideyukiMORI/nene2-node`, workflow `release.yml`, environment blank. Re-run failed workflow or re-publish release. |
| Local publish asks for **OTP**                              | `npm publish --access public --otp=<6-digit>` (account 2FA).                                                                                                                                                                                           |
| Stale files in `dist/`                                      | `npm run rebuild` before publish (removed sources are not deleted by `tsc` alone).                                                                                                                                                                     |

## References

- `docs/publish-checklist.md`
- `docs/development/commit-conventions.md`
