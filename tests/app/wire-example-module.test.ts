import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { registerExampleModule, resolveExampleModule } from '../../src/app/wire-example-module.js';
import { ResourceAccessDeniedError } from '../../src/error/resource-access-denied-error.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { InMemoryNoteRepository } from '../../src/example/note/in-memory-note-repository.js';
import { resolveHttpError } from '../../src/error/resolve-http-error.js';

describe('wire-example-module', () => {
  it('resolves in-memory repositories by default', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const wiring = resolveExampleModule({ problems });

    expect(wiring.domainHandlers).toHaveLength(3);
    expect(
      wiring.domainHandlers.some((handler) =>
        handler.supports(new ResourceAccessDeniedError('note', 1)),
      ),
    ).toBe(true);
    await expect(wiring.noteRepository.findAll(10, 0, 'user-test')).resolves.toEqual([]);
  });

  it('honours injected repositories and extra domain handlers', () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const noteRepository = new InMemoryNoteRepository();
    const wiring = resolveExampleModule({
      problems,
      noteRepository,
      extraDomainHandlers: [{ supports: () => false, handle: () => undefined }],
    });

    expect(wiring.noteRepository).toBe(noteRepository);
    expect(wiring.domainHandlers).toHaveLength(4);
  });

  it('registers note routes that require auth sub in handler layer', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const wiring = resolveExampleModule({ problems });
    const app = new Hono();
    app.onError((error, c) =>
      resolveHttpError({
        problems,
        c,
        error,
        appDebug: true,
        domainHandlers: wiring.domainHandlers,
      }),
    );
    registerExampleModule(app, wiring, problems);

    const response = await app.request('http://localhost/examples/notes');
    expect(response.status).toBe(403);
  });
});
