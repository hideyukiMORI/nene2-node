import { DomainError } from './domain-error.js';

/**
 * Thrown when a resource is not found — including the **enumeration-safe** case
 * where it exists but is out of the caller's scope (e.g. another tenant). Maps
 * to `404` so cross-scope access is indistinguishable from a missing row.
 *
 * `resourceLabel` / `resourceId` are for logging; the 404 response body does not
 * echo them.
 */
export class ResourceNotFoundError extends DomainError {
  constructor(
    readonly resourceLabel: string,
    readonly resourceId: string | number,
  ) {
    super(`${resourceLabel} ${String(resourceId)} not found`);
    this.name = 'ResourceNotFoundError';
  }
}
