import { ResourceNotFoundError } from '../error/resource-not-found-error.js';

/**
 * Enforce multi-tenant isolation. Sibling of `assertResourceOwner`, but throws
 * {@link ResourceNotFoundError} (→ **404**, not 403) when the caller's tenant is
 * missing or differs — so a cross-tenant resource is indistinguishable from a
 * non-existent one (prevents existence enumeration).
 *
 * Call after loading a row whose `tenant_id` you trust from storage. Queries
 * should still be tenant-scoped (`WHERE tenant_id = ?`); this guards the
 * remaining read-by-id / nested-route paths.
 *
 * @example
 *   const row = await repo.findById(id); // tenant-scoped query preferred
 *   if (row === undefined) throw new ResourceNotFoundError('document', id);
 *   assertTenantScope(row.tenant_id, tenantFromContext(c.get('authClaims')), 'document', id);
 */
export function assertTenantScope(
  recordTenantId: string,
  callerTenantId: string | undefined,
  resourceLabel: string,
  resourceId: string | number,
): void {
  if (callerTenantId === undefined || callerTenantId === '' || recordTenantId !== callerTenantId) {
    throw new ResourceNotFoundError(resourceLabel, resourceId);
  }
}

/**
 * Read a tenant identifier from Hono context `authClaims` (set by the bearer
 * middleware). Sibling of `authSubFromContext`. Defaults to the `tenant_id`
 * claim.
 */
export function tenantFromContext(
  authClaims: Readonly<Record<string, unknown>> | undefined,
  claim = 'tenant_id',
): string | undefined {
  if (authClaims === undefined) {
    return undefined;
  }
  const value = authClaims[claim];
  return typeof value === 'string' ? value : undefined;
}
