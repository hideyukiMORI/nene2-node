import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { SqliteQueryExecutor } from '../../../src/database/sqlite-query-executor.js';
import { InMemoryNoteRepository } from '../../../src/example/note/in-memory-note-repository.js';
import type { NoteRepository } from '../../../src/example/note/note-repository.js';
import { SqliteNoteRepository } from '../../../src/example/note/sqlite-note-repository.js';
import { ensureNotesSchema } from '../../../src/example/note/sqlite-note-schema.js';

function runRepositoryContract(name: string, createRepository: () => NoteRepository): void {
  describe(`NoteRepository (${name})`, () => {
    it('saves and finds by id', () => {
      const repo = createRepository();
      const note = repo.save('Hello', 'World');
      expect(repo.findById(note.id)).toEqual(note);
    });

    it('returns undefined for missing id', () => {
      const repo = createRepository();
      expect(repo.findById(9999)).toBeUndefined();
    });

    it('lists with limit and offset', () => {
      const repo = createRepository();
      repo.save('A', 'a');
      repo.save('B', 'b');
      repo.save('C', 'c');
      const page = repo.findAll(2, 1);
      expect(page.map((n) => n.title)).toEqual(['B', 'C']);
    });

    it('updates and deletes', () => {
      const repo = createRepository();
      const note = repo.save('T', 'B');
      const updated = repo.update(note.id, 'T2', 'B2');
      expect(updated?.title).toBe('T2');
      expect(repo.delete(note.id)).toBe(true);
      expect(repo.findById(note.id)).toBeUndefined();
    });

    it('counts notes', () => {
      const repo = createRepository();
      repo.save('A', 'a');
      repo.save('B', 'b');
      expect(repo.count()).toBe(2);
    });
  });
}

runRepositoryContract('in-memory', () => new InMemoryNoteRepository());
runRepositoryContract('sqlite', () => {
  const database = new DatabaseSync(':memory:');
  ensureNotesSchema(database);
  return new SqliteNoteRepository(new SqliteQueryExecutor(database));
});
