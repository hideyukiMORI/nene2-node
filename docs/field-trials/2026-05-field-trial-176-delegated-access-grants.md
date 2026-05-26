# Field Trial 176 — Delegated Access Grants

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- `CHECK (grantor_id != grantee_id)` at DB level prevents self-grants
- `UNIQUE (grantor_id, grantee_id, resource)` — one active grant per triple
- Computed status: `revoked_at IS NOT NULL → revoked`, `expires_at < now → expired`, else `active`
- IDOR-safe revoke: 404 for non-grantor (not 403)
- Access check: `WHERE revoked_at IS NULL AND expires_at > now`; increment `used_count`

## Security

VULN-01: Self-grant — DB CHECK constraint.  
VULN-02: Expired grant bypass — `expires_at > now` in every check query.  
VULN-03: IDOR via revoke — 404 for non-grantor.

## Version

No framework change. Docs-only (D0).
