# Middleware and Security Baseline Policy

HTTP cross-cutting behavior is explicit middleware with documented order. Adapted from NENE2 `docs/development/middleware-security.md`.

## Default pipeline order

Document and preserve this order in the composition root (Phase 2):

```text
1. Error handling (outermost — converts failures to Problem Details)
2. Request id
3. Security headers
4. CORS
5. Request size limit
6. Authentication / authorization
7. Routing / handler dispatch
```

Route-specific body validation stays in **handlers**, not global middleware (see `request-validation.md`).

## Request ID

- Header: `X-Request-Id`
- Accept safe incoming value when configured; generate UUID v4 when missing.
- Attach to response and structured logs (Phase 2).

## Security headers (baseline)

At minimum:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN` (document choice in ADR)
- `Referrer-Policy: no-referrer` or `strict-origin-when-cross-origin`
- Conservative `Content-Security-Policy` for JSON APIs (often minimal)

## CORS

- Allowed origins from typed config — **no** `*` in production.
- Development origins must still be explicit lists in config (parity with nene2-python).
- `NENE2_NODE_CORS_ALLOW_CREDENTIALS=true` only with explicit origins (never `*`); browsers reject credential responses with wildcard origins.

## Request size

- Default body limit **1 MiB** unless OpenAPI documents otherwise.
- Reject oversized bodies with Problem Details before handler runs.

## Authentication extension points

- **Bearer JWT** — `bearerTokenMiddleware` with `includePaths: ['/examples/protected']` by default. Options also support `excludePaths` when `includePaths` is empty. Requires `NENE2_LOCAL_JWT_SECRET`. Verifier: `LocalBearerTokenVerifier` (HS256).
- **API key** — `apiKeyAuthMiddleware` on `/machine/health`. Requires `NENE2_MACHINE_API_KEY` header `X-Api-Key`.
- Composite auth: public vs Bearer vs API key routes — document per example app.

Example routes (`/examples/notes`, `/examples/tags`) are **public** in v0.1.x; protect at the gateway or add Bearer in your fork following the protected route pattern.

## Rate limiting

- In-memory store acceptable for dev/tests.
- Document that production should use Redis or edge proxy (parity with NENE2 throttle docs).

## References

- NENE2: `../NENE2/docs/development/middleware-security.md`
- Security prohibitions: `security-policy.md`
- Self-review: `../review/middleware-security.md`
