import type { DatabaseSync } from 'node:sqlite';

export const NOTES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

export function ensureNotesSchema(database: DatabaseSync): void {
  database.exec(NOTES_TABLE_SQL);
}
