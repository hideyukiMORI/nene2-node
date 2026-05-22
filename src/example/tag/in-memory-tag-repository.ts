import type { Tag } from './tag.js';
import type { TagRepository } from './tag-repository.js';

export class InMemoryTagRepository implements TagRepository {
  private readonly store = new Map<number, Tag>();
  private nextId = 1;

  findAll(limit: number, offset: number): Tag[] {
    const tags = [...this.store.values()].sort((a, b) => a.id - b.id);
    return tags.slice(offset, offset + limit);
  }

  findById(tagId: number): Tag | undefined {
    return this.store.get(tagId);
  }

  save(name: string): Tag {
    const tag: Tag = { id: this.nextId, name };
    this.store.set(this.nextId, tag);
    this.nextId += 1;
    return tag;
  }

  update(tagId: number, name: string): Tag | undefined {
    if (!this.store.has(tagId)) {
      return undefined;
    }
    const updated: Tag = { id: tagId, name };
    this.store.set(tagId, updated);
    return updated;
  }

  delete(tagId: number): boolean {
    return this.store.delete(tagId);
  }

  count(): number {
    return this.store.size;
  }
}
