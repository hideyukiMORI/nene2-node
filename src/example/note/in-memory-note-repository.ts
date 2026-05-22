import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

export class InMemoryNoteRepository implements NoteRepository {
  private readonly store = new Map<number, Note>();
  private nextId = 1;

  findAll(limit: number, offset: number): Note[] {
    const notes = [...this.store.values()].sort((a, b) => a.id - b.id);
    return notes.slice(offset, offset + limit);
  }

  findById(noteId: number): Note | undefined {
    return this.store.get(noteId);
  }

  save(title: string, body: string): Note {
    const note: Note = { id: this.nextId, title, body };
    this.store.set(this.nextId, note);
    this.nextId += 1;
    return note;
  }

  update(noteId: number, title: string, body: string): Note | undefined {
    if (!this.store.has(noteId)) {
      return undefined;
    }
    const updated: Note = { id: noteId, title, body };
    this.store.set(noteId, updated);
    return updated;
  }

  delete(noteId: number): boolean {
    return this.store.delete(noteId);
  }

  count(): number {
    return this.store.size;
  }
}
