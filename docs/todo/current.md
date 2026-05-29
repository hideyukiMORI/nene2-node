# Current work

Last updated: 2026-05-29  
**Sprint:** Road to 1.0 (ADR 0004) — gates 1 & 2 done; gate 3 nearly done

## Published to npm

- **npm latest:** [v0.3.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.3.0) — distributed lock: atomic `LockStorage.putIfAbsent` + `RedisLockStorage` (cross-instance mutual exclusion). Lock cluster promoted to Stable.
- **npm:** [v0.2.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.2.0) — first breaking release (ADR 0005): export removal, `executor`→`queryExecutor`, Node 24 LTS minimum, `TokenVerifier.verify`→Promise. Road-to-1.0 gate 1.
- **npm:** [v0.1.26](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.26) — FT178–187 deep-FT phase: 11 new framework helpers
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
