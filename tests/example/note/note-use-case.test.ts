import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryNoteRepository } from '../../../src/example/note/in-memory-note-repository.js';
import { NoteNotFoundError } from '../../../src/example/note/note-not-found-error.js';
import {
  CreateNoteUseCase,
  DeleteNoteByIdUseCase,
  GetNoteByIdUseCase,
  ListNotesUseCase,
  UpdateNoteUseCase,
} from '../../../src/example/note/note-use-cases.js';

describe('Note use cases', () => {
  let repository: InMemoryNoteRepository;
  let listNotes: ListNotesUseCase;
  let createNote: CreateNoteUseCase;
  let getNote: GetNoteByIdUseCase;
  let updateNote: UpdateNoteUseCase;
  let deleteNote: DeleteNoteByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryNoteRepository();
    listNotes = new ListNotesUseCase(repository);
    createNote = new CreateNoteUseCase(repository);
    getNote = new GetNoteByIdUseCase(repository);
    updateNote = new UpdateNoteUseCase(repository);
    deleteNote = new DeleteNoteByIdUseCase(repository);
  });

  it('lists empty notes', () => {
    const output = listNotes.execute({ limit: 20, offset: 0 });
    expect(output.items).toEqual([]);
    expect(output.limit).toBe(20);
    expect(output.offset).toBe(0);
  });

  it('creates and retrieves a note', () => {
    const created = createNote.execute({ title: 'Hello', body: 'World' });
    const found = getNote.execute({ noteId: created.id });
    expect(found.title).toBe('Hello');
  });

  it('throws NoteNotFoundError when missing', () => {
    expect(() => getNote.execute({ noteId: 9999 })).toThrow(NoteNotFoundError);
  });

  it('updates and deletes a note', () => {
    const created = createNote.execute({ title: 'Old', body: 'Old body' });
    const updated = updateNote.execute({
      noteId: created.id,
      title: 'New',
      body: 'New body',
    });
    expect(updated.title).toBe('New');

    deleteNote.execute({ noteId: created.id });
    expect(() => getNote.execute({ noteId: created.id })).toThrow(NoteNotFoundError);
  });
});
