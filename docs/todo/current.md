# Current work

Last updated: 2026-05-22  
**Sprint:** FT Phase 2 — publish cadence + FT70+ — [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## Released

- **npm:** `@hideyukimori/nene2-framework@0.1.1` (after GitHub Release `v0.1.1`) — MySQL/PostgreSQL, async `createApp`
- **npm:** `@hideyukimori/nene2-framework@0.1.0` — initial framework
- **GitHub:** [v0.1.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0)

```bash
npm install @hideyukimori/nene2-framework
```

## Version cadence (Phase 2)

Each completed FT → patch release: **FT70 → `0.1.2`**, **FT71 → `0.1.3`**, … See [release-process.md](development/release-process.md).

## Up next (ordered)

| ID  | Task                                         | npm after merge |
| --- | -------------------------------------------- | --------------- |
| —   | Release **v0.1.1** (adapters + postgres fix) | `0.1.1`         |
| —   | **FT70** CI service container (MySQL) design | `0.1.2`         |
| —   | FT71–72 migrations, pool docs                | `0.1.3` …       |
| —   | FT73–80 business-app obstacle FTs            | …               |

## Completed (recent)

- [x] FT69 PostgreSQL Compose ([#29](https://github.com/hideyukiMORI/nene2-node/issues/29))
- [x] PR #42 / #43 — DB adapters + postgres `RETURNING id`
- [x] FT67–68 + Issue gate

## Verification

```bash
npm run check
```
