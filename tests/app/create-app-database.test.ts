import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';

describe('createApp database handle', () => {
  it('exposes executor when database URL is set', async () => {
    const settings = loadAppSettings({
      NENE2_NODE_DATABASE_URL: ':memory:',
      NENE2_NODE_APP_ENV: 'test',
    });
    const nene2 = await createApp({ settings });
    expect(nene2.database?.backend).toBe('sqlite');
    expect(nene2.database?.executor).toBeDefined();
    expect(nene2.database?.transactionManager).toBeDefined();
    await nene2.shutdown?.();
  });

  it('omits database when no URL', async () => {
    const settings = loadAppSettings({
      NENE2_NODE_APP_ENV: 'test',
    });
    const nene2 = await createApp({ settings });
    expect(nene2.database).toBeUndefined();
  });
});
