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

  it('creates and lists tags', async () => {
    await createTag.execute({ name: 'php' });
    const output = await listTags.execute({ limit: 20, offset: 0 });
    expect(output.items[0]?.name).toBe('php');
  });

  it('throws TagNotFoundError when missing', async () => {
    await expect(getTag.execute({ tagId: 99 })).rejects.toThrow(TagNotFoundError);
  });

  it('throws TagNotFoundError on update when missing', async () => {
    await expect(updateTag.execute({ tagId: 99, name: 'n' })).rejects.toThrow(TagNotFoundError);
  });

  it('throws TagNotFoundError on delete when missing', async () => {
    await expect(deleteTag.execute({ tagId: 99 })).rejects.toThrow(TagNotFoundError);
  });

  it('updates and deletes a tag', async () => {
    const created = await createTag.execute({ name: 'old' });
    await updateTag.execute({ tagId: created.id, name: 'new' });
    await deleteTag.execute({ tagId: created.id });
    await expect(getTag.execute({ tagId: created.id })).rejects.toThrow(TagNotFoundError);
  });
});
