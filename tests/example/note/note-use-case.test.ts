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

  it('lists empty notes', async () => {
    const output = await listNotes.execute({ limit: 20, offset: 0 });
    expect(output.items).toEqual([]);
    expect(output.limit).toBe(20);
    expect(output.offset).toBe(0);
  });

  it('creates and retrieves a note', async () => {
    const created = await createNote.execute({ title: 'Hello', body: 'World' });
    const found = await getNote.execute({ noteId: created.id });
    expect(found.title).toBe('Hello');
  });

  it('throws NoteNotFoundError when missing', async () => {
    await expect(getNote.execute({ noteId: 9999 })).rejects.toThrow(NoteNotFoundError);
  });

  it('throws NoteNotFoundError on update when missing', async () => {
    await expect(updateNote.execute({ noteId: 9999, title: 'x', body: 'y' })).rejects.toThrow(
      NoteNotFoundError,
    );
  });

  it('throws NoteNotFoundError on delete when missing', async () => {
    await expect(deleteNote.execute({ noteId: 9999 })).rejects.toThrow(NoteNotFoundError);
  });

  it('updates and deletes a note', async () => {
    const created = await createNote.execute({ title: 'Old', body: 'Old body' });
    const updated = await updateNote.execute({
      noteId: created.id,
      title: 'New',
      body: 'New body',
    });
    expect(updated.title).toBe('New');

    await deleteNote.execute({ noteId: created.id });
    await expect(getNote.execute({ noteId: created.id })).rejects.toThrow(NoteNotFoundError);
  });
});
