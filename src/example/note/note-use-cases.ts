import { assertResourceOwner } from '../../domain/resource-ownership.js';
import { NoteNotFoundError } from './note-not-found-error.js';
import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

export interface ListNotesInput {
  readonly limit: number;
  readonly offset: number;
  readonly authSub: string;
}

export interface ListNotesOutput {
  readonly items: readonly Note[];
  readonly limit: number;
  readonly offset: number;
}

export class ListNotesUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: ListNotesInput): Promise<ListNotesOutput> {
    return {
      items: await this.repository.findAll(input.limit, input.offset, input.authSub),
      limit: input.limit,
      offset: input.offset,
    };
  }
}

export interface CreateNoteInput {
  readonly title: string;
  readonly body: string;
  readonly authSub: string;
}

export class CreateNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: CreateNoteInput): Promise<Note> {
    return this.repository.save(input.title, input.body, input.authSub);
  }
}

export interface GetNoteByIdInput {
  readonly noteId: number;
  readonly authSub: string;
}

export class GetNoteByIdUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: GetNoteByIdInput): Promise<Note> {
    const note = await this.repository.findById(input.noteId);
    if (note === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    assertResourceOwner(note.ownerId, input.authSub, 'note', note.id);
    return note;
  }
}

export interface UpdateNoteInput {
  readonly noteId: number;
  readonly title: string;
  readonly body: string;
  readonly authSub: string;
}

export class UpdateNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<Note> {
    const existing = await this.repository.findById(input.noteId);
    if (existing === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    assertResourceOwner(existing.ownerId, input.authSub, 'note', existing.id);
    const note = await this.repository.update(input.noteId, input.title, input.body);
    if (note === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    return note;
  }
}

export interface DeleteNoteByIdInput {
  readonly noteId: number;
  readonly authSub: string;
}

export class DeleteNoteByIdUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: DeleteNoteByIdInput): Promise<void> {
    const existing = await this.repository.findById(input.noteId);
    if (existing === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    assertResourceOwner(existing.ownerId, input.authSub, 'note', existing.id);
    const deleted = await this.repository.delete(input.noteId);
    if (!deleted) {
      throw new NoteNotFoundError(input.noteId);
    }
  }
}
