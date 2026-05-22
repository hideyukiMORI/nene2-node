# nene2-node

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D22%20LTS-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)

**NENE2-compatible API framework for Node.js** — a TypeScript port of the [NENE2](https://github.com/hideyukiMORI/NENE2) design philosophy, optimized for the Node ecosystem (not a wrapper around the PHP runtime).

| Sibling repo                                                 | Role                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| [NENE2](https://github.com/hideyukiMORI/NENE2)               | Canonical PHP framework and **OpenAPI contract** author            |
| [nene2-js](https://github.com/hideyukiMORI/nene2-js)         | Typed **HTTP client** for consumers (`@hideyukimori/nene2-client`) |
| [nene2-python](https://github.com/hideyukiMORI/nene2-python) | Python reference port (feature parity target)                      |
| **nene2-node** (this repo)                                   | Node.js framework (`@hideyukimori/nene2-framework`)                |

## What this repo is for

- HTTP runtime, routing, and middleware aligned with NENE2 behavior
- RFC 9457 Problem Details, validation errors, and auth patterns (Bearer, API key)
- UseCase → Repository → Handler layering (clean architecture)
- Example domains (health, ping, Note/Tag-style CRUD) as reference implementations
- OpenAPI contract **compatibility** with NENE2 `docs/openapi/openapi.yaml`
- Documentation and tooling friendly to international contributors and AI agents

## What this repo is not for

- Replacing or embedding the PHP NENE2 runtime
- Duplicating [nene-mcp](https://github.com/hideyukiMORI/nene-mcp) stdio MCP servers (integrate via HTTP/MCP boundaries instead)
- Thin API clients — use [nene2-js](https://github.com/hideyukiMORI/nene2-js)
- Application-specific business logic (belongs in your product repo)

See [docs/scope.md](docs/scope.md) for the full in/out matrix.

Engineering rules (strict, inherited from NENE2 / nene2-python): [docs/development/engineering-policy.md](docs/development/engineering-policy.md).

## Local layout (sibling of NENE2)

```text
../docker/
├── NENE2/          # PHP framework (contract source: docs/openapi/openapi.yaml)
├── nene2-js/       # TypeScript client only
├── nene2-node/     # this repository
├── nene2-python/   # Python port (parity reference)
└── nene-mcp/       # PHP MCP stdio library
```

```bash
cd /path/to/parent-of-NENE2
git clone git@github.com:hideyukiMORI/nene2-node.git
cd nene2-node
npm install
npm run check
npm run build
npm run dev
```

Optional contract path (default assumes sibling clone):

```bash
cp .env.example .env
# NENE2_NODE_OPENAPI_PATH=../NENE2/docs/openapi/openapi.yaml
```

## Status

**v0.1.0 released** — [GitHub Release](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.1.0) · npm `@hideyukimori/nene2-framework@0.1.0`

```bash
npm install @hideyukimori/nene2-framework @hono/node-server
```

New project guide: [docs/how-to/consumer-quickstart.md](docs/how-to/consumer-quickstart.md).

Hono runtime, middleware, `/examples/notes` CRUD, SQLite layer. Roadmap: [docs/roadmap.md](docs/roadmap.md).

## Contributing

Work is **GitHub Issue driven**. Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [docs/workflow.md](docs/workflow.md) before opening a PR.

AI agents: start at [AGENTS.md](AGENTS.md).

## Related projects

| Project                                                      | Role                                   |
| ------------------------------------------------------------ | -------------------------------------- |
| [NENE2](https://github.com/hideyukiMORI/NENE2)               | PHP API framework, OpenAPI authoring   |
| [nene2-js](https://github.com/hideyukiMORI/nene2-js)         | TypeScript client for NENE2 HTTP APIs  |
| [nene2-python](https://github.com/hideyukiMORI/nene2-python) | Python port — primary parity benchmark |
| [nene-mcp](https://github.com/hideyukiMORI/nene-mcp)         | Standalone PHP stdio MCP server        |

## License

MIT — see [LICENSE](LICENSE).
