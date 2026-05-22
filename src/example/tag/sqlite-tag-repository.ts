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

  async findAll(limit: number, offset: number): Promise<Tag[]> {
    const rows = await this.query.fetchAll(
      'SELECT id, name FROM tags ORDER BY id LIMIT ? OFFSET ?',
      [limit, offset],
    );
    return rows.map((row) => rowToTag(row as unknown as SqlRowTag));
  }

  async findById(tagId: number): Promise<Tag | undefined> {
    const row = await this.query.fetchOne('SELECT id, name FROM tags WHERE id = ?', [tagId]);
    return row === undefined ? undefined : rowToTag(row as unknown as SqlRowTag);
  }

  async save(name: string): Promise<Tag> {
    const id = await this.query.insert('INSERT INTO tags (name) VALUES (?)', [name]);
    return { id, name };
  }

  async update(tagId: number, name: string): Promise<Tag | undefined> {
    const changes = await this.query.execute('UPDATE tags SET name = ? WHERE id = ?', [
      name,
      tagId,
    ]);
    if (changes === 0) {
      return undefined;
    }
    return { id: tagId, name };
  }

  async delete(tagId: number): Promise<boolean> {
    return (await this.query.execute('DELETE FROM tags WHERE id = ?', [tagId])) > 0;
  }

  async count(): Promise<number> {
    const row = await this.query.fetchOne('SELECT COUNT(*) AS cnt FROM tags');
    return row === undefined ? 0 : Number(row['cnt']);
  }
}
