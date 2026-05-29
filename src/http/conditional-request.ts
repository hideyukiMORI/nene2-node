import { createHash } from 'node:crypto';

import type { Context } from 'hono';

import type { ProblemDetailsFactory } from './problem-details.js';

/**
 * Compute a strong, double-quoted ETag from resource content (RFC 9110).
 *
 * The double quotes are required: without them `If-None-Match` comparison
 * always fails. Keep ETag generation in one place so changing the algorithm is
 * a single edit.
 *
 * @example
 *   const etag = computeETag(article.title + article.body + article.updatedAt);
 *   // '"3b0c…"'
 */
export function computeETag(content: string): string {
  return `"${createHash('sha256').update(content).digest('hex')}"`;
}

/**
 * Normalise a single ETag token: strip an optional weak `W/` prefix so weak and
 * strong forms of the same tag compare equal (pragmatic weak comparison).
 */
function normaliseEtag(token: string): string {
  const trimmed = token.trim();
  return trimmed.startsWith('W/') ? trimmed.slice(2).trim() : trimmed;
}

/**
 * True when a comma-separated ETag list header matches `etag`, or contains the
 * `*` wildcard.
 */
function etagListMatches(headerValue: string, etag: string): boolean {
  const target = normaliseEtag(etag);
  for (const raw of headerValue.split(',')) {
    const token = raw.trim();
    if (token === '*') {
      return true;
    }
    if (normaliseEtag(token) === target) {
      return true;
    }
  }
  return false;
}

function notModified(c: Context, etag: string): Response {
  // RFC 9110: a 304 response carries no body but SHOULD echo the ETag.
  return c.body(null, 304, { ETag: etag });
}

/**
 * Conditional GET. Returns a `304 Not Modified` response when the client's
 * cached copy is still fresh, or `null` when a full `200` response must be sent.
 *
 * Evaluation order (RFC 9110): `If-None-Match` takes precedence; only when it is
 * absent is `If-Modified-Since` considered.
 *
 * - `If-None-Match`: matches the current ETag (or `*`) → 304.
 * - `If-Modified-Since`: string comparison `ifModifiedSince >= lastModified` → 304.
 *
 * `lastModified` must sort lexicographically — use ISO 8601 UTC
 * (`2026-05-21T12:00:00Z`), not the RFC 1123 `GMT` format, which sorts wrong.
 */
export function checkNotModified(c: Context, etag: string, lastModified?: string): Response | null {
  const ifNoneMatch = c.req.header('If-None-Match');
  if (ifNoneMatch !== undefined) {
    return etagListMatches(ifNoneMatch, etag) ? notModified(c, etag) : null;
  }

  const ifModifiedSince = c.req.header('If-Modified-Since');
  if (
    ifModifiedSince !== undefined &&
    lastModified !== undefined &&
    ifModifiedSince >= lastModified
  ) {
    return notModified(c, etag);
  }

  return null;
}

export interface PreconditionOptions {
  /** When `true` (default), a missing `If-Match` header returns `428`. */
  readonly require?: boolean;
}

/**
 * Conditional write precondition (`If-Match`). Call **before** the write —
 * checking after is meaningless.
 *
 * Returns a Problem Details response, or `null` when the precondition passes:
 *
 * - `If-Match` absent + `require` (default) → `428 Precondition Required`.
 * - `If-Match` absent + `require: false` → `null` (write proceeds).
 * - `If-Match: *` → `null` (proceeds; the caller must 404-guard non-existent rows).
 * - `If-Match` matches the current ETag → `null`.
 * - `If-Match` present but stale → `412 Precondition Failed`.
 */
export function checkPreconditions(
  c: Context,
  problems: ProblemDetailsFactory,
  currentEtag: string,
  options: PreconditionOptions = {},
): Response | null {
  const require = options.require ?? true;
  const ifMatch = c.req.header('If-Match');

  if (ifMatch === undefined) {
    if (!require) {
      return null;
    }
    return problems.jsonResponse(
      c,
      problems.build('precondition-required', 'Precondition Required', 428, {
        detail: 'This write requires an If-Match header carrying the current ETag.',
      }),
    );
  }

  if (etagListMatches(ifMatch, currentEtag)) {
    return null;
  }

  return problems.jsonResponse(
    c,
    problems.build('precondition-failed', 'Precondition Failed', 412, {
      detail: 'The If-Match ETag does not match the current resource state.',
    }),
  );
}
