export interface Tag {
  readonly id: number;
  readonly name: string;
  readonly ownerId: string;
  readonly createdAt: string;
}

export function tagToJSON(tag: Tag): { id: number; name: string; created_at: string } {
  return { id: tag.id, name: tag.name, created_at: tag.createdAt };
}
