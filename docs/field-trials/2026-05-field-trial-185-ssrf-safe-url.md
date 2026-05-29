# FT185 — SSRF-safe URL guard (`checkUrlSafety`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT337 (`shortlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔒
**Tier:** security helper — in-tree attack-matrix tests (executable proof)

## Objective

Accepting user-supplied URLs to fetch (shortener, webhook target, import) is an
SSRF vector. node had no guard. Add one and prove it against the FT337 matrix.

## Deliverable (🔒 framework)

`src/security/safe-url.ts`, exported from `src/index.ts`:

- `checkUrlSafety(url, { allowedSchemes? })` → `{ safe, reason? }` —
  `invalid_url` / `blocked_scheme` / `blocked_host`. Blocks non-http(s) schemes,
  `localhost`/`*.localhost`, and private/loopback/link-local IP literals.
- `checkUrlSafetyAsync(url, { resolve })` — optional DNS-rebinding protection.
- `isPrivateIp(ip)`, `normaliseIpv4(host)` — exported building blocks.
- `assertSafeUrl(url, options?, field?)` — throws `ValidationException` (→ 422).

## Attack matrix (executable proof — in-tree)

| Vector                | Sample                                          | Result             |
| --------------------- | ----------------------------------------------- | ------------------ |
| Public URL            | `https://8.8.8.8/`, `example.com`               | **safe** ✅        |
| Scheme                | `javascript:` / `file:` / `ftp:` / `data:`      | **blocked_scheme** |
| Loopback / localhost  | `127.0.0.1`, `localhost`, `*.localhost`         | **blocked_host**   |
| RFC 1918              | `10/8`, `192.168/16`, `172.16–31/12`            | **blocked_host**   |
| Link-local / metadata | `169.254.169.254`, `0.0.0.0`                    | **blocked_host**   |
| Obfuscated IPv4       | `2130706433`, `0x7f000001`                      | **blocked_host**   |
| IPv6 private          | `::1`, `fe80::1`, `fc00::1`, `::ffff:127.0.0.1` | **blocked_host**   |
| DNS rebinding         | host → `10.0.0.1` (via resolver)                | **blocked_host**   |

38 in-tree tests (`tests/security/safe-url.test.ts`). Public IPv4/IPv6 and the
`172.32+` boundary correctly pass.

## Design notes

- **Obfuscation-aware** — `normaliseIpv4` folds decimal/hex IPv4 to dotted form
  before range checks; IPv6 handles `::ffff:` mapped IPv4 in both dotted and the
  hex-normalised (`::ffff:7f00:1`) forms node's `URL` produces.
- **Structural by default, DNS opt-in** — resolution is environment-specific and
  racy, so it's an injectable hook; the docs note resolve-then-connect is defence
  in depth, not a sole control.
- **Scope-correct** — only the SSRF guard is new framework code. FT337's slug /
  mass-assignment / ISO-date / limit concerns reuse `validateTextField`,
  `applyMergePatch`, UTC helpers, and `parsePaginationQuery` (documented in the
  how-to), not re-implemented.
- **Self-bug caught in-loop** — the IPv6-mapped case initially passed because
  node normalises `::ffff:127.0.0.1` to `::ffff:7f00:1`; the in-tree test caught
  it and the hex-group path was added.

## Friction

None for the helper. Surfaced that node's `URL` hex-normalises IPv4-mapped IPv6
— handled.

## How-to

[docs/how-to/ssrf-safe-url.md](../how-to/ssrf-safe-url.md)
