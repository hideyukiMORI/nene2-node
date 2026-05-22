import { DomainError } from './domain-error.js';

/**
 * Thrown when the authenticated subject may not access a row (BOLA / ownership).
 */
export class ResourceAccessDeniedError extends DomainError {
  constructor(
    readonly resourceLabel: string,
    readonly resourceId: string | number,
  ) {
    super(`Access denied for ${resourceLabel} ${String(resourceId)}`);
    this.name = 'ResourceAccessDeniedError';
  }
}
