# How-to: SSRF-safe URL validation

When the server fetches a user-supplied URL (URL shortener, webhook target,
"import from URL"), an attacker can point it at internal infrastructure
(`169.254.169.254`, `127.0.0.1`, RFC 1918). `checkUrlSafety` rejects those.

> Parity: PHP NENE2 FT337 (`shortlog`). node FT185.

## Usage

```ts
import { assertSafeUrl, checkUrlSafety } from '@hideyukimori/nene2-framework';

app.post('/links', async (c) => {
  const { original_url } = await c.req.json();
  assertSafeUrl(original_url, {}, 'original_url'); // throws ValidationException → 422 if unsafe
  // … safe to store / fetch
});

// or branch on the result
const { safe, reason } = checkUrlSafety(url); // reason: invalid_url | blocked_scheme | blocked_host
```

## What is blocked

| Category              | Examples                                                |
| --------------------- | ------------------------------------------------------- |
| Non-http(s) schemes   | `javascript:`, `file:`, `ftp:`, `data:`                 |
| Loopback / localhost  | `127.0.0.1`, `localhost`, `*.localhost`                 |
| RFC 1918 private      | `10.0.0.1`, `192.168.1.1`, `172.16–31.x.x`              |
| Link-local / metadata | `169.254.169.254` (cloud metadata), `0.0.0.0`           |
| Obfuscated IPv4       | `2130706433` (decimal), `0x7f000001` (hex) → 127.0.0.1  |
| IPv6 private          | `[::1]`, `[fe80::1]`, `[fc00::1]`, `[::ffff:127.0.0.1]` |

Public hosts/IPs (`https://example.com`, `https://8.8.8.8`,
`[2606:4700:4700::1111]`) pass.

## DNS rebinding

`checkUrlSafety` is **structural** — it does not resolve DNS, so a public
hostname that resolves to a private IP still passes. For that, use the async
variant with a resolver:

```ts
import { checkUrlSafetyAsync } from '@hideyukimori/nene2-framework';
import { lookup } from 'node:dns/promises';

const { safe } = await checkUrlSafetyAsync(url, {
  resolve: async (host) => (await lookup(host, { all: true })).map((a) => a.address),
});
```

> Even with resolution, full SSRF safety requires pinning the resolved IP for the
> actual connection (resolve-then-connect can race). Treat this as defence in
> depth, not a sole control.

## Custom schemes

```ts
checkUrlSafety('wss://example.com', { allowedSchemes: ['ws', 'wss'] }); // { safe: true }
```

## The rest of FT337 reuses existing helpers

| FT337 concern         | node helper                                             |
| --------------------- | ------------------------------------------------------- |
| Slug validation       | `validateTextField` (length) + an allowlist regex/check |
| Mass assignment       | `applyMergePatch` `allowed` / `immutable` (FT183)       |
| ISO 8601 `expires_at` | `parseUtcIsoTimestamp` / UTC timestamp helpers          |
| Limit parsing         | `parsePaginationQuery` (FT177, ReDoS-safe)              |

## What NOT to do

| Anti-pattern                          | Risk                                              |
| ------------------------------------- | ------------------------------------------------- |
| Allowlist by string prefix on the URL | `http://127.0.0.1@evil.com` and encoding bypasses |
| Block only dotted IPs                 | Decimal/hex/IPv6-mapped forms slip through        |
| Forget `169.254.169.254`              | Cloud metadata credential theft                   |
| Resolve but connect by hostname again | DNS rebinding between check and fetch             |
| Allow `file:`/`ftp:` schemes          | Local file read / protocol smuggling              |
