# Deploy checklist — app + real database

FT79 deliverable. Use with `@hideyukimori/nene2-framework@0.1.7+`.

## Pre-deploy

- [ ] `NENE2_NODE_APP_ENV=production` — no debug stack traces ([production-deployment.md](production-deployment.md))
- [ ] `NENE2_NODE_DATABASE_URL` — MySQL/PostgreSQL URL with TLS if required
- [ ] Pool sizes set: `NENE2_MYSQL_POOL_MAX` / `NENE2_POSTGRES_POOL_MAX` ([database-connection-pool.md](database-connection-pool.md))
- [ ] App-owned migrations applied **before** traffic (not `ensureExamplesSchema` for product tables)
- [ ] `MACHINE_API_KEY` rotated; JWT verifier not `LocalBearerTokenVerifier` in production
- [ ] `await createApp()` + register business routes; `bearerIncludePaths` for protected prefixes

## Runtime

- [ ] Process calls `await nene2.shutdown?.()` on SIGTERM
- [ ] `/health` monitored; 503 when DB degraded
- [ ] Request size limit appropriate for largest JSON body

## CI parity

- [ ] Mirror `mysql-integration` / `postgres-integration` jobs or run integration tests against staging DB URL

## Sandboxes

- Compose: `../nene2-node-FT/ft077-compose-stack/`
- Ports: [PORTS.md](../../../nene2-node-FT/PORTS.md)
