import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryTagRepository } from '../../../src/example/tag/in-memory-tag-repository.js';
import { TagNotFoundError } from '../../../src/example/tag/tag-not-found-error.js';
import {
  CreateTagUseCase,
  DeleteTagByIdUseCase,
  GetTagByIdUseCase,
  ListTagsUseCase,
  UpdateTagUseCase,
} from '../../../src/example/tag/tag-use-cases.js';
import { ResourceAccessDeniedError } from '../../../src/error/resource-access-denied-error.js';

const USER_A = 'user-a';
const USER_B = 'user-b';

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
    await createTag.execute({ name: 'php', authSub: USER_A });
    const output = await listTags.execute({ limit: 20, offset: 0, authSub: USER_A });
    expect(output.items[0]?.name).toBe('php');
  });

  it('throws ResourceAccessDeniedError for cross-user read, update, and delete', async () => {
    const created = await createTag.execute({ name: 'secret', authSub: USER_A });
    await expect(getTag.execute({ tagId: created.id, authSub: USER_B })).rejects.toThrow(
      ResourceAccessDeniedError,
    );
    await expect(
      updateTag.execute({ tagId: created.id, name: 'hacked', authSub: USER_B }),
    ).rejects.toThrow(ResourceAccessDeniedError);
    await expect(deleteTag.execute({ tagId: created.id, authSub: USER_B })).rejects.toThrow(
      ResourceAccessDeniedError,
    );
  });

  it('throws TagNotFoundError when missing', async () => {
    await expect(getTag.execute({ tagId: 99, authSub: USER_A })).rejects.toThrow(TagNotFoundError);
  });

  it('throws TagNotFoundError on update when missing', async () => {
    await expect(updateTag.execute({ tagId: 99, name: 'n', authSub: USER_A })).rejects.toThrow(
      TagNotFoundError,
    );
  });

  it('throws TagNotFoundError on delete when missing', async () => {
    await expect(deleteTag.execute({ tagId: 99, authSub: USER_A })).rejects.toThrow(
      TagNotFoundError,
    );
  });

  it('throws TagNotFoundError when update returns undefined after ownership check', async () => {
    const owned = { id: 1, name: 't', ownerId: USER_A, createdAt: '2026-05-22T12:00:00.000Z' };
    const repository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(owned),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      count: vi.fn(),
    };
    const updateTagUseCase = new UpdateTagUseCase(repository);
    await expect(
      updateTagUseCase.execute({ tagId: 1, name: 'n', authSub: USER_A }),
    ).rejects.toThrow(TagNotFoundError);
  });

  it('throws TagNotFoundError when delete returns false after ownership check', async () => {
    const owned = { id: 1, name: 't', ownerId: USER_A, createdAt: '2026-05-22T12:00:00.000Z' };
    const repository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(owned),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(false),
      count: vi.fn(),
    };
    const deleteTagUseCase = new DeleteTagByIdUseCase(repository);
    await expect(deleteTagUseCase.execute({ tagId: 1, authSub: USER_A })).rejects.toThrow(
      TagNotFoundError,
    );
  });

  it('updates and deletes a tag', async () => {
    const created = await createTag.execute({ name: 'old', authSub: USER_A });
    await updateTag.execute({ tagId: created.id, name: 'new', authSub: USER_A });
    await deleteTag.execute({ tagId: created.id, authSub: USER_A });
    await expect(getTag.execute({ tagId: created.id, authSub: USER_A })).rejects.toThrow(
      TagNotFoundError,
    );
  });
});
