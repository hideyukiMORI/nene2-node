# Field Trial 162 — Content Versioning

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Append-only versioning: `article_versions` rows are never updated/deleted
- `current_version` counter in parent `articles` table; `UNIQUE (article_id, version)` prevents gaps
- Rollback = new version with old content: auditable, not a destructive undo
- `runTransaction` wraps the UPDATE + INSERT to keep parent and history in sync

## Friction found

None. The `runTransaction` helper handles the atomic parent-update + version-append pattern cleanly.
