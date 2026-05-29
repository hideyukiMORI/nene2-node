# FT178 — ETag & Conditional Requests

**Date:** 2026-05-29
**Version:** v0.1.26 (target)
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT307 (`etaglog`) — first FT of the FT178+ phase
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔧new

## Objective

Close the HTTP-behaviour parity gap for **content-hash ETags + conditional
requests**. node already had `parseIfMatchVersion` for numeric optimistic-locking
versions, but no support for conditional GET (`304`) or content-ETag precondition
writes (`412`/`428`).

## Deliverable (🔧 framework)

New `src/http/conditional-request.ts`, exported from `src/index.ts`:

| Export                 | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `computeETag(content)` | Strong, double-quoted ETag (`sha256`, RFC 9110).                    |
| `checkNotModified`     | `304` when `If-None-Match` matches or `If-Modified-Since >= L-M`.   |
| `checkPreconditions`   | `428` (absent+required) / `412` (stale) Problem Details, else null. |

## Behaviour contract

| Header                                | Method | Result                       |
| ------------------------------------- | ------ | ---------------------------- |
| `If-None-Match` matches               | GET    | `304` (no body, echoes ETag) |
| `If-None-Match` present, non-matching | GET    | `200` (IMS not consulted)    |
| `If-None-Match: *`                    | GET    | `304`                        |
| `If-Modified-Since >= Last-Modified`  | GET    | `304`                        |
| `If-Match` matches                    | write  | proceed                      |
| `If-Match` absent (required)          | write  | `428 Precondition Required`  |
| `If-Match` absent (`require: false`)  | write  | proceed                      |
| `If-Match` stale                      | write  | `412 Precondition Failed`    |
| `If-Match: *`                         | write  | proceed (caller 404-guards)  |

## Design notes

- **`If-None-Match` precedence:** when present, `If-Modified-Since` is ignored
  (RFC 9110), so a non-matching `If-None-Match` forces a full `200`.
- **`If-Modified-Since` is a string compare**, not a parsed date — callers must
  use lexicographically-sortable ISO 8601 UTC (`utcNowIso()`), documented in the
  how-to. The RFC 1123 `GMT` format sorts wrong.
- **Weak comparison:** a `W/` prefix is stripped before comparison so weak/strong
  forms of the same tag match. Comma-separated lists and `*` are supported.
- **`sha256` over PHP's `md5`:** ETags are opaque; cross-impl value parity is not
  required, and `sha256` avoids weak-hash lint/security noise.
- **No new Problem Details registry needed** — `precondition-required` (428) and
  `precondition-failed` (412) flow through the existing `ProblemDetailsFactory`.

## Verification

`npm run check` green. 19 tests added (`tests/http/conditional-request.test.ts`):
3 `computeETag`, 5 `If-None-Match`, 5 `If-Modified-Since`/precedence, 6
`If-Match` write preconditions.

## How-to

[docs/how-to/etag-conditional-requests.md](../how-to/etag-conditional-requests.md)
