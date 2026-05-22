# Environment variables

**Single reader:** `loadAppSettings()` in `src/config/app-settings.ts`. Do not read `process.env` elsewhere in `src/`.

## Core

| Variable                           | Default                       | Purpose                           |
| ---------------------------------- | ----------------------------- | --------------------------------- |
| `NENE2_NODE_APP_ENV` / `APP_ENV`   | `local`                       | `local` \| `test` \| `production` |
| `NENE2_NODE_APP_DEBUG`             | `true` except production      | Verbose error detail when safe    |
| `NENE2_NODE_SERVICE_NAME`          | `NENE2`                       | Service label in responses        |
| `NENE2_NODE_FRAMEWORK_DESCRIPTION` | (see code)                    | Framework metadata                |
| `PROBLEM_DETAILS_BASE_URL`         | `https://nene2.dev/problems/` | Prefix for Problem `type` URIs    |

## Auth

| Variable                 | Default | Purpose                                      |
| ------------------------ | ------- | -------------------------------------------- |
| `NENE2_MACHINE_API_KEY`  | unset   | API key for `/machine/health`                |
| `NENE2_LOCAL_JWT_SECRET` | unset   | HS256 verification for `/examples/protected` |

## HTTP / middleware

| Variable                                   | Default           | Purpose                               |
| ------------------------------------------ | ----------------- | ------------------------------------- |
| `NENE2_NODE_REQUEST_MAX_BODY_BYTES`        | `1048576` (1 MiB) | Reject oversized bodies               |
| `NENE2_NODE_CORS_ORIGINS`                  | empty (no CORS)   | Comma-separated allowed origins       |
| `NENE2_NODE_CORS_ALLOW_CREDENTIALS`        | `false`           | `Access-Control-Allow-Credentials`    |
| `NENE2_NODE_THROTTLE_LIMIT`                | unset (disabled)  | Max requests per window; `0` disables |
| `NENE2_NODE_THROTTLE_WINDOW_SECONDS`       | `60`              | Throttle window                       |
| `NENE2_NODE_THROTTLE_EXCLUDE_PATHS`        | empty             | Comma-separated path prefixes to skip |
| `NENE2_NODE_REQUEST_LOGGING`               | on except `test`  | Structured request logs               |
| `NENE2_NODE_REQUEST_LOGGING_EXCLUDE_PATHS` | empty             | Paths to skip logging                 |

## Database

| Variable                  | Default | Purpose                                                                      |
| ------------------------- | ------- | ---------------------------------------------------------------------------- |
| `NENE2_NODE_DATABASE_URL` | unset   | SQLite file path (`file:…`); enables notes + tags SQLite repos and DB health |

## Production notes

See `production-deployment.md`. Throttle and CORS are the most common misconfiguration sources (FT#1 F-2).
