import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { loadAppSettings } from '../../src/config/app-settings.js';
import { createTransactionAbortedHandler } from '../../src/error/transaction-aborted-handler.js';
import { TransactionAbortedError } from '../../src/error/transaction-aborted-error.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';

describe('createTransactionAbortedHandler', () => {
  it('maps TransactionAbortedError to 422', async () => {
    const settings = loadAppSettings({ NODE_ENV: 'test', NENE2_NODE_APP_ENV: 'test' });
    const problems = createProblemDetailsFactory(settings.problemDetailsBaseUrl);
    const { app } = await createApp({
      settings,
      domainHandlers: [createTransactionAbortedHandler(problems)],
    });
    app.get('/_test', () => {
      throw new TransactionAbortedError('insufficient stock');
    });
    const response = await app.request('http://localhost/_test');
    const body = (await response.json()) as { status: number; title: string };
    expect(response.status).toBe(422);
    expect(body.title).toBe('Transaction Aborted');
  });
});
