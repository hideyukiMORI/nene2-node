import type { Hono } from 'hono';

import type { DomainExceptionHandler } from '../error/domain-exception-handler.js';
import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { createNoteNotFoundHandler } from '../example/note/note-not-found-handler.js';
import { InMemoryNoteRepository } from '../example/note/in-memory-note-repository.js';
import type { NoteRepository } from '../example/note/note-repository.js';
import { registerNoteRoutes } from '../example/note/register-note-routes.js';
import { SqliteNoteRepository } from '../example/note/sqlite-note-repository.js';
import { createTagNotFoundHandler } from '../example/tag/tag-not-found-handler.js';
import { InMemoryTagRepository } from '../example/tag/in-memory-tag-repository.js';
import type { TagRepository } from '../example/tag/tag-repository.js';
import { registerTagRoutes } from '../example/tag/register-tag-routes.js';
import { SqliteTagRepository } from '../example/tag/sqlite-tag-repository.js';
import type { DatabaseQueryExecutor } from '../database/database-query-executor.js';

export interface ExampleModuleWiring {
  readonly noteRepository: NoteRepository;
  readonly tagRepository: TagRepository;
  readonly domainHandlers: readonly DomainExceptionHandler[];
}

export interface ResolveExampleModuleOptions {
  readonly problems: ProblemDetailsFactory;
  readonly executor?: DatabaseQueryExecutor;
  readonly noteRepository?: NoteRepository;
  readonly tagRepository?: TagRepository;
  readonly extraDomainHandlers?: readonly DomainExceptionHandler[];
}

export function resolveExampleModule(options: ResolveExampleModuleOptions): ExampleModuleWiring {
  let noteRepository = options.noteRepository;
  let tagRepository = options.tagRepository;

  if (noteRepository === undefined && options.executor !== undefined) {
    noteRepository = new SqliteNoteRepository(options.executor);
  }
  if (tagRepository === undefined && options.executor !== undefined) {
    tagRepository = new SqliteTagRepository(options.executor);
  }
  if (noteRepository === undefined) {
    noteRepository = new InMemoryNoteRepository();
  }
  if (tagRepository === undefined) {
    tagRepository = new InMemoryTagRepository();
  }

  return {
    noteRepository,
    tagRepository,
    domainHandlers: [
      createNoteNotFoundHandler(options.problems),
      createTagNotFoundHandler(options.problems),
      ...(options.extraDomainHandlers ?? []),
    ],
  };
}

export function registerExampleModule(
  app: Hono,
  wiring: ExampleModuleWiring,
  problems: ProblemDetailsFactory,
): void {
  registerNoteRoutes(app, { repository: wiring.noteRepository, problems });
  registerTagRoutes(app, { repository: wiring.tagRepository, problems });
}
