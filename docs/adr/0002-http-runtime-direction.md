# ADR 0002 — HTTP Runtime Direction (Draft)

**Status:** Accepted  
**Date:** 2026-05-22  
**Issue:** Phase 1 runtime (#7)

---

## Context

NENE2 uses PSR-7 / PSR-15 / PSR-17. nene2-python uses FastAPI + Starlette middleware. nene2-node needs a Node-idiomatic stack that supports:

- middleware ordering comparable to NENE2
- JSON APIs and Problem Details
- testability without binding domain code to a vendor
- reasonable cold start for serverless (future consideration)

## Options under evaluation

| Option                        | Pros                                                         | Cons                                                      |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| **Hono**                      | Lightweight, modern, good middleware, works on Node and edge | Smaller ecosystem than Express                            |
| **Fastify**                   | Mature plugins, performance, schema validation hooks         | Heavier mental model for minimal APIs                     |
| **Node `http` + thin router** | Maximum control, few deps                                    | More boilerplate for middleware                           |
| **Express**                   | Familiar                                                     | Legacy patterns; not the default for new NENE2-style code |

## Tentative direction

Start Phase 1 with **Hono on Node** unless an Issue documents a blocking requirement for Fastify (e.g. specific plugin ecosystem).

Domain and UseCase layers must not import Hono types — only Handler/adapter modules may.

## Decision

Adopt **Hono 4.x on Node.js** (`hono` package) with:

- Composition root in `src/app/create-app.ts` (explicit wiring, no service locator).
- Domain and UseCase modules must not import `hono` types.
- In-process tests via `app.request()` (Vitest).

Pinned at install time in `package-lock.json` (Phase 1: `hono@^4`).

## Consequences

- Document middleware registration order mirroring NENE2
- Provide test utilities to call handlers without listening on a port where possible
- Revisit serverless/edge packaging in a later ADR if needed
