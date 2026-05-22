import { createHmac, timingSafeEqual } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

import type { ProblemDetailsFactory } from '../http/problem-details.js';
import { problemDetailsFromContext } from '../http/problem-details.js';

export interface WebhookSignatureOptions {
  readonly secret: string;
  /** Header carrying `sha256=<hex>` (GitHub-style) or raw hex. */
  readonly headerName?: string;
  readonly protectedPaths?: readonly string[];
}

function pathMatches(path: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => path === pattern || path.startsWith(`${pattern}/`));
}

function parseSignatureHeader(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith('sha256=')) {
    return trimmed.slice('sha256='.length);
  }
  return trimmed;
}

function signaturesMatch(expectedHex: string, providedHex: string): boolean {
  if (expectedHex.length !== providedHex.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(providedHex, 'hex'));
  } catch {
    return false;
  }
}

export function computeWebhookSignature(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

export function webhookSignatureMiddleware(
  problems: ProblemDetailsFactory,
  options: WebhookSignatureOptions,
): MiddlewareHandler {
  const headerName = options.headerName ?? 'X-Webhook-Signature-256';
  const protectedPaths = options.protectedPaths ?? ['/webhooks'];

  return async (c, next) => {
    if (!pathMatches(c.req.path, protectedPaths)) {
      await next();
      return;
    }

    const providedRaw = c.req.header(headerName);
    if (providedRaw === undefined || providedRaw === '') {
      return problemDetailsFromContext(
        problems,
        c,
        'unauthorized',
        'Unauthorized',
        401,
        'Missing webhook signature header.',
      );
    }

    const body = await c.req.raw.clone().text();
    const expected = computeWebhookSignature(body, options.secret);
    const provided = parseSignatureHeader(providedRaw);

    if (provided === undefined || !signaturesMatch(expected, provided)) {
      return problemDetailsFromContext(
        problems,
        c,
        'unauthorized',
        'Unauthorized',
        401,
        'Invalid webhook signature.',
      );
    }

    await next();
  };
}
