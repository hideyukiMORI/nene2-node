# Current work

Last updated: 2026-05-29  
**Sprint:** FT178+ phase (framework parity from the FT178–349 catalog)

## Published to npm

- **npm latest:** [v0.1.23](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.23) — Redis integration test + CI service job (#110)
- **npm:** [v0.1.22](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.22) — MySQL/PG unit mocks, CI `npm audit`, 0.2.0 inventory (#108)
- **npm:** [v0.1.21](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.21) — `created_at` UTC ISO-8601 on example note/tag (FT148)

## Prepared / pending release (on `main`, NOT yet on npm)

Will ship in the next GitHub Release as **`0.1.26`** (see [release process](../development/release-process.md)):

- `v0.1.24` tag (FT153 `parseCursorQuery`) — tagged, never published
- `v0.1.25` tag (FT177 `parsePaginationQuery` hardening) — tagged, never published
- `0.1.26` (FT178 ETag conditional requests) — in development, untagged

## Recently merged

- PR #122 — ETag conditional requests helper (FT178)
- PR #120 — FT178–349 upstream parity triage catalog
- PR #118 — freshness pass to v0.1.25 and FT149–177 index
- PR #116 — `parsePaginationQuery` boundary-attack hardening (FT177)
- PR #115 — `parseCursorQuery` helper + activity feed (FT153)

## Next

- **Release:** cut `0.1.26` GitHub Release at the next checkpoint to make npm current.
- **FT178+:** continue the 🔧new bucket from the [FT178–349 catalog](../field-trials/ft178-349-catalog.md) — FT298 circuit-breaker, FT288 distributed-lock, FT322 nested-json-validation, FT326 patch-partial-update.
- **0.2.0 planning:** review `docs/milestones/semver-0.2.0-breaking-inventory.md` (5 draft candidates).

## Verification

```bash
npm install && npm run check && npm run test:coverage
```
