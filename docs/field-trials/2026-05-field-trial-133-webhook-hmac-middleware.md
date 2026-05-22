# Field trial report — FT133: Webhook HMAC middleware (D4)

**Date:** 2026-05-22 | **Issue:** [#77](https://github.com/hideyukiMORI/nene2-node/issues/77) | **Sandbox:** `../nene2-node-FT/ft133-webhook-hmac/`

## Validated

- `webhookSignatureMiddleware` + `computeWebhookSignature` (sha256, timing-safe)
- Missing/invalid sig → **401**

## Friction

### F-1: No signature helper (FT125) — **resolved**

**Resolution:** Middleware + doc (**v0.1.11**).

### F-2: Raw body must be verified before JSON parse (severity: medium) — **documented**

Middleware clones body; routes that call `c.req.json()` first bypass protection — register middleware early.

## Probes

| Probe                          | Result                    |
| ------------------------------ | ------------------------- |
| `ft133-webhook-hmac/probe.mjs` | bad sig 401, good sig 200 |
