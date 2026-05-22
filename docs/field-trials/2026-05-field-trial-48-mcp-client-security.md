# Field trial report — FT48: MCP FetchMcpHttpClient security

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** required

## Validated

- `FetchMcpHttpClient` auth headers; `hasAuthentication()`; mock fetch tests.
- No stdio MCP surface in package.

## Doc updates (docs-first)

- `integrations/mcp-boundary.md` — SSRF allowlist guidance.
- `node-security-practices.md` — fetch section.

## Security diagnosis (FT48 % 3 = 0)

| Area               | Result                                                        |
| ------------------ | ------------------------------------------------------------- |
| Credential storage | pass — constructor options, not logged in client              |
| Write without auth | pass — `hasAuthentication()` for gating                       |
| SSRF               | pass with notes — caller must validate `baseUrl` (documented) |

**Overall:** pass with notes.

## Adversarial review (FT48 % 4 = 0)

| Probe                                  | Outcome                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- |
| User-controlled baseUrl to internal IP | mitigated by documentation + caller allowlist — not auto-blocked in client |
| Missing auth on POST                   | operator must check `hasAuthentication()`                                  |

**Resilience:** acceptable for HTTP hook; not a full SSRF firewall.

## Follow-up

- Optional: host allowlist option on `FetchMcpHttpClientOptions` if demand appears.
