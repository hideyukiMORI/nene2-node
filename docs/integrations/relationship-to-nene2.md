# Relationship to NENE2

## Roles

| Repository       | Responsibility                                                                      |
| ---------------- | ----------------------------------------------------------------------------------- |
| **NENE2**        | PHP HTTP runtime, OpenAPI **authoring**, MCP catalog, examples, `frontend/` starter |
| **nene2-node**   | Node.js framework port — serves compatible JSON APIs                                |
| **nene2-js**     | TypeScript **client** for any NENE2-compatible server (PHP or Node)                 |
| **nene2-python** | Python port — primary **parity benchmark** for nene2-node                           |
| **nene-mcp**     | PHP stdio MCP server (framework-agnostic catalog format)                            |

## Contract flow

1. NENE2 adds or changes an endpoint → updates `docs/openapi/openapi.yaml` and tests.
2. nene2-node opens an Issue to implement or adjust runtime behavior (may depend on NENE2 release tag).
3. nene2-js opens an Issue to sync typed client (can target PHP or Node servers sharing the contract).
4. Application projects upgrade packages when ready.

## Local development paths

Default sibling layout:

```text
../NENE2/           # git clone — contract author
../nene2-node/      # this repo
../nene2-js/        # client
../nene2-python/    # parity reference
```

Environment variables (this repo):

| Variable                  | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `NENE2_NODE_OPENAPI_PATH` | Path to `openapi.yaml` (default: `../NENE2/docs/openapi/openapi.yaml`) |
| `NENE2_NODE_PORT`         | Dev server port (default: `3000` when implemented)                     |
| `NENE2_NODE_DATABASE_URL` | DB connection for adapters (when implemented)                          |

NENE2 machine client variables (`NENE2_MACHINE_API_KEY`, `NENE2_LOCAL_JWT_SECRET`) follow NENE2 documentation; framework wiring must not log secret values.

## What not to copy into nene2-node

- PHP `src/` framework code verbatim (port patterns, do not transliterate mechanically)
- `tools/local-mcp-server.php` — use nene-mcp or NENE2 MCP docs
- Phinx migrations and PHP Docker Compose as the Node default (Node-specific compose may come later)

## What to reuse conceptually

- Layering: Handler → UseCase → Repository
- Problem Details types and status code mapping
- Auth middleware ordering and composite auth model
- Example Note/Tag boundaries (reference only, not stable public API)

## References

- NENE2 OpenAPI: https://github.com/hideyukiMORI/NENE2/blob/main/docs/openapi/openapi.yaml
- NENE2 AGENTS.md: https://github.com/hideyukiMORI/NENE2/blob/main/AGENTS.md
- nene2-python: https://github.com/hideyukiMORI/nene2-python
