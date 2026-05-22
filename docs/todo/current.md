# Current work

Last updated: 2026-05-22 (repository bootstrap)

## Active

- [x] Bootstrap at `/home/xi/docker/nene2-node` (sibling of `NENE2`, `nene2-js`)
- [x] GitHub repo https://github.com/hideyukiMORI/nene2-node created and `main` pushed
- [x] `npm run check` passes locally

## Next Issues (to create on GitHub)

| #   | Title                                                         |
| --- | ------------------------------------------------------------- |
| TBD | Finalize HTTP runtime (ADR 0002) and add minimal server entry |
| TBD | Problem Details factory (RFC 9457 NENE2 subset)               |
| TBD | Implement `GET /health` and `GET /examples/ping` with tests   |
| TBD | OpenAPI pin policy and contract test harness                  |

## Handoff

- Contract source: `../NENE2/docs/openapi/openapi.yaml`
- Parity reference: `../nene2-python/src/nene2/`
- Client library (consumers): `../nene2-js` — do not duplicate here
- MCP stdio: `../nene-mcp` — integrate via documented HTTP/MCP boundaries only
