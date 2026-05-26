# FT177 — Pagination Boundary Attack

**Date:** 2026-05-27
**Version:** v0.1.25
**Status:** ✅ Complete

## Objective

Harden `parsePaginationQuery` (and audit `parseCursorQuery`) against the attack vectors
identified in NENE2 FT177: float injection, signed/padded inputs, integer overflow, hex
literals, SQL injection strings, and ReDoS probes.

## Background

`Number.parseInt("10.5", 10)` silently returns `10`, allowing `limit=10.5` to pass range
checks that require `limit >= 1`. Similarly, `parseInt` accepts leading `+` signs, spaces,
`0x` prefixes, and runs fine on arbitrarily long strings — all potential attack surfaces
for query-parameter manipulation.

NENE2 PHP used `ctype_digit()` to block these cases. The Node.js equivalent is an O(n)
character code loop that rejects anything that isn't a pure ASCII digit string.

## Changes

### `src/http/pagination-query.ts` 🔧

Replaced direct `Number.parseInt` with a two-stage approach:

1. **`isDigitString(value)`** — O(n) char-code loop (chars `48–57` only). No regex —
   immune to ReDoS. Rejects: floats, scientific notation, signed (`+`/`-`), padded
   (space), hex (`0x`), empty strings.

2. **`parseIntQuery(value, fallback)`** — returns `{ ok: true; value: N } | { ok: false }`.
   Rejects strings longer than 18 characters (overflow guard) before `isDigitString`.

Error codes:

- `invalid_type` — non-digit string (float, hex, …)
- `out_of_range` — digit string outside `[1, maxLimit]` for limit, `[0, ∞)` for offset

Multiple errors are collected before throwing — both `limit` and `offset` can appear in
one `ValidationException`.

### `src/http/cursor-query.ts` 🔧

Applied the same `isDigitString` + length guard to `limit` parsing. Cursor was already
using a string round-trip equality check; replaced with `isDigitString` + length guard
for consistency. Cursor invalid → `undefined` (first page, silent); limit invalid → 422.

### `tests/http/pagination-query.test.ts` ✅ (new)

37 tests across 8 describe blocks:

| Block                   | Coverage                                    |
| ----------------------- | ------------------------------------------- |
| defaults                | limit=20/offset=0, overrides                |
| out-of-range regression | limit=0, limit=101, custom max              |
| VULN-C float injection  | 10.5, 1e2, 1.0, offset=5.5                  |
| VULN-D signed/padded    | +10, " 10", +5                              |
| VULN-E overflow         | 19-digit, 20-digit, 18-digit (range-caught) |
| VULN-F non-numeric/SQL  | abc, `1;DROP TABLE`, 0x10, offset=abc       |
| VULN-J large valid page | offset=999999 → 200                         |
| VULN-L ReDoS            | 50 digits+"x" < 10ms, 100 zeros < 10ms      |
| error field names       | "limit", "offset", both in one exception    |

## Test results

```
Test Files  64 passed (64)
      Tests  265 passed (265)
   Duration  1.90s
```

## Attack vectors

| VULN | Input           | Before       | After                               |
| ---- | --------------- | ------------ | ----------------------------------- |
| C    | `limit=10.5`    | silently 10  | 422 invalid_type                    |
| C    | `limit=1e2`     | silently 1   | 422 invalid_type                    |
| D    | `limit=+10`     | silently 10  | 422 invalid_type                    |
| D    | `limit= 10`     | silently 10  | 422 invalid_type                    |
| E    | 19-digit string | overflow/NaN | 422 invalid_type                    |
| F    | `limit=abc`     | NaN → error  | 422 invalid_type (consistent field) |
| F    | `limit=0x10`    | silently 0   | 422 invalid_type                    |
| J    | `offset=999999` | passthrough  | passthrough ✅                      |
| L    | `"1"×50 + "x"`  | regex risk   | < 10 ms, 422                        |

## Docs

- `docs/how-to/pagination-boundary-attack.md` — attack vectors, code patterns, field names

## NENE2 parity

NENE2 FT177 used `ctype_digit()` on PHP side. This implementation provides equivalent
strictness via an O(n) char-code loop, achieving the same API surface without regex.

The FT149-177 campaign is now **complete** — all 29 field trials from NENE2 v1.5.111
have been implemented in nene2-node at v0.1.25.
