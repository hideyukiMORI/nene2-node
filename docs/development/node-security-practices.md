# Node security practices (framework consumers)

Extends `security-policy.md` with Node-specific guidance validated in FT43–FT54.

## Cryptography

| Task             | Use                                                               |
| ---------------- | ----------------------------------------------------------------- |
| Secrets / tokens | `crypto.randomBytes`, `crypto.randomUUID`                         |
| API key compare  | `timingSafeEqual` (see `api-key-auth.ts`)                         |
| JWT (production) | IdP-backed verifier — `LocalBearerTokenVerifier` is dev/test only |

Never use `Math.random()` for security-sensitive values.

## HTTP client (`fetch`)

`FetchMcpHttpClient` accepts arbitrary `baseUrl` — **callers** must:

- Allowlist target hosts (no user-controlled URL passthrough).
- Use HTTPS in production.
- Avoid SSRF to metadata endpoints (`169.254.169.254`, `localhost` unless intended).

## Logging

- Do not log `Authorization`, `X-Api-Key`, or JWT bodies.
- Request logging middleware logs path/status/id only — see `observability.md`.

## Input hardening

- Reject unknown JSON fields at handler boundary when mass-assignment is a risk.
- `parsePaginationQuery` caps `limit` at 100 — mirror for new list endpoints.
- Avoid `Object.assign` from raw `req` JSON into domain entities.

## Prototype pollution

Do not merge unvalidated user objects into prototypes or global objects. Prefer readonly DTOs and explicit field mapping.

## Environment leaks

- Only `loadAppSettings()` reads `process.env` in `src/`.
- Tests inject env via `loadAppSettings({ ... })` — never commit `.env`.
- CI must not print secrets in logs (GitHub masks known secrets when configured).

## Throttle bypass

- Review `NENE2_NODE_THROTTLE_EXCLUDE_PATHS` — each entry skips rate limiting entirely.
- Prefer edge proxy limits for public deployments.

## Dependencies

Run `npm audit` before release; document accepted risks in PR when ignoring findings.

## References

- `security-policy.md`
- `integrations/mcp-boundary.md`
