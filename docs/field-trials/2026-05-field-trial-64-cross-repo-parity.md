# Field trial report — FT64: Cross-repo parity checklist

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** required

## Validated

- Parity docs exist for NENE2, nene2-python, nene2-js, nene-mcp boundaries.

## Doc updates (docs-first)

- **New:** `docs/integrations/cross-repo-parity.md`
- `relationship-to-nene2-js.md` — local dev URL note.

## Adversarial review (FT64 % 4 = 0)

| Probe                                  | Outcome                                             |
| -------------------------------------- | --------------------------------------------------- |
| Change Node-only route without OpenAPI | caught by process — OpenAPI-first rule in checklist |
| Duplicate MCP stdio                    | pass — explicit non-goal                            |

**Resilience:** acceptable.

## Follow-up

- None.
