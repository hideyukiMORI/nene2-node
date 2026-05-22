import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { createProblemDetailsFactory } from '../../src/http/problem-details.js';

describe('createProblemDetailsFactory', () => {
  it('normalizes base URL without trailing slash', () => {
    const factory = createProblemDetailsFactory('https://example.com/problems');
    expect(factory.baseUrl).toBe('https://example.com/problems/');
    expect(factory.build('not-found', 'Not Found', 404).type).toBe(
      'https://example.com/problems/not-found',
    );
  });

  it('includes optional detail and instance', () => {
    const factory = createProblemDetailsFactory('https://example.com/problems/');
    const body = factory.build('validation-failed', 'Validation Failed', 422, {
      detail: 'bad input',
      instance: '/items',
    });
    expect(body.detail).toBe('bad input');
    expect(body.instance).toBe('/items');
  });

  it('rejects reserved extension keys', () => {
    const factory = createProblemDetailsFactory('https://example.com/problems/');
    expect(() => factory.build('x', 'X', 400, { extensions: { type: 'shadow' } })).toThrow(
      /reserved field/,
    );
  });
});

describe('problemDetailsFromContext', () => {
  it('returns problem+json response', async () => {
    const app = new Hono();
    const problems = createProblemDetailsFactory('https://example.com/problems/');
    app.get('/demo', (c) =>
      problems.jsonResponse(
        c,
        problems.build('not-found', 'Not Found', 404, { detail: 'missing' }),
      ),
    );
    const res = await app.request('http://localhost/demo');
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/problem+json');
  });
});
