# Field Trial 169 — Data Masking

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Mask-by-default: email (`a***@domain.com`), phone (last 4 digits), name (`J*** D***`)
- Admin unmask: requires `role === 'admin'` JWT claim + `?unmask=true` query param
- Every unmask recorded in `mask_audit_log` with accessor (JWT sub) + timestamp
- Audit log GET endpoint admin-only

## Security

VULN-01: Unauthenticated unmask — double-check role before returning real data.  
VULN-02: PII in error messages — masking functions never appear in error messages.  
VULN-03: Privilege escalation via query param — `?unmask=true` without admin role is ignored, not an error.

## Version

No framework change. Docs-only (D0).
