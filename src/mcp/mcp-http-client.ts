import type { McpHttpResponse } from './mcp-http-response.js';

/**
 * HTTP transport for MCP tool calls against a NENE2-compatible API.
 * Aligns with NENE2 `LocalMcpHttpClientInterface` — not the nene-mcp stdio server.
 */
export interface McpHttpClient {
  get(baseUrl: string, path: string): Promise<McpHttpResponse>;
  post(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse>;
  put(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse>;
  patch(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse>;
  delete(baseUrl: string, path: string): Promise<McpHttpResponse>;
  hasAuthentication(): boolean;
}

export interface FetchMcpHttpClientOptions {
  readonly bearerToken?: string;
  readonly apiKey?: string;
  readonly apiKeyHeader?: string;
  readonly fetchImpl?: typeof fetch;
}

function headersToRecord(headers: Headers): Readonly<Record<string, string>> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

async function toMcpResponse(response: Response): Promise<McpHttpResponse> {
  return {
    status: response.status,
    body: await response.text(),
    headers: headersToRecord(response.headers),
  };
}

export class FetchMcpHttpClient implements McpHttpClient {
  private readonly fetchImpl: typeof fetch;
  private readonly bearerToken: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly apiKeyHeader: string;

  constructor(options: FetchMcpHttpClientOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.bearerToken = options.bearerToken;
    this.apiKey = options.apiKey;
    this.apiKeyHeader = options.apiKeyHeader ?? 'X-NENE2-API-Key';
  }

  hasAuthentication(): boolean {
    return this.bearerToken !== undefined || this.apiKey !== undefined;
  }

  get(baseUrl: string, path: string): Promise<McpHttpResponse> {
    return this.request('GET', baseUrl, path);
  }

  post(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse> {
    return this.request('POST', baseUrl, path, body);
  }

  put(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse> {
    return this.request('PUT', baseUrl, path, body);
  }

  patch(
    baseUrl: string,
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse> {
    return this.request('PATCH', baseUrl, path, body);
  }

  delete(baseUrl: string, path: string): Promise<McpHttpResponse> {
    return this.request('DELETE', baseUrl, path);
  }

  private async request(
    method: string,
    baseUrl: string,
    path: string,
    body?: Readonly<Record<string, unknown>>,
  ): Promise<McpHttpResponse> {
    const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.bearerToken !== undefined) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    if (this.apiKey !== undefined) {
      headers[this.apiKeyHeader] = this.apiKey;
    }

    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    const response = await this.fetchImpl(url, init);
    return toMcpResponse(response);
  }
}
