# Pagination Boundary Attack Prevention

Strict integer-only parsing for `limit` and `offset` query parameters, blocking float
injection, signed/padded strings, hex literals, integer overflow, and ReDoS probes.

## Problem

`Number.parseInt("10.5", 10)` silently returns `10` — accepting a float that should be
rejected. Similar surprises:

| Input         | `parseInt` result | Correct response |
| ------------- | ----------------- | ---------------- |
| `"10.5"`      | `10`              | 422 invalid_type |
| `"1e2"`       | `1`               | 422 invalid_type |
| `"+10"`       | `10`              | 422 invalid_type |
| `" 10"`       | `10`              | 422 invalid_type |
| `"0x10"`      | `0`               | 422 invalid_type |
| `"10abc"`     | `10`              | 422 invalid_type |
| `"1".×50+"x"` | `1`               | 422, < 10 ms     |

These silent coercions allow clients to bypass range checks (e.g., `limit=0.5` passes
`>= 1` with `parseInt`) and leak parsing behaviour.

## Solution: digit-only O(n) check

Replace `parseInt` with a character-code loop before any numeric conversion:

```ts
/**
 * O(n) digit-only check — no regex, immune to ReDoS.
 * Rejects floats, signed, padded, hex, scientific notation, and empty strings.
 */
function isDigitString(value: string): boolean {
  if (value.length === 0) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 48 || code > 57) return false; // '0'..'9'
  }
  return true;
}
```

No backtracking, no catastrophic paths — guaranteed linear time regardless of input.

## parsePaginationQuery (built-in helper)

```ts
import { parsePaginationQuery } from '@hideyukimori/nene2-framework';

const { limit, offset } = parsePaginationQuery(new URL(req.url).searchParams);
// limit:  1–100 (default 20)
// offset: 0+    (default 0)
```

Throws `ValidationException` (HTTP 422) with:

- `code: 'invalid_type'` — non-digit strings (float, hex, signed, padded, overflow)
- `code: 'out_of_range'` — digit strings outside allowed range

Multiple errors are collected into one exception (e.g., both `limit` and `offset` bad).

## Custom defaults

```ts
const { limit, offset } = parsePaginationQuery(searchParams, {
  defaultLimit: 10, // default when absent (default: 20)
  maxLimit: 50, // upper bound (default: 100)
});
```

## Overflow guard

Strings longer than 18 characters are rejected before parsing — all safe JavaScript
integers have ≤ 16 significant digits; 18 provides headroom without risking
`Number.MAX_SAFE_INTEGER` overflow.

```ts
if (value.length > 18 || !isDigitString(value)) {
  return { ok: false }; // → invalid_type
}
```

## Attack vectors covered

| VULN | Input example               | Result            |
| ---- | --------------------------- | ----------------- |
| C    | `limit=10.5`, `limit=1e2`   | 422 invalid_type  |
| D    | `limit=%2B10`, `limit= 10`  | 422 invalid_type  |
| E    | `limit=9999999999999999999` | 422 invalid_type  |
| F    | `limit=abc`, `limit=0x10`   | 422 invalid_type  |
| J    | `offset=999999`             | 200 (passthrough) |
| L    | `"1"×50 + "x"`              | 422, < 10 ms      |

VULN-J: large but valid offsets are allowed through — the DB returns an empty page, which
is the correct response.

## Error field names

The `ValidationException` always uses `"limit"` or `"offset"` as the field name:

```json
{
  "errors": [
    { "field": "limit", "message": "limit must be a non-negative integer.", "code": "invalid_type" }
  ]
}
```

## parseCursorQuery

`parseCursorQuery` uses the same `isDigitString` guard for `limit` (strict: throws on
invalid) and applies it to `cursor` with a silent fallback — an invalid cursor degrades
to first page rather than 422, matching NENE2 PHP `ctype_digit` behaviour.

```ts
import { parseCursorQuery } from '@hideyukimori/nene2-framework';

const { cursor, limit } = parseCursorQuery(new URL(req.url).searchParams);
// cursor: number | undefined  (undefined = first page)
// limit:  1–100 (default 10)
```

## Framework features used

| Feature                  | Import                                   |
| ------------------------ | ---------------------------------------- |
| Offset pagination helper | `parsePaginationQuery`                   |
| Cursor pagination helper | `parseCursorQuery`                       |
| Validation errors        | `ValidationException`, `ValidationError` |
