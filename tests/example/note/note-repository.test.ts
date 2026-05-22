import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { SqliteQueryExecutor } from '../../../src/database/sqlite-query-executor.js';
import { InMemoryNoteRepository } from '../../../src/example/note/in-memory-note-repository.js';
import type { NoteRepository } from '../../../src/example/note/note-repository.js';
import { SqliteNoteRepository } from '../../../src/example/note/sqlite-note-repository.js';
import { ensureExamplesSchema } from '../../../src/example/example-sqlite-schema.js';

const OWNER = 'user-test';

function runRepositoryContract(name: string, createRepository: () => NoteRepository): void {
  describe(`NoteRepository (${name})`, () => {
    it('saves and finds by id', async () => {
      const repo = createRepository();
      const note = await repo.save('Hello', 'World', OWNER);
      expect(await repo.findById(note.id)).toEqual(note);
    });

    it('returns undefined for missing id', async () => {
      const repo = createRepository();
      expect(await repo.findById(9999)).toBeUndefined();
    });

    it('lists with limit and offset scoped to owner', async () => {
      const repo = createRepository();
      await repo.save('A', 'a', OWNER);
      await repo.save('B', 'b', OWNER);
      await repo.save('C', 'c', 'other-user');
      const page = await repo.findAll(2, 1, OWNER);
      expect(page.map((n) => n.title)).toEqual(['B']);
    });

    it('updates and deletes', async () => {
      const repo = createRepository();
      const note = await repo.save('T', 'B', OWNER);
      const updated = await repo.update(note.id, 'T2', 'B2');
      expect(updated?.title).toBe('T2');
      expect(await repo.delete(note.id)).toBe(true);
      expect(await repo.findById(note.id)).toBeUndefined();
    });

    it('counts notes', async () => {
      const repo = createRepository();
      await repo.save('A', 'a', OWNER);
      await repo.save('B', 'b', OWNER);
      expect(await repo.count()).toBe(2);
    });
  });
}

runRepositoryContract('in-memory', () => new InMemoryNoteRepository());
runRepositoryContract('sqlite', () => {
  const database = new DatabaseSync(':memory:');
  ensureExamplesSchema(database);
  return new SqliteNoteRepository(new SqliteQueryExecutor(database));
});
