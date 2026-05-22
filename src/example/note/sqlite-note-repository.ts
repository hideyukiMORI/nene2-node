import type { DatabaseQueryExecutor } from '../../database/database-query-executor.js';
import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

function rowToNote(row: SqlRowNote): Note {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
  };
}

interface SqlRowNote {
  readonly id: number | bigint;
  readonly title: string;
  readonly body: string;
}

export class SqliteNoteRepository implements NoteRepository {
  constructor(private readonly query: DatabaseQueryExecutor) {}

  findAll(limit: number, offset: number): Note[] {
    const rows = this.query.fetchAll(
      'SELECT id, title, body FROM notes ORDER BY id LIMIT ? OFFSET ?',
      [limit, offset],
    );
    return rows.map((row) => rowToNote(row as unknown as SqlRowNote));
  }

  findById(noteId: number): Note | undefined {
    const row = this.query.fetchOne('SELECT id, title, body FROM notes WHERE id = ?', [noteId]);
    return row === undefined ? undefined : rowToNote(row as unknown as SqlRowNote);
  }

  save(title: string, body: string): Note {
    const id = this.query.insert('INSERT INTO notes (title, body) VALUES (?, ?)', [title, body]);
    return { id, title, body };
  }

  update(noteId: number, title: string, body: string): Note | undefined {
    const changes = this.query.execute('UPDATE notes SET title = ?, body = ? WHERE id = ?', [
      title,
      body,
      noteId,
    ]);
    if (changes === 0) {
      return undefined;
    }
    return { id: noteId, title, body };
  }

  delete(noteId: number): boolean {
    return this.query.execute('DELETE FROM notes WHERE id = ?', [noteId]) > 0;
  }

  count(): number {
    const row = this.query.fetchOne('SELECT COUNT(*) AS cnt FROM notes');
    return row === undefined ? 0 : Number(row['cnt']);
  }
}
