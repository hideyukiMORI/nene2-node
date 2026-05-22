import { DomainError } from './domain-error.js';

/**
 * Thrown when an optimistic concurrency check fails (stale If-Match / version column).
 */
export class VersionConflictError extends DomainError {
  constructor(
    readonly resourceLabel: string,
    readonly resourceId: string | number,
    readonly expectedVersion?: number,
  ) {
    super(
      expectedVersion === undefined
        ? `Version conflict for ${resourceLabel} ${String(resourceId)}`
        : `Version conflict for ${resourceLabel} ${String(resourceId)} (expected version ${String(expectedVersion)})`,
    );
    this.name = 'VersionConflictError';
  }
}
