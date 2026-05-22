import { TagNotFoundError } from './tag-not-found-error.js';
import type { Tag } from './tag.js';
import type { TagRepository } from './tag-repository.js';

export interface ListTagsInput {
  readonly limit: number;
  readonly offset: number;
}

export interface ListTagsOutput {
  readonly items: readonly Tag[];
  readonly limit: number;
  readonly offset: number;
}

export class ListTagsUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: ListTagsInput): ListTagsOutput {
    return {
      items: this.repository.findAll(input.limit, input.offset),
      limit: input.limit,
      offset: input.offset,
    };
  }
}

export interface CreateTagInput {
  readonly name: string;
}

export class CreateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: CreateTagInput): Tag {
    return this.repository.save(input.name);
  }
}

export interface GetTagByIdInput {
  readonly tagId: number;
}

export class GetTagByIdUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: GetTagByIdInput): Tag {
    const tag = this.repository.findById(input.tagId);
    if (tag === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    return tag;
  }
}

export interface UpdateTagInput {
  readonly tagId: number;
  readonly name: string;
}

export class UpdateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: UpdateTagInput): Tag {
    const tag = this.repository.update(input.tagId, input.name);
    if (tag === undefined) {
      throw new TagNotFoundError(input.tagId);
    }
    return tag;
  }
}

export interface DeleteTagByIdInput {
  readonly tagId: number;
}

export class DeleteTagByIdUseCase {
  constructor(private readonly repository: TagRepository) {}

  execute(input: DeleteTagByIdInput): void {
    const deleted = this.repository.delete(input.tagId);
    if (!deleted) {
      throw new TagNotFoundError(input.tagId);
    }
  }
}
