import { DomainError } from '../../error/domain-error.js';

export class TagNotFoundError extends DomainError {
  constructor(readonly tagId: number) {
    super(`Tag with id ${String(tagId)} was not found.`);
    this.name = 'TagNotFoundError';
  }
}
