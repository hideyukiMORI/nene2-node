export interface Note {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly ownerId: string;
  readonly createdAt: string;
}

export function noteToJSON(note: Note): {
  id: number;
  title: string;
  body: string;
  created_at: string;
} {
  return { id: note.id, title: note.title, body: note.body, created_at: note.createdAt };
}
