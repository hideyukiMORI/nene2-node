# Scope — nene2-node

This document defines what **nene2-node** owns, what it delegates to sibling repositories, and what application projects must own themselves.

## Mission

Implement the NENE2 API-first framework on Node.js with clean architecture and OpenAPI compatibility, without replacing the PHP canonical runtime or duplicating the TypeScript **client** repository.

The **contract source of truth** remains **NENE2** `docs/openapi/openapi.yaml`. This repository tracks compatibility through tests and releases on its own semver schedule once packages are published.

**Parity benchmark:** [nene2-python](https://github.com/hideyukiMORI/nene2-python) — align behavior and module boundaries where practical, adapted to Node idioms (see ADR 0002).

## In scope

| Area                  | Examples                                                                             |
| --------------------- | ------------------------------------------------------------------------------------ |
| **HTTP runtime**      | Router, middleware pipeline, JSON request/response helpers                           |
| **Error model**       | RFC 9457 Problem Details, validation-failed mapping, domain exception handlers       |
| **Auth**              | Bearer JWT verification, API key middleware, composite auth patterns                 |
| **Configuration**     | Typed settings from environment (Node-native, no raw `process.env` in domain code)   |
| **Database adapters** | Executor/transaction interfaces; SQLite for tests; optional MySQL/Postgres later     |
| **Examples**          | Health, ping, Note/Tag-style reference domains (not stability-guaranteed public API) |
| **MCP integration**   | HTTP-aligned MCP client/server hooks compatible with NENE2 catalog format            |
| **Documentation**     | English Diátaxis-style guides, ADRs, roadmap, AI agent entry                         |
| **npm package**       | `@hideyukimori/nene2-framework` (private until first publish)                        |

## Out of scope

| Area                                      | Owner instead                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| PHP HTTP runtime, OpenAPI **authoring**   | [NENE2](https://github.com/hideyukiMORI/NENE2)                                                 |
| Typed fetch client for consumers          | [nene2-js](https://github.com/hideyukiMORI/nene2-js) (`@hideyukimori/nene2-client`)            |
| stdio MCP server (PHP)                    | [nene-mcp](https://github.com/hideyukiMORI/nene-mcp)                                           |
| React/Vite SPA starter                    | NENE2 `frontend/` or consumer apps                                                             |
| Production deployment playbooks for PHP   | NENE2 docs                                                                                     |
| Application-specific domain logic         | Consumer repos / [NENE2-FT](https://github.com/hideyukiMORI) PHP sandboxes                     |
| High-volume PHP howto FT loop (100+ apps) | NENE2 — learn via docs; optional Node FT in nene2-node after Phase 1 (see field-trial-culture) |

## Boundary rules

1. **No PHP embedding** — do not bundle or proxy the PHP runtime as the Node server core.
2. **OpenAPI wins** — if implementation disagrees with NENE2 OpenAPI, fix Node behavior or coordinate an NENE2 contract change; do not invent parallel public API shapes.
3. **Secrets stay in env** — never commit tokens, `.env`, or consumer credentials.
4. **Small PRs** — one Issue, one focused change.
5. **Client stays in nene2-js** — HTTP consumers import `@hideyukimori/nene2-client`, not duplicated fetch layers here.

## Relationship diagram

```text
  [NENE2 PHP]  --authors-->  OpenAPI (yaml)
         ^                         |
         | parity reference        v
  [nene2-python]              contract tests
         ^
         | patterns
         v
  [nene2-node]  --serves-->  JSON APIs (Node)
         ^
         | HTTP (optional)
  [nene2-js client]  <-- consumer apps
```

## Versioning (planned)

- `0.x` while public framework API is forming.
- Align **major** bumps with breaking framework surface or incompatible OpenAPI tracking changes; document NENE2 tag mapping in CHANGELOG.
- Pin OpenAPI input revision when contract tests land (ADR follow-up).

## When to open an Issue here vs NENE2

| Change                                                        | Repository                        |
| ------------------------------------------------------------- | --------------------------------- |
| New public JSON endpoint or Problem Details type URI          | NENE2 first, then nene2-node sync |
| Node runtime/middleware matching existing documented endpoint | nene2-node                        |
| MCP tool catalog or PHP middleware                            | NENE2 or nene-mcp                 |
| Typed client for existing documented endpoint                 | nene2-js                          |
| ESLint/Prettier/tsconfig for Node framework only              | nene2-node                        |
