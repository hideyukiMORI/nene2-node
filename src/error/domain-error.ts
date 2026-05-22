/**
 * Base class for domain-layer failures mapped to Problem Details by the HTTP pipeline.
 */
export class DomainError extends Error {
  constructor(message = 'Domain error') {
    super(message);
    this.name = 'DomainError';
  }
}
