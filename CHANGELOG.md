# Changelog

All notable changes to `@hideyukimori/nene2-framework` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

## [0.1.0] - Unreleased

### Added

- Hono runtime (`createApp`) with RFC 9457 Problem Details
- System routes: `/`, `/health`, `/examples/ping`, `/machine/health`, `/examples/protected`
- Domain exception registry, validation (`validation-failed`), Bearer JWT (HS256)
- Throttle (429), CORS (explicit origins), JSON request logging
- Example Note CRUD at `/examples/notes`
- Database layer: `DatabaseQueryExecutor`, `SqliteTransactionManager`, health probe
- `FetchMcpHttpClient` for MCP HTTP tool calls (not stdio MCP)
- OpenAPI contract tests and `npm run dev`

### Notes

- OpenAPI contract source: [NENE2](https://github.com/hideyukiMORI/NENE2) `docs/openapi/openapi.yaml`
- Parity reference: [nene2-python](https://github.com/hideyukiMORI/nene2-python)
