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

The deep-FT helpers introduced in **v0.1.26** (FT178–187). Iterate freely (API
shape may still adjust) until promoted to Stable at the next minor.

### HTTP

- `computeETag`
- `checkNotModified`
- `checkPreconditions`
- `type PreconditionOptions`
- `parseSortQuery`
- `type SortQuery`
- `type SortQueryOptions`
- `type SortOrder`
- `applyMergePatch`
- `type MergePatchOptions`

### Resilience & concurrency

- `createCircuitBreaker`
- `CircuitOpenError`
- `type CircuitBreaker`
- `type CircuitBreakerOptions`
- `type CircuitState`
- `createLockManager`
- `InMemoryLockStorage`
- `type LockManager`
- `type LockManagerOptions`
- `type LockStorage`
- `type LockRecord`
- `type ReleaseResult`
- `type RenewResult`

### Validation

- `createValidationCollector`
- `type ValidationCollector`
- `countCodePoints`
- `hasNullByte`
- `validateTextField`
- `type TextFieldRule`

### Security

- `checkUrlSafety`
- `checkUrlSafetyAsync`
- `assertSafeUrl`
- `isPrivateIp`
- `normaliseIpv4`
- `type UrlSafetyResult`
- `type UrlSafetyReason`
- `type SafeUrlOptions`
- `type SafeUrlAsyncOptions`
- `assertTenantScope`
- `tenantFromContext`
- `ResourceNotFoundError`
- `createResourceNotFoundHandler`
- `escapeLikePattern`

## Promotion

At each minor release, review Experimental entries that have proven stable (no
API changes across a release cycle, covered by tests) and move them to Stable in
the same PR that bumps the version.
