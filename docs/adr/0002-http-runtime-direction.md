# ADR 0002 — HTTP Runtime Direction (Draft)

**Status:** Draft  
**Date:** 2026-05-22  
**Issue:** (to be filed — finalize in Phase 1)

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

**Deferred** until Phase 1 Issue completes spike and updates this ADR to **Accepted** with chosen version pin.

## Consequences (when accepted)

- Document middleware registration order mirroring NENE2
- Provide test utilities to call handlers without listening on a port where possible
- Revisit serverless/edge packaging in a later ADR if needed
