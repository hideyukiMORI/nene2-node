# CI PostgreSQL service (FT82)

Job `postgres-integration` in `.github/workflows/ci.yml` runs `tests/database/postgres-integration.test.ts` against PostgreSQL 16.

## Local optional run

```bash
# Example: reuse ft069 on host port 25433
export NENE2_NODE_TEST_POSTGRES_URL='postgresql://ft069:ft069_pass@127.0.0.1:25433/ft069_app'
npm run test -- tests/database/postgres-integration.test.ts
```

Default `npm run check` skips this test without the env var.
