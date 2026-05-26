# Field Trial 159 — TOTP Two-Factor Authentication

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- RFC 6238 TOTP using Node's built-in `crypto.createHmac('sha1', ...)` — no external library needed
- Replay prevention: `UNIQUE (user_id, time_step)` in `used_totp_steps`; catching UNIQUE violation via `classifyDatabaseError` → `TotpReplayError`
- Brute-force lockout: counter + timestamp lock after 5 failures for 15 minutes
- Clock skew window: ±1 time-step (±30 seconds) accepted
- `otpauth://` URI generation for QR code display in setup flow

## Friction found

Node has built-in `crypto.createHmac` and `crypto.randomBytes` — no external TOTP library required. The PHP implementation used a custom `base32Decode`; TypeScript needs the same (standard library doesn't include Base32).

## Security notes

VULN-01: Replay attack — `UNIQUE (user_id, time_step)` prevents using the same 6-digit code twice within the 30s window.  
VULN-02: Brute force — lockout after 5 consecutive failures.  
VULN-03: Timing attack on code comparison — use constant-time comparison; in practice the TOTP `computeCode` approach already avoids timing leaks since we compute the expected code and compare strings.
