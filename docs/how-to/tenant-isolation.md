# How-to: multi-tenant isolation

In a multi-tenant API, one tenant must never read or mutate another tenant's
rows — and a cross-tenant attempt should return **404, not 403**, so an attacker
cannot tell whether a resource exists. `assertTenantScope` is the tenant sibling
of `assertResourceOwner` (BOLA), but throws `ResourceNotFoundError` (→ 404).

> Parity: PHP NENE2 FT318 / FT342. node FT186.

## Defence in depth

1. **Scope every query** by tenant: `... WHERE tenant_id = ?`. This is the
   primary control.
2. **Guard read-by-id / nested routes** with `assertTenantScope` after loading a
   row, in case a query was not (or could not be) tenant-scoped.

## Usage

```ts
import {
  assertTenantScope,
  tenantFromContext,
  ResourceNotFoundError,
} from '@hideyukimori/nene2-framework';

app.get('/documents/:id', (c) => {
  const tenant = tenantFromContext(c.get('authClaims')); // reads `tenant_id` claim
  const row = repo.findById(c.req.param('id'));
  if (row === undefined) throw new ResourceNotFoundError('document', c.req.param('id'));

  // Cross-tenant or missing tenant → 404 (indistinguishable from "not found").
  assertTenantScope(row.tenant_id, tenant, 'document', row.id);

  return c.json(serialize(row));
});
```

`createApp()` registers `createResourceNotFoundHandler` by default, so a thrown
`ResourceNotFoundError` becomes a `404` Problem Details automatically.

## Why 404, not 403

A `403 Forbidden` on another tenant's row confirms the row **exists** — an
enumeration oracle. Returning `404` makes "exists but not yours" identical to
"does not exist". The 404 body omits the resource id for the same reason.

| Caller tenant     | Row tenant | Result |
| ----------------- | ---------- | ------ |
| `t1`              | `t1`       | 200    |
| `t2`              | `t1`       | 404    |
| (no tenant claim) | `t1`       | 404    |

## Reading the tenant claim

```ts
tenantFromContext(c.get('authClaims')); // 'tenant_id' claim
tenantFromContext(c.get('authClaims'), 'org'); // custom claim
```

Returns `undefined` for missing/non-string claims — which `assertTenantScope`
treats as a 404 (no tenant ⇒ no access).

## Relationship to `assertResourceOwner`

| Guard                 | Keyed on         | On mismatch | Use for                             |
| --------------------- | ---------------- | ----------- | ----------------------------------- |
| `assertResourceOwner` | JWT `sub` (user) | 403         | per-user ownership (BOLA)           |
| `assertTenantScope`   | tenant claim     | 404         | tenant isolation (enumeration-safe) |

## What NOT to do

| Anti-pattern                                   | Risk                                     |
| ---------------------------------------------- | ---------------------------------------- |
| Only filter in the UI / trust client tenant id | Trivial cross-tenant access              |
| Return 403 for another tenant's row            | Existence enumeration oracle             |
| Echo the resource id in the 404                | Leaks existence                          |
| Rely solely on the guard, skip query scoping   | One missed guard exposes the whole table |
