# Consumer quickstart — new Node API project

Install the published framework and run a minimal server (FT67 sandbox validated).

## Prerequisites

- Node.js **22+**
- npm **10+**

## Steps

```bash
mkdir my-api && cd my-api
npm init -y
npm pkg set type=module
npm install @hideyukimori/nene2-framework @hono/node-server
npm install -D typescript tsx @types/node
```

`@hono/node-server` is required to call `serve()` — it is not re-exported from the framework package.

## Minimal server (`src/main.ts`)

```typescript
import { serve } from '@hono/node-server';
import { createApp, loadAppSettings } from '@hideyukimori/nene2-framework';

const { app } = createApp({ settings: loadAppSettings() });

app.get('/hello', (c) => c.json({ message: 'ok' }));

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`http://localhost:${String(info.port)}`);
});
```

```bash
npx tsx src/main.ts
curl -s http://localhost:3000/health
```

## Environment

Copy variables from [environment-variables.md](../development/environment-variables.md). Example:

```bash
NENE2_NODE_APP_ENV=local
NENE2_NODE_PORT=3000
# SQLite only in v0.1.x:
# NENE2_NODE_DATABASE_URL=file:./var/app.sqlite
```

**MySQL / PostgreSQL:** not supported yet — see [GitHub #37](https://github.com/hideyukiMORI/nene2-node/issues/37).

## Reference sandbox

Reproducible sibling repo path: `../nene2-node-FT/ft067-greenfield-install/` (not published on npm).

## References

- [local-development.md](../development/local-development.md)
- [package-exports.md](../development/package-exports.md)
