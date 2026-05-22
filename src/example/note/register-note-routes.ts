import type { Hono } from 'hono';

import { parseJsonObjectBody } from '../../http/parse-json-body.js';
import { parsePaginationQuery } from '../../http/pagination-query.js';
import type { ProblemDetailsFactory } from '../../http/problem-details.js';
import { problemDetailsFromContext } from '../../http/problem-details.js';
import { noteToJSON } from './note.js';
import { NoteNotFoundError } from './note-not-found-error.js';
import type { NoteRepository } from './note-repository.js';
import {
  CreateNoteUseCase,
  DeleteNoteByIdUseCase,
  GetNoteByIdUseCase,
  ListNotesUseCase,
  UpdateNoteUseCase,
} from './note-use-cases.js';
import { validateCreateNoteBody } from './validate-note-body.js';

export interface NoteRoutesDeps {
  readonly repository: NoteRepository;
  readonly problems: ProblemDetailsFactory;
}

function parseNoteId(raw: string): number {
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new NoteNotFoundError(0);
  }
  return id;
}

export function registerNoteRoutes(app: Hono, deps: NoteRoutesDeps): void {
  const listNotes = new ListNotesUseCase(deps.repository);
  const getNote = new GetNoteByIdUseCase(deps.repository);
  const createNote = new CreateNoteUseCase(deps.repository);
  const updateNote = new UpdateNoteUseCase(deps.repository);
  const deleteNote = new DeleteNoteByIdUseCase(deps.repository);

  app.get('/examples/notes', (c) => {
    const pagination = parsePaginationQuery(new URL(c.req.url).searchParams);
    const output = listNotes.execute(pagination);
    return c.json(
      {
        items: output.items.map(noteToJSON),
        limit: output.limit,
        offset: output.offset,
      },
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
    );
  });

  app.post('/examples/notes', async (c) => {
    const body = validateCreateNoteBody(await parseJsonObjectBody(c.req.raw));
    const note = createNote.execute(body);
    const location = `/examples/notes/${String(note.id)}`;
    return c.json(noteToJSON(note), 201, {
      'Content-Type': 'application/json; charset=utf-8',
      Location: location,
    });
  });

  app.get('/examples/notes/:id', (c) => {
    const note = getNote.execute({ noteId: parseNoteId(c.req.param('id')) });
    return c.json(noteToJSON(note), 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  });

  app.put('/examples/notes/:id', async (c) => {
    const noteId = parseNoteId(c.req.param('id'));
    const body = validateCreateNoteBody(await parseJsonObjectBody(c.req.raw));
    const note = updateNote.execute({ noteId, title: body.title, body: body.body });
    return c.json(noteToJSON(note), 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  });

  app.delete('/examples/notes/:id', (c) => {
    deleteNote.execute({ noteId: parseNoteId(c.req.param('id')) });
    return c.body(null, 204);
  });

  app.on(['PATCH', 'DELETE'], '/examples/notes', (c) => {
    const response = problemDetailsFromContext(
      deps.problems,
      c,
      'method-not-allowed',
      'Method Not Allowed',
      405,
      `The ${c.req.method} method is not allowed for this resource.`,
    );
    response.headers.set('Allow', 'GET, POST');
    return response;
  });
}
