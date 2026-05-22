import type { Tag } from './tag.js';

export interface TagRepository {
  findAll(limit: number, offset: number): Tag[];
  findById(tagId: number): Tag | undefined;
  save(name: string): Tag;
  update(tagId: number, name: string): Tag | undefined;
  delete(tagId: number): boolean;
  count(): number;
}
