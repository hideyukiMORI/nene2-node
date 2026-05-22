import { serve } from '@hono/node-server';

import { createApp } from '../app/create-app.js';
import { loadAppSettings } from '../config/app-settings.js';
import { registerProcessShutdown } from './register-process-shutdown.js';

const settings = loadAppSettings();
const { app, shutdown } = await createApp({ settings });

const port = Number.parseInt(process.env['NENE2_NODE_PORT'] ?? '3000', 10);
const listenPort = Number.isFinite(port) && port > 0 ? port : 3000;

registerProcessShutdown(shutdown);

serve(
  {
    fetch: app.fetch,
    port: listenPort,
  },
  (info) => {
    console.log(`nene2-node dev server: http://localhost:${String(info.port)}`);
    console.log('  GET /  GET /health  GET /examples/ping');
  },
);
