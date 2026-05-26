# Claude Code — Project Rules

This file is read automatically at the start of every Claude Code session.

## Always: format before check

After creating or editing **any** file, run Prettier before `npm run check`:

```sh
npx prettier --write <files>
```

Never skip this step. `npm run check` runs `prettier --check` and will fail if formatting
is wrong — causing a wasted round-trip.

## FT campaigns: state snapshot every 3 FTs

When running a multi-FT campaign, after every 3 merged FTs write the current state to
the memory file:

```
/root/.claude/projects/-home-xi-docker-nene2-node/memory/ft-campaign-state.md
```

Record: last completed FT number, next FT to start, any open friction or blockers.  
This survives context compaction and allows the session to resume accurately.

## Check command

```sh
npm run check   # type-check → lint → format → test → build (must be green before PR)
```

## Branching

One branch per FT or logical group: `ft/NNN-theme`.  
Merge to `main` via PR. Tag version bumps: `git tag vX.Y.Z && git push origin vX.Y.Z`.

## FT backlog

Active campaign backlog: `docs/field-trials/ft149-177-backlog.md`
