import type { Note } from './note.js';

export interface NoteRepository {
  findAll(limit: number, offset: number): Note[];
  findById(noteId: number): Note | undefined;
  save(title: string, body: string): Note;
  update(noteId: number, title: string, body: string): Note | undefined;
  delete(noteId: number): boolean;
  count(): number;
}
