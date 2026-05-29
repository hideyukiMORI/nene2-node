import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import {
  checkNotModified,
  checkPreconditions,
  computeETag,
} from '../../src/http/conditional-request.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';

const problems = createProblemDetailsFactory('https://example.com/problems/');

const ETAG = computeETag('hello-world');
const LAST_MODIFIED = '2026-05-21T12:00:00Z';

/**
 * Minimal app exercising both helpers against a fixed resource.
 * GET /res  — conditional read (304 path)
 * PUT /res  — conditional write (412 / 428 path), require toggled by query
 */
function buildApp(): Hono {
  const app = new Hono();

  app.get('/res', (c) => {
    const notModified = checkNotModified(c, ETAG, LAST_MODIFIED);
    if (notModified !== null) {
      return notModified;
    }
    return c.json({ value: 'hello-world' }, 200, { ETag: ETAG, 'Last-Modified': LAST_MODIFIED });
  });

  app.put('/res', (c) => {
    const require = c.req.query('optional') !== '1';
    const failed = checkPreconditions(c, problems, ETAG, { require });
    if (failed !== null) {
      return failed;
    }
    return c.json({ value: 'written' }, 200, { ETag: ETAG });
  });

  return app;
}

// ---------------------------------------------------------------------------
// computeETag
// ---------------------------------------------------------------------------

describe('computeETag', () => {
  it('produces a double-quoted strong ETag', () => {
    expect(ETAG).toMatch(/^"[0-9a-f]{64}"$/);
  });

  it('is deterministic for the same content', () => {
    expect(computeETag('abc')).toBe(computeETag('abc'));
  });

  it('changes when content changes', () => {
    expect(computeETag('abc')).not.toBe(computeETag('abd'));
  });
});

// ---------------------------------------------------------------------------
// Conditional GET — checkNotModified
// ---------------------------------------------------------------------------

describe('checkNotModified — If-None-Match', () => {
  it('returns 304 with no body when If-None-Match matches', async () => {
    const res = await buildApp().request('/res', { headers: { 'If-None-Match': ETAG } });
    expect(res.status).toBe(304);
    expect(res.headers.get('ETag')).toBe(ETAG);
    expect(await res.text()).toBe('');
  });

  it('returns 200 when If-None-Match does not match', async () => {
    const res = await buildApp().request('/res', { headers: { 'If-None-Match': '"stale"' } });
    expect(res.status).toBe(200);
  });

  it('matches the wildcard *', async () => {
    const res = await buildApp().request('/res', { headers: { 'If-None-Match': '*' } });
    expect(res.status).toBe(304);
  });

  it('matches against a comma-separated list', async () => {
    const res = await buildApp().request('/res', {
      headers: { 'If-None-Match': `"other", ${ETAG}` },
    });
    expect(res.status).toBe(304);
  });

  it('treats a weak W/ prefix as equal to the strong tag', async () => {
    const res = await buildApp().request('/res', { headers: { 'If-None-Match': `W/${ETAG}` } });
    expect(res.status).toBe(304);
  });
});

describe('checkNotModified — If-Modified-Since', () => {
  it('returns 304 when If-Modified-Since is at or after Last-Modified', async () => {
    const res = await buildApp().request('/res', {
      headers: { 'If-Modified-Since': '2026-05-21T12:00:00Z' },
    });
    expect(res.status).toBe(304);
  });

  it('returns 304 when If-Modified-Since is strictly after Last-Modified', async () => {
    const res = await buildApp().request('/res', {
      headers: { 'If-Modified-Since': '2026-06-01T00:00:00Z' },
    });
    expect(res.status).toBe(304);
  });

  it('returns 200 when If-Modified-Since is before Last-Modified', async () => {
    const res = await buildApp().request('/res', {
      headers: { 'If-Modified-Since': '2026-01-01T00:00:00Z' },
    });
    expect(res.status).toBe(200);
  });

  it('lets If-None-Match take precedence over If-Modified-Since', async () => {
    // INM present but non-matching → 200, even though IMS would say 304.
    const res = await buildApp().request('/res', {
      headers: { 'If-None-Match': '"stale"', 'If-Modified-Since': '2026-06-01T00:00:00Z' },
    });
    expect(res.status).toBe(200);
  });

  it('returns 200 with full body when no conditional headers are sent', async () => {
    const res = await buildApp().request('/res');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: 'hello-world' });
  });
});

// ---------------------------------------------------------------------------
// Conditional write — checkPreconditions
// ---------------------------------------------------------------------------

describe('checkPreconditions — If-Match', () => {
  it('proceeds (200) when If-Match matches the current ETag', async () => {
    const res = await buildApp().request('/res', {
      method: 'PUT',
      headers: { 'If-Match': ETAG },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: 'written' });
  });

  it('returns 428 Precondition Required when If-Match is absent', async () => {
    const res = await buildApp().request('/res', { method: 'PUT' });
    expect(res.status).toBe(428);
    const body = await res.json();
    expect(body.type).toBe('https://example.com/problems/precondition-required');
    expect(body.status).toBe(428);
  });

  it('returns 412 Precondition Failed when If-Match is stale', async () => {
    const res = await buildApp().request('/res', {
      method: 'PUT',
      headers: { 'If-Match': '"stale"' },
    });
    expect(res.status).toBe(412);
    const body = await res.json();
    expect(body.type).toBe('https://example.com/problems/precondition-failed');
  });

  it('passes the wildcard If-Match: *', async () => {
    const res = await buildApp().request('/res', {
      method: 'PUT',
      headers: { 'If-Match': '*' },
    });
    expect(res.status).toBe(200);
  });

  it('allows a missing If-Match when require is false', async () => {
    const res = await buildApp().request('/res?optional=1', { method: 'PUT' });
    expect(res.status).toBe(200);
  });

  it('emits problem+json content type on 428', async () => {
    const res = await buildApp().request('/res', { method: 'PUT' });
    expect(res.headers.get('Content-Type')).toContain('application/problem+json');
  });
});
