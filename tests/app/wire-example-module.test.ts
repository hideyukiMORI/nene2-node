import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { registerExampleModule, resolveExampleModule } from '../../src/app/wire-example-module.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { InMemoryNoteRepository } from '../../src/example/note/in-memory-note-repository.js';

describe('wire-example-module', () => {
  it('resolves in-memory repositories by default', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const wiring = resolveExampleModule({ problems });

    expect(wiring.domainHandlers.length).toBe(2);
    await expect(wiring.noteRepository.findAll(10, 0)).resolves.toEqual([]);
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
    expect(wiring.domainHandlers).toHaveLength(3);
  });

  it('registers example HTTP routes', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const wiring = resolveExampleModule({ problems });
    const app = new Hono();
    registerExampleModule(app, wiring, problems);

    const response = await app.request('http://localhost/examples/notes');
    expect(response.status).toBe(200);
  });
});
