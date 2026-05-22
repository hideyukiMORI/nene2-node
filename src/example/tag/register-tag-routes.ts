import type { Hono } from 'hono';

import { parseJsonObjectBody } from '../../http/parse-json-body.js';
import { parsePaginationQuery } from '../../http/pagination-query.js';
import type { ProblemDetailsFactory } from '../../http/problem-details.js';
import { problemDetailsFromContext } from '../../http/problem-details.js';
import { tagToJSON } from './tag.js';
import { TagNotFoundError } from './tag-not-found-error.js';
import type { TagRepository } from './tag-repository.js';
import {
  CreateTagUseCase,
  DeleteTagByIdUseCase,
  GetTagByIdUseCase,
  ListTagsUseCase,
  UpdateTagUseCase,
} from './tag-use-cases.js';
import { validateTagBody } from './validate-tag-body.js';

export interface TagRoutesDeps {
  readonly repository: TagRepository;
  readonly problems: ProblemDetailsFactory;
}

function parseTagId(raw: string): number {
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new TagNotFoundError(0);
  }
  return id;
}

export function registerTagRoutes(app: Hono, deps: TagRoutesDeps): void {
  const listTags = new ListTagsUseCase(deps.repository);
  const getTag = new GetTagByIdUseCase(deps.repository);
  const createTag = new CreateTagUseCase(deps.repository);
  const updateTag = new UpdateTagUseCase(deps.repository);
  const deleteTag = new DeleteTagByIdUseCase(deps.repository);

  app.get('/examples/tags', async (c) => {
    const pagination = parsePaginationQuery(new URL(c.req.url).searchParams);
    const output = await listTags.execute(pagination);
    return c.json(
      {
        items: output.items.map(tagToJSON),
        limit: output.limit,
        offset: output.offset,
      },
      200,
      { 'Content-Type': 'application/json; charset=utf-8' },
    );
  });

  app.post('/examples/tags', async (c) => {
    const body = validateTagBody(await parseJsonObjectBody(c.req.raw));
    const tag = await createTag.execute(body);
    return c.json(tagToJSON(tag), 201, {
      'Content-Type': 'application/json; charset=utf-8',
      Location: `/examples/tags/${String(tag.id)}`,
    });
  });

  app.get('/examples/tags/:id', async (c) => {
    const tag = await getTag.execute({ tagId: parseTagId(c.req.param('id')) });
    return c.json(tagToJSON(tag), 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  });

  app.put('/examples/tags/:id', async (c) => {
    const tagId = parseTagId(c.req.param('id'));
    const body = validateTagBody(await parseJsonObjectBody(c.req.raw));
    const tag = await updateTag.execute({ tagId, name: body.name });
    return c.json(tagToJSON(tag), 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  });

  app.delete('/examples/tags/:id', async (c) => {
    await deleteTag.execute({ tagId: parseTagId(c.req.param('id')) });
    return c.body(null, 204);
  });

  app.on(['PATCH', 'DELETE'], '/examples/tags', (c) => {
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
