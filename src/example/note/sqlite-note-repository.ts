import { utcNowIso } from '../../domain/timestamps.js';
import type { DatabaseQueryExecutor } from '../../database/database-query-executor.js';
import type { Note } from './note.js';
import type { NoteRepository } from './note-repository.js';

function rowToNote(row: SqlRowNote): Note {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

interface SqlRowNote {
  readonly id: number | bigint;
  readonly title: string;
  readonly body: string;
  readonly owner_id: string;
  readonly created_at: string;
}

export class SqliteNoteRepository implements NoteRepository {
  constructor(private readonly query: DatabaseQueryExecutor) {}

  async findAll(limit: number, offset: number, ownerId: string): Promise<Note[]> {
    const rows = await this.query.fetchAll(
      'SELECT id, title, body, owner_id, created_at FROM notes WHERE owner_id = ? ORDER BY id LIMIT ? OFFSET ?',
      [ownerId, limit, offset],
    );
    return rows.map((row) => rowToNote(row as unknown as SqlRowNote));
  }

  async findById(noteId: number): Promise<Note | undefined> {
    const row = await this.query.fetchOne(
      'SELECT id, title, body, owner_id, created_at FROM notes WHERE id = ?',
      [noteId],
    );
    return row === undefined ? undefined : rowToNote(row as unknown as SqlRowNote);
  }

  async save(title: string, body: string, ownerId: string): Promise<Note> {
    const createdAt = utcNowIso();
    const id = await this.query.insert(
      'INSERT INTO notes (title, body, owner_id, created_at) VALUES (?, ?, ?, ?)',
      [title, body, ownerId, createdAt],
    );
    return { id, title, body, ownerId, createdAt };
  }

  async update(noteId: number, title: string, body: string): Promise<Note | undefined> {
    const existing = await this.findById(noteId);
    if (existing === undefined) {
      return undefined;
    }
    const changes = await this.query.execute('UPDATE notes SET title = ?, body = ? WHERE id = ?', [
      title,
      body,
      noteId,
    ]);
    if (changes === 0) {
      return undefined;
    }
    return { id: noteId, title, body, ownerId: existing.ownerId, createdAt: existing.createdAt };
  }

  async delete(noteId: number): Promise<boolean> {
    return (await this.query.execute('DELETE FROM notes WHERE id = ?', [noteId])) > 0;
  }

  async count(): Promise<number> {
    const row = await this.query.fetchOne('SELECT COUNT(*) AS cnt FROM notes');
    return row === undefined ? 0 : Number(row['cnt']);
  }
}
