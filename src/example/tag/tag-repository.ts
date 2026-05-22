import type { Tag } from './tag.js';

export interface TagRepository {
  findAll(limit: number, offset: number): Promise<Tag[]>;
  findById(tagId: number): Promise<Tag | undefined>;
  save(name: string): Promise<Tag>;
  update(tagId: number, name: string): Promise<Tag | undefined>;
  delete(tagId: number): Promise<boolean>;
  count(): Promise<number>;
}
