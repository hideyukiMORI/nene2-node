# Local development

## Quick start

```bash
npm install
npm run check
npm run dev
```

Default server: `http://localhost:3000` (override with `NENE2_NODE_PORT`).

## Endpoints to try

| Method | Path                                | Auth                                  |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/`                                 | —                                     |
| GET    | `/health`                           | —                                     |
| GET    | `/examples/ping`                    | —                                     |
| GET    | `/examples/protected`               | Bearer (`NENE2_LOCAL_JWT_SECRET`)     |
| GET    | `/machine/health`                   | `X-Api-Key` (`NENE2_MACHINE_API_KEY`) |
| CRUD   | `/examples/notes`, `/examples/tags` | — (public in v0.1.x)                  |

## SQLite examples

```bash
export NENE2_NODE_DATABASE_URL=file:./var/dev.sqlite
npm run dev
```

Creates notes + tags tables on startup via `ensureExamplesSchema()`.

## OpenAPI sibling

Clone [NENE2](https://github.com/hideyukiMORI/NENE2) as `../NENE2` or set `NENE2_NODE_OPENAPI_PATH` for `resolveOpenApiPath()`.

## References

- `environment-variables.md`
- `production-deployment.md` (contrast — not for prod defaults)
