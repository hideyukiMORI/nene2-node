import type { Tag } from './tag.js';
import type { TagRepository } from './tag-repository.js';

export class InMemoryTagRepository implements TagRepository {
  private readonly store = new Map<number, Tag>();
  private nextId = 1;

  findAll(limit: number, offset: number): Promise<Tag[]> {
    const tags = [...this.store.values()].sort((a, b) => a.id - b.id);
    return Promise.resolve(tags.slice(offset, offset + limit));
  }

  findById(tagId: number): Promise<Tag | undefined> {
    return Promise.resolve(this.store.get(tagId));
  }

  save(name: string): Promise<Tag> {
    const tag: Tag = { id: this.nextId, name };
    this.store.set(this.nextId, tag);
    this.nextId += 1;
    return Promise.resolve(tag);
  }

  update(tagId: number, name: string): Promise<Tag | undefined> {
    if (!this.store.has(tagId)) {
      return Promise.resolve(undefined);
    }
    const updated: Tag = { id: tagId, name };
    this.store.set(tagId, updated);
    return Promise.resolve(updated);
  }

  delete(tagId: number): Promise<boolean> {
    return Promise.resolve(this.store.delete(tagId));
  }

  count(): Promise<number> {
    return Promise.resolve(this.store.size);
  }
}
