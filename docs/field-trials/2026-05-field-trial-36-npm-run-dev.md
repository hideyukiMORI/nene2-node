# Field trial report — FT36: npm run dev DX

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** required

## Validated

- `npm run dev` → `tsx src/server/dev-server.ts`; port from `NENE2_NODE_PORT`.
- Uses `createApp({ settings: loadAppSettings() })` — same stack as production wiring.

## Doc updates (docs-first)

- **New:** `docs/development/local-development.md`

## Friction

- F-1 (low): Dev server logs example paths only — extended list now in local-development.md.

## Security diagnosis (FT36 % 3 = 0)

| Area         | Result                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| Dev defaults | pass with notes — debug may be on in `local` env; document production contrast |
| Binding      | pass — localhost-oriented dev usage                                            |

**Overall:** pass with notes.

## Adversarial review (FT36 % 4 = 0)

| Probe                                      | Outcome                                |
| ------------------------------------------ | -------------------------------------- |
| Dev server exposed to LAN without firewall | out of scope — operator responsibility |
| Missing secrets for protected routes       | pass — 401 when Bearer required        |

**Resilience:** acceptable for local DX.

## Follow-up

- None.
