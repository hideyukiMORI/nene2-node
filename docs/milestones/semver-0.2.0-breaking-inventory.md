# Semver 0.2.0 — Breaking-change inventory

**Status:** ✅ Shipped in **v0.2.0** (batch decided in [ADR 0005](../adr/0005-0.2.0-breaking-batch.md))  
**Created:** 2026-05-27  
**Current release:** v0.3.0  
**Next breaking release target:** — (0.2.0 done; remaining candidate → a future minor)

> **Status (ADR 0005):** items 1, 3, 4, 5 **shipped in 0.2.0** (export removal,
> `executor`→`queryExecutor`, Node 24 LTS minimum, `TokenVerifier.verify`→Promise).
> Item 2 (`createApp()` sync) is **deferred** to its own design ADR (not yet
> scheduled). 0.2.0 was 1.0 gate 1 ([ADR 0004](../adr/0004-path-to-1.0.md)).

This document catalogued breaking-change candidates for `0.2.0`. The batch
shipped in v0.2.0; the per-item sections below are kept as the migration record.
Future breaking candidates move to "decided" only via ADR + GitHub Issue + PR.

Shipping 0.2.0 is the first gate on the road to 1.0 — see
[ADR 0004](../adr/0004-path-to-1.0.md). Policy reference:
`docs/field-trials/2026-05-field-trial-123-semver-breaking-policy.md`.

---

## What counts as breaking (SemVer 0.x)

Under `0.x.y`, any change that requires downstream code edits is **breaking**.
Practically: removing or renaming an export, changing a function signature
incompatibly, or altering a mandatory environment variable name.

---

## Candidate items

### 1. Remove `openApiFileExists` / `DEFAULT_OPENAPI_RELATIVE` from public exports

**Why:** These are internal path-resolution helpers. Exposing them invites misuse
and complicates future changes to the OpenAPI loading strategy.  
**Migration:** Consumers should use `resolveOpenApiPath` or provide an absolute path.  
**Effort:** Low (remove two exports from `src/index.ts`).

---

### 2. Make `createApp()` return `Nene2App` (not `Promise<Nene2App>`)

**Why:** The async path exists only to support `createDatabaseRuntime`, which is
itself async. Separating DB bootstrap from app construction would simplify typing
and testing for apps that don't need a database.  
**Proposed shape:**

```ts
// 0.2.0 candidate
const app = createApp({ settings }); // sync
await app.database.connect(); // explicit async step
```

**Effort:** Medium — all call sites and tests change.  
**Blockers:** Requires design agreement (ADR) before implementation.

---

### 3. Rename `Nene2AppDatabase.executor` to `Nene2AppDatabase.queryExecutor`

**Why:** Aligns with the internal type name `DatabaseQueryExecutor` and reduces
ambiguity when `readExecutor` is also present.  
**Migration:** `nene2.database.executor` → `nene2.database.queryExecutor`.  
**Effort:** Low (rename + find-replace in consumers).

---

### 4. Drop Node 22 / npm 10 minimum in favour of Node 24 / npm 11

**Why:** Node 22 LTS enters maintenance mode in 2026-10. Node 24 will be
the active LTS by then. SQLite is stable (no longer `--experimental-sqlite`)
from Node 24.  
**Migration:** Consumers on Node 22 must upgrade.  
**Timing:** Suitable for 0.2.0 only after Node 24 reaches LTS (expected 2025-10).

---

### 5. `TokenVerifier.verify` must return `Promise<Record<string, unknown>>`

**Why:** Currently the interface allows sync return (`Record<string, unknown> | Promise<...>`).
Standardising on `Promise` simplifies implementors and eliminates the union type.  
**Migration:** `LocalBearerTokenVerifier` already returns sync; wrap in `Promise.resolve`.  
**Effort:** Low per consumer, but a breaking interface change.

---

## Non-candidates (ruled out for 0.2.0)

| Item                                     | Reason                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| Remove example Note/Tag routes           | High disruption to integration tests; defer to 1.0             |
| Change Problem Details `type` URI scheme | Requires NENE2 contract change first                           |
| Switch from `hono` to another router     | ADR-0002 decision stands; revisit only if Hono causes friction |

---

## Process to ship 0.2.0

1. Open a **0.2.0 milestone** GitHub Issue for each decided breaking item.
2. Each item gets its own ADR (`docs/adr/NNNN-*.md`).
3. Batch into a single `feat!` PR with updated CHANGELOG `[0.2.0]` section.
4. Publish with `npm version minor` and create a GitHub Release.

---

_Last reviewed: 2026-05-27. Update when an item is decided or ruled out._
