# Field trial report — FT131: JWT `sub` throttle key (D3)

**Date:** 2026-05-22 | **Issue:** [#75](https://github.com/hideyukiMORI/nene2-node/issues/75) | **Sandbox:** `../nene2-node-FT/ft131-throttle-jwt-sub/`

## Validated

- `jwtSubThrottleKey` buckets by `authClaims.sub`, falls back to IP
- Doc: [throttle-storage-adapters.md](../development/throttle-storage-adapters.md)

## Friction

### F-1: IP-only default key (FT124) — **resolved**

**Resolution:** `jwtSubThrottleKey` export (**v0.1.10**).

### F-2: Redis storage still app-owned (FT95) — **open**

In-memory throttle remains single-instance; Redis adapter not bundled.

## Probes

| Probe                              | Result                 |
| ---------------------------------- | ---------------------- |
| `ft131-throttle-jwt-sub/probe.mjs` | `sub:user-a` vs `ip:…` |
