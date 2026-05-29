# Current work

Last updated: 2026-05-29  
**Sprint:** FT178+ deep-FT phase — **complete & released as v0.1.26**

## Published to npm

- **npm latest:** [v0.1.26](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.26) — FT178–187 deep-FT phase: 11 new framework helpers (npm jumped 0.1.23 → 0.1.26; `v0.1.24`/`v0.1.25` tags were never published)
- **npm:** [v0.1.23](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.23) — Redis integration test + CI service job (#110)
- **npm:** [v0.1.22](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.22) — MySQL/PG unit mocks, CI `npm audit`, 0.2.0 inventory (#108)

## Recently merged

- PR #147 — release 0.1.26 (CHANGELOG finalize) → GitHub Release v0.1.26 published to npm
- PR #146 — close security bucket; reclassify auth-flow FTs as app-domain
- PRs #122–#144 — FT178–187 (11 framework helpers): ETag, sort-query, circuit-breaker, distributed-lock, validation-collector, merge-patch, unicode validation, SSRF guard, tenant isolation, SQL-injection/escapeLikePattern

## Next

- **FT178–349 catalog actionable bucket is complete** — 🔧new (5) + 🔒 framework (6) done; auth-flow 🔒 reclassified app-domain; 📄 already documented. See [catalog Progress](../field-trials/ft178-349-catalog.md).
- **Optional next phases:** scope a new FT range (PHP FT350+), or 0.2.0 planning (`docs/milestones/semver-0.2.0-breaking-inventory.md`, 5 draft candidates).

## Verification

```bash
npm install && npm run check && npm run test:coverage
```
