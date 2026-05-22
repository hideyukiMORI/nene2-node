import type { Note } from './note.js';

export interface NoteRepository {
  findAll(limit: number, offset: number): Promise<Note[]>;
  findById(noteId: number): Promise<Note | undefined>;
  save(title: string, body: string): Promise<Note>;
  update(noteId: number, title: string, body: string): Promise<Note | undefined>;
  delete(noteId: number): Promise<boolean>;
  count(): Promise<number>;
}
