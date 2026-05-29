# Current work

Last updated: 2026-05-29  
**Sprint:** idle — FT149–177 campaign complete (NENE2 PHP v1.5.111 parity)

## Released

- **npm:** [v0.1.25](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.25) — `parsePaginationQuery` boundary hardening (FT177); FT campaign complete (#116)
- **npm:** [v0.1.24](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.24) — `parseCursorQuery` helper + activity feed (FT153) (#115)
- **npm:** [v0.1.23](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.23) — Redis integration test + CI service job (#110)
- **npm:** [v0.1.22](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.22) — MySQL/PG unit mocks, CI `npm audit`, 0.2.0 inventory (#108)
- **npm:** [v0.1.21](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.21) — `created_at` UTC ISO-8601 on example note/tag (FT148)

## Recently merged

- PR #116 — `parsePaginationQuery` boundary-attack hardening (FT177)
- PR #115 — `parseCursorQuery` helper + activity feed (FT153)
- PR #112/#113/#114 — FT149–176 how-to docs and field-trial reports
- PR #110 — Redis integration test + CI service job
- PR #108 — MySQL/PG mocks, npm audit CI, 0.2.0 breaking inventory

## Next (no work in flight)

- **0.2.0 planning:** review `docs/milestones/semver-0.2.0-breaking-inventory.md` (5 draft candidates) and open Issues for decided items
- **FT178+:** scope next field-trial phase (none defined yet)

## Verification

```bash
npm install && npm run check && npm run test:coverage
```
