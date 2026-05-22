import { DomainError } from '../../error/domain-error.js';

export class NoteNotFoundError extends DomainError {
  constructor(readonly noteId: number) {
    super(`Note with id ${String(noteId)} was not found.`);
    this.name = 'NoteNotFoundError';
  }
}
