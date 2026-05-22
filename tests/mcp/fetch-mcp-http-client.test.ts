import { describe, expect, it, vi } from 'vitest';

import { FetchMcpHttpClient } from '../../src/mcp/mcp-http-client.js';

describe('FetchMcpHttpClient', () => {
  it('sends Bearer token when configured', async () => {
    const fetchImpl = vi.fn<typeof fetch>(() =>
      Promise.resolve(Response.json({ ok: true }, { status: 200 })),
    );

    const client = new FetchMcpHttpClient({ bearerToken: 'secret', fetchImpl });
    const response = await client.get('http://api.local', '/examples/ping');

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const init = fetchImpl.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer secret');
    expect(client.hasAuthentication()).toBe(true);
  });

  it('reports no authentication when unconfigured', () => {
    const client = new FetchMcpHttpClient();
    expect(client.hasAuthentication()).toBe(false);
  });
});
