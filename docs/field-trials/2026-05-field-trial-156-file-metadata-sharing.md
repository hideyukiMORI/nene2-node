# Field Trial 156 — File Metadata & Sharing

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Goal

Port NENE2 (PHP) FT156 to nene2-node. Document the three-tier file access control pattern: owner, edit-share, view-share. Includes the security diagnosis results adapted to the nene2-node pattern.

## Friction found

None. All primitives available:

- `authSubFromContext` replaces PHP `X-User-Id` header
- `assertResourceOwner` / `ResourceAccessDeniedError` for 403
- `classifyDatabaseError` for UNIQUE violation on duplicate share
- Existence-privacy (404 vs 403) follows the same pattern as FT149/FT151

## Patterns documented

### Three-tier access

```
Owner → all operations
Edit-share → GET + PUT (cannot change visibility)
View-share / public → GET only
```

Implemented as a single `resolveAccess(file, userId, shareRow)` function that returns `{ canRead, canWrite, isOwner }`.

### Visibility escalation prevention

Edit-shares can modify name/size/description but **not** `visibility`. The use case silently substitutes the current value for non-owners. No error is thrown — the update succeeds but the visibility field is unchanged. This is the same pattern as NENE2 PHP FT156.

### Existence-privacy

GET on an inaccessible file returns 404, not 403. This prevents ID-probing attacks: an attacker cannot distinguish "file does not exist" from "file exists but you cannot see it."

### Cascade delete

`file_shares` must be deleted before `files` due to FK constraints. Either do it manually in the use case or declare `ON DELETE CASCADE` on the FK.

## Security diagnosis (adapted from NENE2 FT156)

| ID     | Check                                          | Expected               |
| ------ | ---------------------------------------------- | ---------------------- |
| VULN-A | IDOR: access other user's private file         | 404                    |
| VULN-B | IDOR: delete other user's file                 | 404                    |
| VULN-C | IDOR: update other user's file                 | 404                    |
| VULN-D | Privilege escalation: view-share attempts edit | 403                    |
| VULN-E | Owner injection: `user_id` in body             | Ignored (JWT sub wins) |
| VULN-F | Share removal by non-owner                     | 404                    |
| VULN-J | Visibility escalation by edit-share            | Silently ignored       |
| VULN-K | Existence probing via 403 vs 404               | 404                    |

## Version

No framework change. Docs-only (D0). Backlog updated to ✅.
