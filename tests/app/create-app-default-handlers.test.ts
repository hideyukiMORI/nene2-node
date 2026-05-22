import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { ResourceAccessDeniedError } from '../../src/error/resource-access-denied-error.js';
import { TransactionAbortedError } from '../../src/error/transaction-aborted-error.js';
import { VersionConflictError } from '../../src/error/version-conflict-error.js';

describe('createApp default domain handlers', () => {
  it('maps TransactionAbortedError to 422 without explicit domainHandlers', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const { app } = await createApp({ settings });
    app.get('/_test/tx-abort', () => {
      throw new TransactionAbortedError('business rule failed');
    });

    const response = await app.request('http://localhost/_test/tx-abort');
    const body = (await response.json()) as { status: number; type: string };
    expect(response.status).toBe(422);
    expect(body.type).toContain('transaction-aborted');
  });

  it('maps VersionConflictError to 409 without explicit domainHandlers', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const { app } = await createApp({ settings });
    app.get('/_test/version', () => {
      throw new VersionConflictError('note', 42);
    });

    const response = await app.request('http://localhost/_test/version');
    expect(response.status).toBe(409);
  });

  it('maps ResourceAccessDeniedError to 403 without explicit domainHandlers', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const { app } = await createApp({ settings });
    app.get('/_test/forbidden', () => {
      throw new ResourceAccessDeniedError('order', 7);
    });

    const response = await app.request('http://localhost/_test/forbidden');
    expect(response.status).toBe(403);
  });
});
