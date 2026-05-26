# Current work

Last updated: 2026-05-27  
**Sprint:** v0.1.22 — optional items complete, tag ready

## Released

- **npm:** [v0.1.22](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.22) — MySQL/PG unit mocks, CI `npm audit`, 0.2.0 inventory (#108)
- **npm:** [v0.1.21](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.21) — `created_at` UTC ISO-8601 on example note/tag (FT148)
- **npm:** [v0.1.20](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.20) — default domain handlers in createApp (FT147)

## Recently merged

- PR #108 — MySQL/PG mocks, npm audit CI, 0.2.0 breaking inventory
- PR #107 — documentation freshness pass (integration guides, onboarding, `.env.example`)
- PR #104–#106 — README and doc sync for v0.1.21

## Next (optional — 0.2.0 planning)

- Review `docs/milestones/semver-0.2.0-breaking-inventory.md` and open Issues for decided items
- Redis service job in CI (all Redis tests already mocked; low urgency)

## Verification

```bash
npm install && npm run check && npm run test:coverage
```
