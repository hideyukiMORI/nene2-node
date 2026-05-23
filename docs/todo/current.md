# Current work

Last updated: 2026-05-23  
**Sprint:** Documentation freshness pass (README, integration guides, onboarding)

## Released

- **npm:** [v0.1.21](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.21) — `created_at` UTC ISO-8601 on example note/tag (FT148)
- **npm:** [v0.1.20](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.20) — default domain handlers in createApp (FT147)
- **npm:** [v0.1.19](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.19) — BOLA ownership in example note/tag (FT146)

## Recently merged (docs)

- PR #104 — doc sync indexes/auth with v0.1.21
- PR #105 — README sibling clone clarity
- PR #106 — README install section rename
- PR #107 — documentation freshness pass (integration guides, onboarding, `.env.example`)

## Next (optional)

- Close [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) after optional follow-ups triaged
- MySQL/PG unit mocks for `create-database-runtime`
- Semver **0.2.0** breaking-change inventory
- CI: `npm audit` step, optional Redis service job

## Verification

```bash
npm install && npm run check && npm run test:coverage
```
