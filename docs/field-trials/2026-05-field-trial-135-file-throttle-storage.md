# Field trial report — FT135: File-backed throttle storage (D4)

**Date:** 2026-05-22 | **Issue:** [#77](https://github.com/hideyukiMORI/nene2-node/issues/77) | **Sandbox:** `../nene2-node-FT/ft135-file-throttle/`

## Validated

- `FileRateLimitStorage` — counts persist across process restarts on same host
- `RateLimitStorage.hit()` may return `Promise`

## Friction

### F-1: In-memory only (FT95) — **partially resolved**

File storage helps multi-process on one machine; **Redis still open** for multi-node.

### F-2: File lock races under extreme load (severity: low) — **open**

Atomic rename mitigates; not a distributed lock.

## Probes

| Probe                           | Result                    |
| ------------------------------- | ------------------------- |
| `ft135-file-throttle/probe.mjs` | two instances share count |
