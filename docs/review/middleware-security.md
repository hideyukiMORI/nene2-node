# Middleware and Security Self-Review

Use for middleware, auth wiring, headers, CORS, rate limits, and request limits.

**Policies:** `middleware-security.md`, `security-policy.md`, `api-error-responses.md`

## Checklist

- [ ] Middleware order matches documented pipeline (`middleware-security.md`).
- [ ] Error middleware wraps the pipeline and returns Problem Details.
- [ ] `X-Request-Id` is set on responses when middleware is present.
- [ ] Security headers applied consistently to API responses.
- [ ] CORS origins are explicit; no wildcard with credentials.
- [ ] Request body size limit enforced before handlers.
- [ ] Auth failures return documented Problem Details types (401/403).
- [ ] Secrets and tokens are not logged.
- [ ] Timing-safe comparison used for API keys/secrets where applicable.
- [ ] `npm run check` passed.
- [ ] PR mentions this checklist when security-facing.
