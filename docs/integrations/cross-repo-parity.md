# Cross-repo parity checklist

When changing public API behavior in nene2-node, verify siblings.

| Check             | Repo                                                         | Action                                                             |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| OpenAPI contract  | [NENE2](https://github.com/hideyukiMORI/NENE2)               | Author or sync `docs/openapi/openapi.yaml` first for shared routes |
| Python reference  | [nene2-python](https://github.com/hideyukiMORI/nene2-python) | Compare module layout and Problem Details types                    |
| Contract fixtures | nene2-node                                                   | Update `tests/fixtures/contract/` + `openapi-pin.txt`              |
| Client            | [nene2-js](https://github.com/hideyukiMORI/nene2-js)         | Types/client examples if response shape changes                    |
| MCP stdio         | [nene-mcp](https://github.com/hideyukiMORI/nene-mcp)         | No duplicate — HTTP boundary only here                             |

## Node-specific (not duplicated)

- Hono middleware order — `middleware-pipeline.md`
- `node:sqlite` example repos — `database-layer.md`
- npm package `@hideyukimori/nene2-framework`

## References

- `relationship-to-nene2.md`
- `relationship-to-nene2-js.md`
- `mcp-boundary.md`
