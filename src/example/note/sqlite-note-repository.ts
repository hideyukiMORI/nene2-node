import type { DatabaseSync } from 'node:sqlite';

import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';
import { ensureNotesSchema } from './sqlite-note-schema.js';

function rowToNote(row: { id: number | bigint; title: string; body: string }): Note {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
  };
}

export class SqliteNoteRepository implements NoteRepository {
  constructor(private readonly database: DatabaseSync) {
    ensureNotesSchema(database);
  }

  findAll(limit: number, offset: number): Note[] {
    const rows = this.database
      .prepare('SELECT id, title, body FROM notes ORDER BY id LIMIT ? OFFSET ?')
      .all(limit, offset) as { id: number | bigint; title: string; body: string }[];
    return rows.map(rowToNote);
  }

  findById(noteId: number): Note | undefined {
    const row = this.database
      .prepare('SELECT id, title, body FROM notes WHERE id = ?')
      .get(noteId) as { id: number | bigint; title: string; body: string } | undefined;
    return row === undefined ? undefined : rowToNote(row);
  }

  save(title: string, body: string): Note {
    const result = this.database
      .prepare('INSERT INTO notes (title, body) VALUES (?, ?)')
      .run(title, body);
    const id = Number(result.lastInsertRowid);
    return { id, title, body };
  }

  update(noteId: number, title: string, body: string): Note | undefined {
    const result = this.database
      .prepare('UPDATE notes SET title = ?, body = ? WHERE id = ?')
      .run(title, body, noteId);
    if (result.changes === 0) {
      return undefined;
    }
    return { id: noteId, title, body };
  }

  delete(noteId: number): boolean {
    const result = this.database.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
    return result.changes > 0;
  }

  count(): number {
    const row = this.database.prepare('SELECT COUNT(*) AS cnt FROM notes').get() as
      | { cnt: number | bigint }
      | undefined;
    return row === undefined ? 0 : Number(row.cnt);
  }
}
