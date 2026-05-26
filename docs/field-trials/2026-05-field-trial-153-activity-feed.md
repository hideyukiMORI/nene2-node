# Field Trial 153 — Activity Feed + Cursor Pagination

**Date:** 2026-05-27  
**Branch:** ft/153-cursor-pagination  
**Status:** D1 (framework change + docs)

## Goal

Port NENE2 (PHP) FT153 to nene2-node. Implement a cursor-based pagination helper (`parseCursorQuery`) as a framework export, and document the activity feed pattern.

## Friction found

`parsePaginationQuery` existed for offset-based pagination but there was no cursor-based equivalent. Cursor pagination is the correct choice for feed-style endpoints where rows are inserted while users browse (offset pagination causes drift: rows shift, producing duplicates or gaps between pages).

## What was built

### Framework: `src/http/cursor-query.ts` (new)

Exports `parseCursorQuery(searchParams, defaults?)` and `CursorQuery` interface.

Key design decisions vs `parsePaginationQuery`:

|                           | `parsePaginationQuery`       | `parseCursorQuery`                       |
| ------------------------- | ---------------------------- | ---------------------------------------- |
| Invalid `offset`/`cursor` | Throws `ValidationException` | Silently → `undefined` (first page)      |
| Default limit             | 20                           | 10                                       |
| Extra param               | `offset` (integer ≥ 0)       | `cursor` (positive integer or undefined) |

The silent-fallback for invalid cursors matches NENE2 PHP's `ctype_digit` check: any non-digit, zero, or negative value is treated as "start from the beginning". This is the right behavior because:

- Clients send `?cursor=<next_cursor>` from the previous response
- `next_cursor: null` means no next page — clients should omit the param, not send `cursor=null`
- A corrupt or expired cursor should not be a 400 error; it should return the first page

### Tests: `tests/http/cursor-query.test.ts`

22 tests covering:

- Missing / empty / valid cursor values
- Edge cases: 0, negative, float, mixed string (`"12abc"`)
- Limit default, min, max, out-of-range (throws)
- `ValidationException` includes `field: "limit"`
- Default overrides (`defaultLimit`, `maxLimit`)
- Combined cursor + limit parsing

### Docs

- `docs/how-to/cursor-pagination.md` — helper reference, `LIMIT N+1` trick, response shape
- `docs/how-to/activity-feed.md` — complete endpoint + repository pattern with self-or-admin auth

## SQL pattern

```sql
-- Page 2+ (cursor supplied)
SELECT * FROM feed_events
WHERE user_id = ? AND id < ?
ORDER BY id DESC
LIMIT ?;   -- limit + 1 to detect hasMore

-- Page 1 (no cursor)
SELECT * FROM feed_events
WHERE user_id = ?
ORDER BY id DESC
LIMIT ?;
```

Index required: `(user_id, id DESC)` — without it the query is a full table scan.

## Security notes

- Feed is self-or-admin only. The `userId` path param is validated against JWT sub; admin role bypasses ownership.
- Feed events are typically written by a trusted service layer (admin JWT), not directly by end users.

## Version

v0.1.24 — `parseCursorQuery` and `CursorQuery` added to public API.
