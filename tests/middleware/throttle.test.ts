import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { InMemoryRateLimitStorage } from '../../src/middleware/rate-limit-storage.js';
import { throttleMiddleware } from '../../src/middleware/throttle.js';

describe('throttleMiddleware', () => {
  it('returns 429 when limit exceeded', async () => {
    const problems = createProblemDetailsFactory('https://nene2.dev/problems/');
    const storage = new InMemoryRateLimitStorage();
    const app = new Hono();
    app.use(
      '*',
      throttleMiddleware(problems, {
        limit: 2,
        windowSeconds: 60,
        storage,
        keyExtractor: () => 'test-client',
      }),
    );
    app.get('/api', (c) => c.text('ok'));

    const url = 'http://localhost/api';
    expect((await app.request(url)).status).toBe(200);
    expect((await app.request(url)).status).toBe(200);
    const blocked = await app.request(url);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).not.toBeNull();
    expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0');
  });
});
