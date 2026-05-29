# API stability

Stability tiers for the public exports of `@hideyukimori/nene2-framework`
(everything re-exported from `src/index.ts`). This is the single source of truth
that tells contributors — human or AI — what may be changed freely versus what is
frozen. Part of [ADR 0003](adr/0003-ai-velocity-hardening.md) (Phase 9 B4).

`tests/api/stability.test.ts` enforces that every name listed under
**Experimental** below is a real export; combined with the API-surface snapshot
(`tests/api/public-surface.test.ts`), a new export cannot land unnoticed — the
snapshot diff forces a reviewer to assign its tier here.

## Tiers

| Tier             | Meaning                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **Stable**       | Long-standing core. Changing the signature/behaviour is **breaking** — needs `0.2.0` + an ADR. |
| **Experimental** | Added recently (v0.1.26 deep-FT phase). May change in a patch release while the shape settles. |

> **0.x caveat:** under `0.x`, _any_ change requiring downstream edits is breaking
> (SemVer 0.x). "Stable" here means "treated as frozen; don't churn it"; planned
> breaking changes are tracked in
> [`milestones/semver-0.2.0-breaking-inventory.md`](milestones/semver-0.2.0-breaking-inventory.md).

## Stable

Everything exported from `src/index.ts` **except** the Experimental list below.
The authoritative export inventory is the committed snapshot
`tests/api/__snapshots__/public-surface.test.ts.snap`. Treat these as frozen;
route intended breaking changes through the 0.2.0 inventory + an ADR.

## Experimental

Surface whose API shape may still adjust; iterate freely until promoted. Most of
the v0.1.26 deep-FT helpers (FT178–187) were **promoted to Stable in 0.2.0** —
they shipped unchanged across the 0.1.26 → 0.2.0 cycle and are fully tested. What
remains Experimental:

### Concurrency — Redis lock adapter

- `RedisLockStorage`

The distributed-lock **cluster** (`createLockManager`, `InMemoryLockStorage`,
`LockManager`/`LockManagerOptions`/`LockStorage`/`LockRecord`/`ReleaseResult`/`RenewResult`)
was promoted to **Stable**: implementing `RedisLockStorage` validated the
`LockStorage` contract on a second backend and drove it to an **atomic
`putIfAbsent`** acquire (safe cross-instance mutual exclusion). `RedisLockStorage`
itself is the newly-added adapter and stays Experimental for one release cycle.

### Promoted to Stable

- **0.2.0:** ETag/conditional-request helpers, `parseSortQuery`, `applyMergePatch`,
  the circuit breaker, `createValidationCollector`, the Unicode text validators,
  the SSRF guard, tenant-isolation (`assertTenantScope` + `ResourceNotFoundError`),
  `escapeLikePattern`.
- **post-0.2.0:** the distributed-lock cluster (interface hardened to atomic
  acquire; validated by `RedisLockStorage`).

See the surface snapshot for the full Stable list.

## Promotion

At each minor release, review Experimental entries that have proven stable (no
API changes across a release cycle, covered by tests) and move them to Stable in
the same PR that bumps the version.
