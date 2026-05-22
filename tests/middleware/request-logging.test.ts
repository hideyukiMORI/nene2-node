import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

import { requestIdMiddleware } from '../../src/middleware/request-id.js';
import {
  requestLoggingMiddleware,
  type RequestLogEntry,
} from '../../src/middleware/request-logging.js';

describe('requestLoggingMiddleware', () => {
  it('logs structured request completion', async () => {
    const log = vi.fn<(entry: RequestLogEntry) => void>();
    const app = new Hono();
    app.use('*', requestIdMiddleware());
    app.use('*', requestLoggingMiddleware({ log }));
    app.get('/hello', (c) => c.text('hi'));

    const response = await app.request('http://localhost/hello');
    expect(response.status).toBe(200);
    expect(log).toHaveBeenCalledOnce();
    const entry = log.mock.calls[0]?.[0];
    expect(entry?.event).toBe('request.completed');
    expect(entry?.method).toBe('GET');
    expect(entry?.path).toBe('/hello');
    expect(entry?.requestId).toMatch(/^[a-f0-9]{32}$/);
  });

  it('skips excluded paths', async () => {
    const log = vi.fn<(entry: RequestLogEntry) => void>();
    const app = new Hono();
    app.use('*', requestIdMiddleware());
    app.use('*', requestLoggingMiddleware({ log, excludePaths: ['/health'] }));
    app.get('/health', (c) => c.text('ok'));

    await app.request('http://localhost/health');
    expect(log).not.toHaveBeenCalled();
  });
});
