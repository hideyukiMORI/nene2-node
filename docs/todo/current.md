# Current work

Last updated: 2026-05-22  
**Sprint:** FT Phase 2 — FT70+ (CI DB, migrations, business apps) — [#29](https://github.com/hideyukiMORI/nene2-node/issues/29)  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## Released

- **GitHub:** [v0.1.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0) (tag `62df4a7`)
- **npm:** `@hideyukimori/nene2-framework@0.1.0` (MySQL/Postgres adapters merged on `main` via PR #42; publish 0.1.1 when ready)

```bash
npm install @hideyukimori/nene2-framework
```

## Up next (ordered)

| ID  | Task                                         |
| --- | -------------------------------------------- |
| —   | **FT70** CI service container (MySQL) design |
| —   | FT71–72 migrations, pool docs                |
| —   | FT73–80 business-app obstacle FTs            |
| —   | FT81–100 publish / governance                |

## Completed (recent)

- [x] FT69 PostgreSQL Compose ([#29](https://github.com/hideyukiMORI/nene2-node/issues/29))
- [x] PR #42 — MySQL/PostgreSQL adapters, closes #37–#39
- [x] FT67–68 sandboxes + Issue gate docs
- [x] FT batch 6: FT55–FT66 ([#29](https://github.com/hideyukiMORI/nene2-node/issues/29))

## Verification

```bash
npm run check
```
