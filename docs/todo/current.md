# Current work

Last updated: 2026-05-22  
**Sprint:** npm publish `0.1.0`  
**Master plan:** [milestones/2026-05-master-plan.md](milestones/2026-05-master-plan.md)

## In progress

| ID  | Task        | Issue                                                       |
| --- | ----------- | ----------------------------------------------------------- |
| —   | npm publish | [#21](https://github.com/hideyukiMORI/nene2-node/issues/21) |

## Maintainer commands

```bash
npm login
npm publish --access public
gh release create v0.1.0 --title "v0.1.0" --notes "See CHANGELOG.md"
```

## Up next (ordered)

| ID  | Task                        |
| --- | --------------------------- |
| —   | Framework FT#1 (middleware) |
| —   | Tag CRUD parity             |

## Completed (recent)

- [x] Phases 0–5 + publish prep ([#17](https://github.com/hideyukiMORI/nene2-node/issues/17))
- [x] Release branch: `private: false`, `prepack` / `prepublishOnly`

## Verification

```bash
npm run check   # 55 tests + build
npm pack --dry-run
```
