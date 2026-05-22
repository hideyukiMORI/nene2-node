# ADR 0001 — Repository Scope and Sibling Repositories

**Status:** Accepted  
**Date:** 2026-05-22  
**Issue:** (bootstrap)

---

## Context

NENE2 is the canonical PHP API-first framework with OpenAPI, MCP catalog, and reference domains. TypeScript consumers need a **thin client** ([nene2-js](https://github.com/hideyukiMORI/nene2-js)). Teams that want Node-only backends need a **framework port** comparable to [nene2-python](https://github.com/hideyukiMORI/nene2-python).

Earlier planning considered a single `nene2-js` repository for all TypeScript work. That would force client-only users to wade through framework documentation and implementation noise. A **two-repository** split keeps each audience focused.

Naming candidates for the Node port: `nene2-node`, `nene2-ts`, `nene2-server`. In a two-repo world, `nene2-node` correctly signals “Node.js runtime port” and pairs with `nene2-python`.

## Decision

1. Create sibling repository **`nene2-node`** next to `NENE2` and `nene2-js`.
2. Primary npm package: **`@hideyukimori/nene2-framework`** (private until first publish).
3. **In scope:** HTTP runtime, middleware, auth, Problem Details, example domains, OpenAPI compatibility tests, English docs.
4. **Out of scope:** PHP runtime, OpenAPI authoring, typed HTTP client (`nene2-js`), nene-mcp stdio duplicate, consumer business logic.
5. OpenAPI contract **source of truth** remains NENE2 `docs/openapi/openapi.yaml`.
6. **Parity reference:** nene2-python module layout and behavior where practical.
7. User-facing documentation in **English** for international contributors.
8. Collaboration model: GitHub Issues, Conventional Commits (English subject/description), no direct commits to `main`.

## Consequences

### Positive

- Clear separation from `nene2-js` client users
- Symmetric story: `nene2-python` (Python), `nene2-node` (Node), `NENE2` (PHP)
- Independent semver for framework consumers
- Documentation volume can grow without polluting the client repo

### Negative / trade-offs

- Three repositories to coordinate for new endpoints (NENE2 → nene2-node + nene2-js)
- Risk of drift — mitigated by pinned OpenAPI revision and contract tests
- Higher total maintenance than a single TypeScript monorepo

## Alternatives considered

| Alternative                | Rejected because                                 |
| -------------------------- | ------------------------------------------------ |
| Single `nene2-js` monorepo | Client users inherit framework doc noise         |
| `nene2-ts` repo name       | Ambiguous; both repos use TypeScript             |
| `nene2-server`             | Less aligned with `nene2-python` naming pattern  |
| Full port inside NENE2     | Couples PHP release cycle to Node runtime        |
| No Node port at all        | Leaves Node-only teams without an official story |

## References

- nene2-js ADR 0001 (client-only scope)
- NENE2 OpenAPI: https://github.com/hideyukiMORI/NENE2/blob/main/docs/openapi/openapi.yaml
