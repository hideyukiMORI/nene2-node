import { describe, expect, it } from 'vitest';

import {
  assertSafeUrl,
  checkUrlSafety,
  checkUrlSafetyAsync,
  isPrivateIp,
  normaliseIpv4,
} from '../../src/security/safe-url.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

const safe = (url: string) => checkUrlSafety(url).safe;
const reason = (url: string) => checkUrlSafety(url).reason;

describe('checkUrlSafety — allowed', () => {
  for (const url of [
    'https://example.com/path',
    'http://example.com',
    'https://8.8.8.8/',
    'https://public.example.com/page?q=1',
  ]) {
    it(`allows ${url}`, () => expect(safe(url)).toBe(true));
  }
});

describe('checkUrlSafety — blocked schemes', () => {
  for (const url of [
    'javascript:alert(1)',
    'file:///etc/passwd',
    'ftp://example.com/',
    'data:text/html,x',
  ]) {
    it(`blocks ${url}`, () => {
      expect(safe(url)).toBe(false);
      expect(reason(url)).toBe('blocked_scheme');
    });
  }
});

describe('checkUrlSafety — blocked hosts (SSRF)', () => {
  for (const url of [
    'http://127.0.0.1/admin',
    'http://localhost/secret',
    'http://internal.localhost/',
    'http://10.0.0.1/metadata',
    'http://192.168.1.1/router',
    'http://172.16.0.1/internal',
    'http://172.31.255.1/',
    'http://169.254.169.254/latest/meta-data/', // cloud metadata
    'http://0.0.0.0/',
  ]) {
    it(`blocks ${url}`, () => {
      expect(safe(url)).toBe(false);
      expect(reason(url)).toBe('blocked_host');
    });
  }

  it('allows a public host in the 172.32+ range (not RFC1918)', () => {
    expect(safe('http://172.32.0.1/')).toBe(true);
  });
});

describe('checkUrlSafety — obfuscated IPv4', () => {
  it('blocks decimal-encoded loopback (2130706433 = 127.0.0.1)', () => {
    expect(safe('http://2130706433/')).toBe(false);
  });
  it('blocks hex-encoded loopback (0x7f000001)', () => {
    expect(safe('http://0x7f000001/')).toBe(false);
  });
  it('normaliseIpv4 maps notations to dotted form', () => {
    expect(normaliseIpv4('2130706433')).toBe('127.0.0.1');
    expect(normaliseIpv4('0x7f000001')).toBe('127.0.0.1');
    expect(normaliseIpv4('8.8.8.8')).toBe('8.8.8.8');
    expect(normaliseIpv4('example.com')).toBeNull();
  });
});

describe('checkUrlSafety — IPv6', () => {
  for (const url of [
    'http://[::1]/',
    'http://[fe80::1]/',
    'http://[fc00::1]/',
    'http://[::ffff:127.0.0.1]/',
  ]) {
    it(`blocks ${url}`, () => expect(safe(url)).toBe(false));
  }
  it('allows a public IPv6 literal', () => {
    expect(safe('http://[2606:4700:4700::1111]/')).toBe(true);
  });
});

describe('checkUrlSafety — invalid', () => {
  for (const url of ['not a url', '', 'http://', '://missing-scheme']) {
    it(`rejects ${JSON.stringify(url)}`, () => expect(safe(url)).toBe(false));
  }
});

describe('isPrivateIp', () => {
  it('classifies IPv4', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.1.2.3')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
  });
  it('classifies IPv6', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fe80::1')).toBe(true);
    expect(isPrivateIp('2606:4700:4700::1111')).toBe(false);
  });
});

describe('checkUrlSafetyAsync — DNS rebinding', () => {
  it('blocks a public host that resolves to a private IP', async () => {
    const result = await checkUrlSafetyAsync('http://private.internal/data', {
      resolve: () => Promise.resolve(['10.0.0.1']),
    });
    expect(result).toEqual({ safe: false, reason: 'blocked_host' });
  });

  it('allows a public host that resolves to a public IP', async () => {
    const result = await checkUrlSafetyAsync('https://public.example.com/page', {
      resolve: () => Promise.resolve(['93.184.216.34']),
    });
    expect(result.safe).toBe(true);
  });

  it('does not resolve IP literals (structural result stands)', async () => {
    let called = false;
    const result = await checkUrlSafetyAsync('http://127.0.0.1/', {
      resolve: () => {
        called = true;
        return Promise.resolve(['8.8.8.8']);
      },
    });
    expect(result.safe).toBe(false);
    expect(called).toBe(false);
  });
});

describe('assertSafeUrl', () => {
  it('throws ValidationException for an unsafe URL', () => {
    expect(() => assertSafeUrl('http://169.254.169.254/')).toThrow(ValidationException);
  });
  it('passes a safe URL', () => {
    expect(() => assertSafeUrl('https://example.com/')).not.toThrow();
  });
  it('respects a custom scheme allowlist', () => {
    expect(checkUrlSafety('ws://example.com', { allowedSchemes: ['ws', 'wss'] }).safe).toBe(true);
  });
});
