export interface Note {
  readonly id: number;
  readonly title: string;
  readonly body: string;
}

export function noteToJSON(note: Note): { id: number; title: string; body: string } {
  return { id: note.id, title: note.title, body: note.body };
}
