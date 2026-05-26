# Field Trial 167 — Inbound Webhook Receiver

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Per-source HMAC-SHA256 signature validation (each source has its own secret stored in DB)
- `UNIQUE (source_id, event_id)` — idempotency is scoped per source (different sources can reuse event IDs)
- Secret never returned in API responses
- Call order: signature check → idempotency check → store → process

## Friction

`webhookSignatureMiddleware` handles single-source only. Multi-source requires loading the source record from the DB and calling `verifySignature` manually before the middleware approach. Documented the manual pattern.

## Version

No framework change. Docs-only (D0).
