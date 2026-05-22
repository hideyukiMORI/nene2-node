import type { DatabaseSync } from 'node:sqlite';

import { ensureNotesSchema } from './note/sqlite-note-schema.js';
import { ensureTagsSchema } from './tag/sqlite-tag-schema.js';

export function ensureExamplesSchema(database: DatabaseSync): void {
  ensureNotesSchema(database);
  ensureTagsSchema(database);
}
