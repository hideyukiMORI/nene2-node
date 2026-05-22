import { ResourceAccessDeniedError } from '../error/resource-access-denied-error.js';

/**
 * Enforce row-level ownership (BOLA mitigation). Compares record owner to JWT `sub` claim.
 */
export function assertResourceOwner(
  recordOwnerId: string,
  authSub: string | undefined,
  resourceLabel: string,
  resourceId: string | number,
): void {
  if (authSub === undefined || authSub === '' || recordOwnerId !== authSub) {
    throw new ResourceAccessDeniedError(resourceLabel, resourceId);
  }
}

/**
 * Read `sub` from Hono context `authClaims` (set by bearer middleware).
 */
export function authSubFromContext(
  authClaims: Readonly<Record<string, unknown>> | undefined,
): string | undefined {
  if (authClaims === undefined) {
    return undefined;
  }
  const sub = authClaims['sub'];
  return typeof sub === 'string' ? sub : undefined;
}
