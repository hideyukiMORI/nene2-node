import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

export class InMemoryNoteRepository implements NoteRepository {
  private readonly store = new Map<number, Note>();
  private nextId = 1;

  findAll(limit: number, offset: number, ownerId: string): Promise<Note[]> {
    const notes = [...this.store.values()]
      .filter((note) => note.ownerId === ownerId)
      .sort((a, b) => a.id - b.id);
    return Promise.resolve(notes.slice(offset, offset + limit));
  }

  findById(noteId: number): Promise<Note | undefined> {
    return Promise.resolve(this.store.get(noteId));
  }

  save(title: string, body: string, ownerId: string): Promise<Note> {
    const note: Note = { id: this.nextId, title, body, ownerId };
    this.store.set(this.nextId, note);
    this.nextId += 1;
    return Promise.resolve(note);
  }

  update(noteId: number, title: string, body: string): Promise<Note | undefined> {
    const existing = this.store.get(noteId);
    if (existing === undefined) {
      return Promise.resolve(undefined);
    }
    const updated: Note = { id: noteId, title, body, ownerId: existing.ownerId };
    this.store.set(noteId, updated);
    return Promise.resolve(updated);
  }

  delete(noteId: number): Promise<boolean> {
    return Promise.resolve(this.store.delete(noteId));
  }

  count(): Promise<number> {
    return Promise.resolve(this.store.size);
  }
}
