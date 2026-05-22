import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

describe('database read replica URL', () => {
  it('exposes readExecutor when NENE2_NODE_DATABASE_READ_URL is set (sqlite aliases primary)', async () => {
    const settings = loadAppSettings({
      NODE_ENV: 'test',
      NENE2_NODE_APP_ENV: 'test',
      NENE2_NODE_DATABASE_URL: ':memory:',
      NENE2_NODE_DATABASE_READ_URL: ':memory:',
    });
    const { database } = await createApp({ settings });
    expect(database?.readExecutor).toBeDefined();
    expect(database?.readExecutor).toBe(database?.executor);
  });
});
