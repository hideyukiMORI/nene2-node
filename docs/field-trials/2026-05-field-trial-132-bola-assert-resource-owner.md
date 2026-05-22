# Field trial report — FT132: BOLA `assertResourceOwner` (D4)

**Date:** 2026-05-22 | **Issue:** [#75](https://github.com/hideyukiMORI/nene2-node/issues/75) | **Sandbox:** `../nene2-node-FT/ft132-bola-guard/`

## Validated

- `assertResourceOwner` + `ResourceAccessDeniedError` → **403** (not 200 leak)
- Complements FT78 documented gap

## Friction

### F-1: No framework guard (FT78) — **partially resolved**

**Observed:** FT78 probe still returns **200** without calling `assertResourceOwner`.  
**Resolution:** Opt-in helper + handler; enforcement remains UseCase responsibility.

### F-2: 403 vs 404 policy (severity: low) — **documented**

See [resource-ownership.md](../development/resource-ownership.md).

## Probes

| Probe                        | Result          |
| ---------------------------- | --------------- |
| `ft132-bola-guard/probe.mjs` | wrong sub → 403 |
