# Field trial report — FT66: CHANGELOG + version discipline

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `release.yml` verifies tag matches `package.json` version.
- `CHANGELOG.md` follows Keep a Changelog for v0.1.0.

## Doc updates (docs-first)

- **New:** `release-process.md`; links from `publish-checklist.md` path.

## Security diagnosis (FT66 % 3 = 0)

| Area                 | Result                                                      |
| -------------------- | ----------------------------------------------------------- |
| Supply chain publish | pass — OIDC provenance, `npm run check` in release workflow |
| Wrong tag publish    | pass — CI gate rejects mismatch                             |

**Overall:** pass.

## Follow-up

- None.
