# Field Trial 157 — Full-Text Search & Autocomplete

**Date:** 2026-05-27  
**Status:** D0 (docs only — no framework change needed)

## Goal

Port NENE2 (PHP) FT157 to nene2-node. Document LIKE-based search with relevance scoring, prefix autocomplete, and FTS5 via Node built-in SQLite.

## Framework change resolution

The backlog listed a possible `SqliteFts5QueryExecutor` or howto-only option. Decision: **howto only**.

Node's built-in `node:sqlite` bundles a recent SQLite version that includes FTS5. `SqliteQueryExecutor.fetchAll/fetchOne` can execute `CREATE VIRTUAL TABLE ... USING fts5(...)` and `WHERE table MATCH ?` queries without any framework changes. Adding a dedicated `SqliteFts5QueryExecutor` would just be a thin wrapper over the same executor — not worth the API surface cost.

## Friction found

None for the LIKE-based pattern. For FTS5:

- Node built-in SQLite supports FTS5 natively ✅
- `SqliteQueryExecutor` handles any SQL including FTS5 DDL and MATCH queries ✅
- Invalid FTS5 queries throw a DB exception — must be caught by the handler (400, not 500)

## Patterns documented

### LIKE escaping

`escapeLike(value)` replaces `!`, `%`, `_` with `!!`, `!%`, `!_`. Using `!` as escape avoids double-escaping with backslash (which is special in both SQL and JavaScript strings).

### Relevance tiers

Three-tier CASE WHEN scoring: exact name match (0) → prefix match (1) → contains anywhere (2). Ordered `ASC` so most relevant appears first.

### Autocomplete = prefix only

`LIKE 'q%'` (prefix), not `LIKE '%q%'` (contains). Prefix LIKE is index-friendly; contains LIKE is a full scan. Autocomplete should show names that _start with_ the typed text.

### Query min-length

Minimum 2 characters validated before hitting the DB. Single-character searches return too many results and degrade performance.

### Limit clamping

Search: max 50. Autocomplete: max 10. Always server-side — the client should not be able to control result set size.

### FTS5 note

FTS5 virtual table + sync triggers work with `SqliteQueryExecutor` as-is. Prefer FTS5 for tables with 100K+ rows where LIKE full-scans become slow.

## Version

No framework change. Docs-only (D0). Backlog updated to ✅.
