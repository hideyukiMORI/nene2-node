# MCP boundary (nene2-node)

## Scope

| Component      | Role                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| **NENE2**      | MCP catalog authoring, PHP `LocalMcpServer`, OpenAPI                          |
| **nene-mcp**   | PHP **stdio** MCP server (framework-agnostic)                                 |
| **nene2-node** | `FetchMcpHttpClient` — HTTP transport to call API tools from Node automations |

nene2-node does **not** ship a stdio MCP server. Use [nene-mcp](https://github.com/hideyukiMORI/nene-mcp) or NENE2's PHP local server for IDE integration.

## Node HTTP client

`FetchMcpHttpClient` mirrors NENE2 `LocalMcpHttpClientInterface`:

- `get` / `post` / `put` / `patch` / `delete` against a base URL
- Optional Bearer or API key headers
- `hasAuthentication()` for write-tool gating (parity with NENE2 MCP docs)

Tool catalog JSON and stdio protocol stay in NENE2 / nene-mcp; this repo only documents the HTTP hook.

## Testing

- `tests/mcp/fetch-mcp-http-client.test.ts` — mock `fetch`, auth headers, error mapping.
- Do not point integration tests at production URLs; use local `createApp()` + `npm run dev` base URL.

## Security notes

- Treat MCP client credentials like API keys — env only, never fixtures.
- `hasAuthentication()` should gate write tools in automations (parity with NENE2 MCP docs).
- **SSRF:** validate `baseUrl` before `FetchMcpHttpClient` calls — see `node-security-practices.md`.
- Do not pass end-user-supplied URLs into the client without an allowlist.

## Example

```typescript
import { FetchMcpHttpClient } from '@hideyukimori/nene2-framework';

const client = new FetchMcpHttpClient({
  bearerToken: process.env['NENE2_LOCAL_JWT_TOKEN'],
});

const ping = await client.get('http://localhost:3000', '/examples/ping');
```
