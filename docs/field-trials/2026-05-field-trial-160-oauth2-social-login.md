# Field Trial 160 — OAuth2 Social Login

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Authorization Code Flow: start → provider → callback → session
- CSRF prevention: random `state` stored in DB; `used_at IS NULL` check prevents reuse
- Authorization code replay: `UNIQUE code` in `used_oauth_codes`; catching UNIQUE violation → 400
- Provider ID token verification with `jose` (`jwtVerify` + `createRemoteJWKSet`)
- Upsert user on `UNIQUE (provider, subject)`
- Session stored as opaque token in DB (not JWT); revocation via `revoked_at`

## Friction found

The nene2-framework already exports `createJoseJwtVerifier` and `TokenVerifier`. For OAuth2 ID token verification, `jwtVerify` + `createRemoteJWKSet` from `jose` is used directly (same library). No additional framework wrapper needed.

## Security notes

VULN-01: CSRF — state parameter validated before code exchange.  
VULN-02: Code replay — `used_oauth_codes` UNIQUE constraint.  
VULN-03: State expiry — 10-minute TTL prevents stale state reuse.  
VULN-04: Provider subject injection — never trust `user_id` from callback body; only ID token `sub`.
