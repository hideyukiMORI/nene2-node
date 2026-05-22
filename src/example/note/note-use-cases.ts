import { NoteNotFoundError } from './note-not-found-error.js';
import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

export interface ListNotesInput {
  readonly limit: number;
  readonly offset: number;
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
      items: await this.repository.findAll(input.limit, input.offset),
      limit: input.limit,
      offset: input.offset,
    };
  }
}

export interface CreateNoteInput {
  readonly title: string;
  readonly body: string;
}

export class CreateNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: CreateNoteInput): Promise<Note> {
    return this.repository.save(input.title, input.body);
  }
}

export interface GetNoteByIdInput {
  readonly noteId: number;
}

export class GetNoteByIdUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: GetNoteByIdInput): Promise<Note> {
    const note = await this.repository.findById(input.noteId);
    if (note === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    return note;
  }
}

export interface UpdateNoteInput {
  readonly noteId: number;
  readonly title: string;
  readonly body: string;
}

export class UpdateNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<Note> {
    const note = await this.repository.update(input.noteId, input.title, input.body);
    if (note === undefined) {
      throw new NoteNotFoundError(input.noteId);
    }
    return note;
  }
}

export interface DeleteNoteByIdInput {
  readonly noteId: number;
}

export class DeleteNoteByIdUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: DeleteNoteByIdInput): Promise<void> {
    const deleted = await this.repository.delete(input.noteId);
    if (!deleted) {
      throw new NoteNotFoundError(input.noteId);
    }
  }
}
