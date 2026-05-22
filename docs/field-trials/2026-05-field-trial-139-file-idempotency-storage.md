# Field trial report — FT139: File idempotency storage (D4)

**Date:** 2026-05-22 | **Issue:** [#79](https://github.com/hideyukiMORI/nene2-node/issues/79) | **Sandbox:** `../nene2-node-FT/ft139-file-idempotency/`

## Validated

- `FileIdempotencyStorage` shares keys across processes on one host

## Friction

### F-1: In-memory idempotency not multi-process (FT136 F-2) — **partially resolved**

Redis / multi-region still **open** (FT95 pattern).

## Probes

| Probe                              | Result               |
| ---------------------------------- | -------------------- |
| `ft139-file-idempotency/probe.mjs` | cross-process replay |
