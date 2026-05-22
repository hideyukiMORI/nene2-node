import type { Context } from 'hono';

import { authSubFromContext } from '../domain/resource-ownership.js';

/** Default throttle bucket key (first `X-Forwarded-For` hop or `ip:unknown`). */
export function ipThrottleKey(c: Context): string {
  const forwarded = c.req.header('X-Forwarded-For');
  if (forwarded !== undefined && forwarded !== '') {
    const first = forwarded.split(',')[0]?.trim();
    if (first !== undefined && first !== '') {
      return `ip:${first}`;
    }
  }
  return 'ip:unknown';
}

/** Per-authenticated-user bucket using JWT `sub` (falls back to IP when anonymous). */
export function jwtSubThrottleKey(c: Context): string {
  const sub = authSubFromContext(c.get('authClaims'));
  if (sub !== undefined && sub !== '') {
    return `sub:${sub}`;
  }
  return ipThrottleKey(c);
}
