# Milestone — Phase 2: Middleware and auth baseline

**Status:** Planned  
**Depends on:** Phase 1b

## Goal

Production-oriented HTTP pipeline matching NENE2 middleware order and auth patterns.

## Acceptance criteria

- [ ] Central `onError` + domain exception registry (map `DomainError` → Problem Details)
- [ ] `validation-failed` (422) with structured `errors[]`
- [ ] `BearerTokenMiddleware` + `LocalTokenVerifier` (timing-safe)
- [ ] `GET /examples/protected` with JWT claims in response
- [ ] `ThrottleMiddleware` — in-memory, 429 + Problem Details
- [ ] CORS from `AppSettings` (explicit origins)
- [ ] Structured logging (pino or node util) with request id
- [ ] Middleware order documented and tested
- [ ] Framework FT#1 report (optional) — middleware stack

## Reference

- NENE2: `src/Middleware/`, `src/Auth/`
- nene2-python: `nene2/middleware/`, `nene2/auth/`
