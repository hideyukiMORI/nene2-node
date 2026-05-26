# Field Trial 163 — Payment Webhook

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- HMAC-SHA256 signature verification via framework `webhookSignatureMiddleware` (or manual with `crypto.timingSafeEqual`)
- Idempotent processing: pre-check `webhook_events` by `event_id`; catch UNIQUE violation as second safety net for race conditions
- Status-machine guard: `VALID_TRANSITIONS` table; invalid transitions → 409
- Always return 200 to the provider (even for duplicates) to stop retry loops

## Friction found

`webhookSignatureMiddleware` is already in the framework — FT163 is purely documentation of the state-machine + idempotency patterns on top of it.

## Security notes

VULN-01: Signature forgery — `timingSafeEqual` prevents timing oracle.  
VULN-02: Replay — `UNIQUE event_id` in `webhook_events`.  
VULN-03: Invalid state transition — transition guard prevents `failed → succeeded` etc.
