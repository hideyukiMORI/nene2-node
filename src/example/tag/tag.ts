export interface Tag {
  readonly id: number;
  readonly name: string;
  readonly ownerId: string;
}

export function tagToJSON(tag: Tag): { id: number; name: string } {
  return { id: tag.id, name: tag.name };
}
