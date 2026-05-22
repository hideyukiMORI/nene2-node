import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryNoteRepository } from '../../../src/example/note/in-memory-note-repository.js';
import { NoteNotFoundError } from '../../../src/example/note/note-not-found-error.js';
import {
  CreateNoteUseCase,
  DeleteNoteByIdUseCase,
  GetNoteByIdUseCase,
  ListNotesUseCase,
  UpdateNoteUseCase,
} from '../../../src/example/note/note-use-cases.js';
import { ResourceAccessDeniedError } from '../../../src/error/resource-access-denied-error.js';

const USER_A = 'user-a';
const USER_B = 'user-b';

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
    const output = await listNotes.execute({ limit: 20, offset: 0, authSub: USER_A });
    expect(output.items).toEqual([]);
    expect(output.limit).toBe(20);
    expect(output.offset).toBe(0);
  });

  it('creates and retrieves a note', async () => {
    const created = await createNote.execute({ title: 'Hello', body: 'World', authSub: USER_A });
    const found = await getNote.execute({ noteId: created.id, authSub: USER_A });
    expect(found.title).toBe('Hello');
  });

  it('throws ResourceAccessDeniedError for cross-user update and delete', async () => {
    const created = await createNote.execute({ title: 'Private', body: 'Secret', authSub: USER_A });
    await expect(
      updateNote.execute({ noteId: created.id, title: 'x', body: 'y', authSub: USER_B }),
    ).rejects.toThrow(ResourceAccessDeniedError);
    await expect(deleteNote.execute({ noteId: created.id, authSub: USER_B })).rejects.toThrow(
      ResourceAccessDeniedError,
    );
  });

  it('lists only notes owned by the caller', async () => {
    await createNote.execute({ title: 'A', body: 'a', authSub: USER_A });
    await createNote.execute({ title: 'B', body: 'b', authSub: USER_B });
    const output = await listNotes.execute({ limit: 20, offset: 0, authSub: USER_A });
    expect(output.items).toHaveLength(1);
    expect(output.items[0]?.title).toBe('A');
  });

  it('throws NoteNotFoundError when missing', async () => {
    await expect(getNote.execute({ noteId: 9999, authSub: USER_A })).rejects.toThrow(
      NoteNotFoundError,
    );
  });

  it('throws NoteNotFoundError on update when missing', async () => {
    await expect(
      updateNote.execute({ noteId: 9999, title: 'x', body: 'y', authSub: USER_A }),
    ).rejects.toThrow(NoteNotFoundError);
  });

  it('throws NoteNotFoundError on delete when missing', async () => {
    await expect(deleteNote.execute({ noteId: 9999, authSub: USER_A })).rejects.toThrow(
      NoteNotFoundError,
    );
  });

  it('throws NoteNotFoundError when update returns undefined after ownership check', async () => {
    const owned = {
      id: 1,
      title: 't',
      body: 'b',
      ownerId: USER_A,
      createdAt: '2026-05-22T12:00:00.000Z',
    };
    const repository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(owned),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      count: vi.fn(),
    };
    const updateNoteUseCase = new UpdateNoteUseCase(repository);
    await expect(
      updateNoteUseCase.execute({ noteId: 1, title: 'n', body: 'n', authSub: USER_A }),
    ).rejects.toThrow(NoteNotFoundError);
  });

  it('throws NoteNotFoundError when delete returns false after ownership check', async () => {
    const owned = {
      id: 1,
      title: 't',
      body: 'b',
      ownerId: USER_A,
      createdAt: '2026-05-22T12:00:00.000Z',
    };
    const repository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(owned),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(false),
      count: vi.fn(),
    };
    const deleteNoteUseCase = new DeleteNoteByIdUseCase(repository);
    await expect(deleteNoteUseCase.execute({ noteId: 1, authSub: USER_A })).rejects.toThrow(
      NoteNotFoundError,
    );
  });

  it('updates and deletes a note', async () => {
    const created = await createNote.execute({ title: 'Old', body: 'Old body', authSub: USER_A });
    const updated = await updateNote.execute({
      noteId: created.id,
      title: 'New',
      body: 'New body',
      authSub: USER_A,
    });
    expect(updated.title).toBe('New');

    await deleteNote.execute({ noteId: created.id, authSub: USER_A });
    await expect(getNote.execute({ noteId: created.id, authSub: USER_A })).rejects.toThrow(
      NoteNotFoundError,
    );
  });
});
