# FT181 — Distributed Lock

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT288 (`distlocklog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔧new
**Tier:** framework primitive with owner-verification ATK matrix proven in-tree

## Objective

node had no lock primitive to serialise exclusive access to a named resource
(payment, file, job). Add a leased lock with owner verification and TTL expiry.

## Deliverable (🔧new framework)

`src/concurrency/distributed-lock.ts`, exported from `src/index.ts`:

- `createLockManager({ storage?, defaultTtlMs=30000, now=Date.now })`:
  - `acquire(resource, owner, ttlMs?)` → `LockRecord | null` (null = held by
    another & not expired; retry — not an error).
  - `release(resource, owner)` → `'released' | 'not-found' | 'forbidden'`.
  - `renew(resource, owner, ttlMs?)` → `{ ok, lock } | { ok:false, reason }`.
  - `status(resource)` → `LockRecord | null` (null if absent/expired).
- `LockStorage` interface + `InMemoryLockStorage` (house adapter style, Promise
  based — same shape as idempotency / rate-limit storage).

## ATK matrix (executable proof — in-tree)

| ATK    | Attack                               | Result                           |
| ------ | ------------------------------------ | -------------------------------- |
| ATK-01 | Acquire a lock held by another owner | `null` — **BLOCKED**             |
| ATK-02 | Release a lock owned by another      | `forbidden` (→403) — **BLOCKED** |
| ATK-03 | Acquire after TTL expiry (any owner) | granted — **by design**          |
| ATK-04 | Renew a lock owned by another        | `forbidden` (→403) — **BLOCKED** |

Plus: free-resource acquire, same-owner re-acquire/extend, expired
release/renew → not-found, per-call TTL override, status expiry. 13 in-tree
tests (`tests/concurrency/distributed-lock.test.ts`), deterministic via
injectable clock.

## Design notes

- **Pluggable storage.** Default `InMemoryLockStorage` is process-local —
  enough for single-node serialisation. Multi-instance needs a shared store with
  an **atomic** acquire (Redis `SET NX PX`); a plain get-then-set is not safe.
  Documented in the how-to.
- **Expired re-acquisition is intentional** (ATK-03) — the TTL is how a crashed
  holder's lock is reclaimed; tighten with shorter TTL + heartbeat `renew`.
- **`acquire → null` is not a 4xx** — it means "retry later" (mirrors PHP
  `{ acquired: false }`).
- **Owner verification on release/renew** is the security core; mismatch →
  `forbidden`, which handlers map to 403.

## Friction

None. New `src/concurrency/` module; no changes elsewhere.

## How-to

[docs/how-to/distributed-lock.md](../how-to/distributed-lock.md)
