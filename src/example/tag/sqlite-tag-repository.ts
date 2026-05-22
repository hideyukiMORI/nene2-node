import type { DatabaseQueryExecutor } from '../../database/database-query-executor.js';
import type { Tag } from './tag.js';
import type { TagRepository } from './tag-repository.js';

interface SqlRowTag {
  readonly id: number | bigint;
  readonly name: string;
}

function rowToTag(row: SqlRowTag): Tag {
  return { id: Number(row.id), name: row.name };
}

export class SqliteTagRepository implements TagRepository {
  constructor(private readonly query: DatabaseQueryExecutor) {}

  findAll(limit: number, offset: number): Tag[] {
    const rows = this.query.fetchAll('SELECT id, name FROM tags ORDER BY id LIMIT ? OFFSET ?', [
      limit,
      offset,
    ]);
    return rows.map((row) => rowToTag(row as unknown as SqlRowTag));
  }

  findById(tagId: number): Tag | undefined {
    const row = this.query.fetchOne('SELECT id, name FROM tags WHERE id = ?', [tagId]);
    return row === undefined ? undefined : rowToTag(row as unknown as SqlRowTag);
  }

  save(name: string): Tag {
    const id = this.query.insert('INSERT INTO tags (name) VALUES (?)', [name]);
    return { id, name };
  }

  update(tagId: number, name: string): Tag | undefined {
    const changes = this.query.execute('UPDATE tags SET name = ? WHERE id = ?', [name, tagId]);
    if (changes === 0) {
      return undefined;
    }
    return { id: tagId, name };
  }

  delete(tagId: number): boolean {
    return this.query.execute('DELETE FROM tags WHERE id = ?', [tagId]) > 0;
  }

  count(): number {
    const row = this.query.fetchOne('SELECT COUNT(*) AS cnt FROM tags');
    return row === undefined ? 0 : Number(row['cnt']);
  }
}
