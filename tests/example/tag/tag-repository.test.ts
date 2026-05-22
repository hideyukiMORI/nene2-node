import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { ensureExamplesSchema } from '../../../src/example/example-sqlite-schema.js';
import { SqliteQueryExecutor } from '../../../src/database/sqlite-query-executor.js';
import { InMemoryTagRepository } from '../../../src/example/tag/in-memory-tag-repository.js';
import type { TagRepository } from '../../../src/example/tag/tag-repository.js';
import { SqliteTagRepository } from '../../../src/example/tag/sqlite-tag-repository.js';

function runRepositoryContract(name: string, createRepository: () => TagRepository): void {
  describe(`TagRepository (${name})`, () => {
    it('saves and finds by id', () => {
      const repo = createRepository();
      const tag = repo.save('php');
      expect(repo.findById(tag.id)).toEqual(tag);
    });

    it('updates and deletes', () => {
      const repo = createRepository();
      const tag = repo.save('php');
      expect(repo.update(tag.id, 'php8')?.name).toBe('php8');
      expect(repo.delete(tag.id)).toBe(true);
    });
  });
}

runRepositoryContract('in-memory', () => new InMemoryTagRepository());
runRepositoryContract('sqlite', () => {
  const database = new DatabaseSync(':memory:');
  ensureExamplesSchema(database);
  return new SqliteTagRepository(new SqliteQueryExecutor(database));
});
