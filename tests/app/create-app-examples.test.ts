import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

describe('createApp includeExamples', () => {
  it('defaults includeExamples to true in test env', () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    expect(settings.includeExamples).toBe(true);
  });

  it('defaults includeExamples to false in production env', () => {
    const settings = loadAppSettings({
      NODE_ENV: 'production',
      NENE2_NODE_APP_ENV: 'production',
    });
    expect(settings.includeExamples).toBe(false);
  });

  it('omits /examples/* when includeExamples is false', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_INCLUDE_EXAMPLES: 'false',
    });
    const { app } = await createApp({ settings });
    const ping = await app.request('http://localhost/examples/ping');
    const notes = await app.request('http://localhost/examples/notes');
    expect(ping.status).toBe(404);
    expect(notes.status).toBe(404);
  });

  it('keeps /health when examples are disabled', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_INCLUDE_EXAMPLES: 'false',
    });
    const { app } = await createApp({ settings });
    const health = await app.request('http://localhost/health');
    expect(health.status).toBe(200);
  });
});
