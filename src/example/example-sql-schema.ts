import type { DatabaseSync } from 'node:sqlite';

import type { DatabaseBackend } from '../database/parse-database-url.js';
import type { DatabaseQueryExecutor } from '../database/database-query-executor.js';
import { ensureNotesSchema } from './note/sqlite-note-schema.js';
import { ensureTagsSchema } from './tag/sqlite-tag-schema.js';

const NOTES_TABLE_MYSQL = `
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  owner_id VARCHAR(255) NOT NULL
);
`;

const TAGS_TABLE_MYSQL = `
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id VARCHAR(255) NOT NULL
);
`;

const NOTES_TABLE_POSTGRES = `
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  owner_id VARCHAR(255) NOT NULL
);
`;

const TAGS_TABLE_POSTGRES = `
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id VARCHAR(255) NOT NULL
);
`;

export function ensureExamplesSchema(database: DatabaseSync): void {
  ensureNotesSchema(database);
  ensureTagsSchema(database);
}

export async function ensureExamplesSchemaAsync(
  executor: DatabaseQueryExecutor,
  backend: DatabaseBackend,
): Promise<void> {
  if (backend === 'sqlite') {
    throw new Error('Use ensureExamplesSchema() for SQLite DatabaseSync.');
  }
  const notesSql = backend === 'mysql' ? NOTES_TABLE_MYSQL : NOTES_TABLE_POSTGRES;
  const tagsSql = backend === 'mysql' ? TAGS_TABLE_MYSQL : TAGS_TABLE_POSTGRES;
  await executor.execute(notesSql);
  await executor.execute(tagsSql);
}
