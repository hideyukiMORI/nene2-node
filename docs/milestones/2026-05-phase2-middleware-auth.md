# Milestone — Phase 2: Middleware and auth baseline

**Status:** Complete (2026-05-22) — [#15](https://github.com/hideyukiMORI/nene2-node/issues/15)  
**Depends on:** Phase 1b

## Goal

Production-oriented HTTP pipeline matching NENE2 middleware order and auth patterns.

## Acceptance criteria

- [x] Central `onError` + domain exception registry (map `DomainError` → Problem Details)
- [x] `validation-failed` (422) with structured `errors[]`
- [x] `BearerTokenMiddleware` + `LocalBearerTokenVerifier` (HS256, timing-safe signature)
- [x] `GET /examples/protected` with JWT claims in response
- [x] `ThrottleMiddleware` — in-memory, 429 + Problem Details
- [x] CORS from `AppSettings` (explicit origins)
- [x] Structured logging (JSON lines via `console.info`) with request id
- [x] Middleware order documented and tested (`docs/development/middleware-pipeline.md`)
- [ ] Framework FT#1 report (optional) — middleware stack

## Reference

- NENE2: `src/Middleware/`, `src/Auth/`
- nene2-python: `nene2/middleware/`, `nene2/auth/`
