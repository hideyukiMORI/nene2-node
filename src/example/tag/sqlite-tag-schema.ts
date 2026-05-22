import type { DatabaseSync } from 'node:sqlite';

export const TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

export function ensureTagsSchema(database: DatabaseSync): void {
  database.exec(TAGS_TABLE_SQL);
}
