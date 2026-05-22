import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryTagRepository } from '../../../src/example/tag/in-memory-tag-repository.js';
import { TagNotFoundError } from '../../../src/example/tag/tag-not-found-error.js';
import {
  CreateTagUseCase,
  DeleteTagByIdUseCase,
  GetTagByIdUseCase,
  ListTagsUseCase,
  UpdateTagUseCase,
} from '../../../src/example/tag/tag-use-cases.js';

describe('Tag use cases', () => {
  let repository: InMemoryTagRepository;
  let listTags: ListTagsUseCase;
  let createTag: CreateTagUseCase;
  let getTag: GetTagByIdUseCase;
  let updateTag: UpdateTagUseCase;
  let deleteTag: DeleteTagByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryTagRepository();
    listTags = new ListTagsUseCase(repository);
    createTag = new CreateTagUseCase(repository);
    getTag = new GetTagByIdUseCase(repository);
    updateTag = new UpdateTagUseCase(repository);
    deleteTag = new DeleteTagByIdUseCase(repository);
  });

  it('creates and lists tags', () => {
    createTag.execute({ name: 'php' });
    const output = listTags.execute({ limit: 20, offset: 0 });
    expect(output.items[0]?.name).toBe('php');
  });

  it('throws TagNotFoundError when missing', () => {
    expect(() => getTag.execute({ tagId: 99 })).toThrow(TagNotFoundError);
  });

  it('updates and deletes a tag', () => {
    const created = createTag.execute({ name: 'old' });
    updateTag.execute({ tagId: created.id, name: 'new' });
    deleteTag.execute({ tagId: created.id });
    expect(() => getTag.execute({ tagId: created.id })).toThrow(TagNotFoundError);
  });
});
