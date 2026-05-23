# Security Policy

Security is a design requirement, not a late audit. Inherited from nene2-python `CLAUDE.md` §3 and NENE2 middleware/auth docs.

## Absolute prohibitions

Never merge code that:

| Pattern                                                                                                         | Reason                                  |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `eval()`, `new Function()` on untrusted input                                                                   | Remote code execution                   |
| `child_process` with `shell: true` on untrusted input                                                           | Command injection                       |
| Deserializing untrusted blobs (`node-serialize`, unsafe `JSON.parse` on huge untrusted payloads without limits) | RCE / DoS                               |
| `Math.random()` for tokens or secrets                                                                           | Use `crypto.randomBytes` / `randomUUID` |
| SQL built with string concatenation from user input                                                             | Use parameterized queries only          |
| Logging passwords, API keys, Bearer tokens, or full request bodies with secrets                                 | Data leak                               |
| `fs.readFile` / path join on user-controlled paths without normalization                                        | Path traversal                          |
| CORS `origin: '*'` with credentials                                                                             | Misconfiguration                        |
| Trusting client-sent `X-User-Id` or role headers without verification                                           | Spoofing                                |

## Required practices

| Area                  | Rule                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| **HTTP input**        | Validate at boundary (schema); treat body/query as untrusted                     |
| **Secrets in config** | Typed settings; redact in logs; never commit `.env`                              |
| **SQL**               | Parameterized queries only via executor abstraction                              |
| **Paths**             | `path.resolve` + root check for any user-influenced file access                  |
| **Crypto**            | Node `crypto` module; timing-safe compare (`timingSafeEqual`) for secrets        |
| **Errors**            | Problem Details only — no stack/SQL/paths in JSON (see `api-error-responses.md`) |
| **Dependencies**      | `npm audit` — no unmitigated critical/high on runtime deps                       |
| **Auth**              | Fail closed; 401/403 via Problem Details types from OpenAPI                      |

## Auth and machine clients

- Follow NENE2 env var names for machine clients where applicable (`NENE2_MACHINE_API_KEY`, JWT secrets).
- Never log verification failures with the presented secret.

## MCP HTTP client

- `FetchMcpHttpClient` for HTTP-aligned MCP calls — no stdio duplicate of nene-mcp (`mcp-boundary.md`).
- Write tools require explicit auth guard (parity with NENE2 MCP policy).

## Review

Use `docs/review/middleware-security.md` and `docs/review/backend-api.md` before API-facing PRs.

## Node-specific guide

See `node-security-practices.md` (timing-safe compare, `fetch` SSRF, logging redaction).

## References

- nene2-python: `../nene2-python/CLAUDE.md` §3
- NENE2 auth: `../NENE2/docs/development/authentication-boundary.md`
