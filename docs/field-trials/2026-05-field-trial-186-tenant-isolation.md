# FT186 — Multi-tenant isolation (`assertTenantScope`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT318 / FT342 (`tenantlog`, `jwt-tenant-isolation`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔒 (covers both FT318 and FT342)
**Tier:** access-control guard — in-tree unit + Hono-integration tests

## Objective

node had `assertResourceOwner` (per-user BOLA → 403) but no tenant-isolation
guard. Cross-tenant access must return **404, not 403**, to avoid an existence
enumeration oracle.

## Deliverable (🔒 framework)

- `src/error/resource-not-found-error.ts` — generic `ResourceNotFoundError`
  (`DomainError`). The framework previously had only example-specific not-found
  errors.
- `src/error/resource-not-found-handler.ts` — `createResourceNotFoundHandler`
  → `404 not-found` Problem Details, **id omitted** from the body. Wired into
  `createDefaultDomainHandlers`, so `createApp()` maps it by default.
- `src/domain/tenant-scope.ts`:
  - `assertTenantScope(rowTenantId, callerTenantId, label, id)` — throws
    `ResourceNotFoundError` when the caller tenant is missing/empty or differs.
  - `tenantFromContext(authClaims, claim='tenant_id')` — sibling of
    `authSubFromContext`.
- All exported from `src/index.ts`.

## Executable proof (in-tree)

10 tests (`tests/domain/tenant-scope.test.ts`): guard pass/cross-tenant/missing;
`tenantFromContext` default + custom + missing claim; and a Hono app wired with
the not-found handler proving same-tenant → 200, **cross-tenant → 404**,
no-tenant → 404, and that the 404 body leaks neither the resource id nor the
other tenant's data.

## Design notes

- **404 over 403** — `403` confirms a row exists; `404` makes "exists but not
  yours" identical to "absent". The body omits the id for the same reason.
- **Defence in depth** — the guard complements (does not replace) tenant-scoped
  queries (`WHERE tenant_id = ?`); it backstops read-by-id / nested routes.
- **Generic `ResourceNotFoundError` is a broader win** — any handler can now
  raise a framework-level 404 instead of reaching for an example-specific error.
- **Covers two PHP FTs** (318 IDOR + 342 JWT tenant claim) in one node guard.

## Friction

None. New `ResourceNotFoundError` slotted into the existing domain-handler
pipeline and default registration cleanly.

## How-to

[docs/how-to/tenant-isolation.md](../how-to/tenant-isolation.md)
