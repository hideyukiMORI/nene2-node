import { isIP } from 'node:net';

import { ValidationException } from '../validation/validation-exception.js';

export type UrlSafetyReason = 'invalid_url' | 'blocked_scheme' | 'blocked_host';

export interface UrlSafetyResult {
  readonly safe: boolean;
  readonly reason?: UrlSafetyReason;
}

export interface SafeUrlOptions {
  /** Permitted URL schemes (without `:`). Default `['http', 'https']`. */
  readonly allowedSchemes?: readonly string[];
}

export interface SafeUrlAsyncOptions extends SafeUrlOptions {
  /**
   * Resolve a hostname to its IP addresses for DNS-rebinding protection. If any
   * resolved address is private, the URL is rejected. Typically wraps
   * `dns/promises` `lookup`/`resolve`.
   */
  readonly resolve?: (host: string) => Promise<readonly string[]>;
}

const DEFAULT_SCHEMES = ['http', 'https'] as const;

function ipv4FromOctets(...octets: number[]): boolean {
  return octets.every((o) => Number.isInteger(o) && o >= 0 && o <= 255);
}

/** Normalise an IPv4 literal in dotted / decimal / hex notation to dotted form. */
export function normaliseIpv4(host: string): string | null {
  if (isIP(host) === 4) {
    return host;
  }
  let value: number | null = null;
  if (/^[0-9]+$/.test(host)) {
    value = Number(host);
  } else if (/^0x[0-9a-f]+$/i.test(host)) {
    value = Number.parseInt(host.slice(2), 16);
  }
  if (value === null || !Number.isInteger(value) || value < 0 || value > 0xff_ff_ff_ff) {
    return null;
  }
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || !ipv4FromOctets(...parts)) {
    return false;
  }
  const [a, b] = parts as [number, number, number, number];
  if (a === 0 || a === 127 || a === 10) return true; // unspecified, loopback, RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 169 && b === 254) return true; // link-local
  return false;
}

function isPrivateIpv6(raw: string): boolean {
  const ip = raw.toLowerCase();
  if (ip === '::1' || ip === '::') return true; // loopback, unspecified
  if (
    ip.startsWith('fe8') ||
    ip.startsWith('fe9') ||
    ip.startsWith('fea') ||
    ip.startsWith('feb')
  ) {
    return true; // fe80::/10 link-local
  }
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // fc00::/7 unique-local

  // IPv4-mapped (::ffff:a.b.c.d or its hex-normalised ::ffff:hhhh:hhhh form).
  const mapped = /^::ffff:(.+)$/.exec(ip);
  if (mapped) {
    const tail = mapped[1] as string;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(tail)) {
      return isPrivateIpv4(tail);
    }
    const hex = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(tail);
    if (hex) {
      const high = Number.parseInt(hex[1] as string, 16);
      const low = Number.parseInt(hex[2] as string, 16);
      const dotted = [(high >> 8) & 255, high & 255, (low >> 8) & 255, low & 255].join('.');
      return isPrivateIpv4(dotted);
    }
  }
  return false;
}

/** True when `ip` (IPv4 or IPv6 literal) is loopback, private, link-local, or unspecified. */
export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIpv4(ip);
  if (kind === 6) return isPrivateIpv6(ip);
  const v4 = normaliseIpv4(ip);
  return v4 !== null ? isPrivateIpv4(v4) : false;
}

function isBlockedHost(host: string): boolean {
  const lower = host.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) {
    return true;
  }
  const ip = normaliseIpv4(lower);
  if (ip !== null) {
    return isPrivateIpv4(ip);
  }
  if (isIP(lower) === 6) {
    return isPrivateIpv6(lower);
  }
  return false;
}

/**
 * Structurally check whether `url` is safe to fetch server-side (SSRF guard).
 *
 * Rejects: unparseable URLs, schemes outside `allowedSchemes` (default
 * http/https), `localhost`/`*.localhost`, and private/loopback/link-local IP
 * **literals** — including decimal/hex-obfuscated IPv4 and IPv6 forms.
 *
 * This does **not** resolve DNS; a public hostname that resolves to a private
 * address still passes. Use {@link checkUrlSafetyAsync} with a `resolve` hook
 * for DNS-rebinding protection.
 */
export function checkUrlSafety(url: string, options: SafeUrlOptions = {}): UrlSafetyResult {
  const allowed = options.allowedSchemes ?? DEFAULT_SCHEMES;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: 'invalid_url' };
  }

  const scheme = parsed.protocol.replace(/:$/, '');
  if (!allowed.includes(scheme)) {
    return { safe: false, reason: 'blocked_scheme' };
  }

  // URL.hostname keeps brackets for IPv6 literals; strip them.
  const host = parsed.hostname.replace(/^\[/, '').replace(/\]$/, '');
  if (host === '' || isBlockedHost(host)) {
    return { safe: false, reason: 'blocked_host' };
  }

  return { safe: true };
}

/**
 * Like {@link checkUrlSafety}, but additionally resolves the hostname (when a
 * `resolve` hook is supplied) and rejects the URL if any resolved address is
 * private — closing the DNS-rebinding gap.
 */
export async function checkUrlSafetyAsync(
  url: string,
  options: SafeUrlAsyncOptions = {},
): Promise<UrlSafetyResult> {
  const structural = checkUrlSafety(url, options);
  if (!structural.safe || options.resolve === undefined) {
    return structural;
  }

  const host = new URL(url).hostname.replace(/^\[/, '').replace(/\]$/, '');
  if (isIP(host) !== 0 || normaliseIpv4(host) !== null) {
    return structural; // already an IP literal — nothing to resolve
  }

  const addresses = await options.resolve(host);
  if (addresses.some((ip) => isPrivateIp(ip))) {
    return { safe: false, reason: 'blocked_host' };
  }
  return { safe: true };
}

/** Throw `ValidationException` (→ 422) when `url` is not SSRF-safe. */
export function assertSafeUrl(url: string, options: SafeUrlOptions = {}, field = 'url'): void {
  const result = checkUrlSafety(url, options);
  if (!result.safe) {
    throw ValidationException.single(
      field,
      `${field} is not an allowed URL`,
      result.reason ?? 'invalid_url',
    );
  }
}
