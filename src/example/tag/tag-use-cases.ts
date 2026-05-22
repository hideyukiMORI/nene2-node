import { assertResourceOwner } from '../../domain/resource-ownership.js';
import { TagNotFoundError } from './tag-not-found-error.js';
import type { Tag } from './tag.js';
import type { TagRepository } from './tag-repository.js';

export interface ListTagsInput {
  readonly limit: number;
  readonly offset: number;
  readonly authSub: string;
}

export interface ListTagsOutput {
  readonly items: readonly Tag[];
  readonly limit: number;
  readonly offset: number;
}

export class ListTagsUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: ListTagsInput): Promise<ListTagsOutput> {
    return {
      items: await this.repository.findAll(input.limit, input.offset, input.authSub),
      limit: input.limit,
      offset: input.offset,
    };
  }
}

export interface CreateTagInput {
  readonly name: string;
  readonly authSub: string;
}

export class CreateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: CreateTagInput): Promise<Tag> {
    return this.repository.save(input.name, input.authSub);
  }
}

export interface GetTagByIdInput {
  readonly tagId: number;
  readonly authSub: string;
}

export class GetTagByIdUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: GetTagByIdInput): Promise<Tag> {
    const tag = await this.repository.findById(input.tagId);
    if (tag === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    assertResourceOwner(tag.ownerId, input.authSub, 'tag', tag.id);
    return tag;
  }
}

export interface UpdateTagInput {
  readonly tagId: number;
  readonly name: string;
  readonly authSub: string;
}

export class UpdateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: UpdateTagInput): Promise<Tag> {
    const existing = await this.repository.findById(input.tagId);
    if (existing === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    assertResourceOwner(existing.ownerId, input.authSub, 'tag', existing.id);
    const tag = await this.repository.update(input.tagId, input.name);
    if (tag === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    return tag;
  }
}

export interface DeleteTagByIdInput {
  readonly tagId: number;
  readonly authSub: string;
}

export class DeleteTagByIdUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: DeleteTagByIdInput): Promise<void> {
    const existing = await this.repository.findById(input.tagId);
    if (existing === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    assertResourceOwner(existing.ownerId, input.authSub, 'tag', existing.id);
    const deleted = await this.repository.delete(input.tagId);
    if (!deleted) {
      throw new TagNotFoundError(input.tagId);
    }
  }
}
