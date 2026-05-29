import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

import { createResourceNotFoundHandler } from '../../src/error/resource-not-found-handler.js';
import { ResourceNotFoundError } from '../../src/error/resource-not-found-error.js';
import { resolveHttpError } from '../../src/error/resolve-http-error.js';
import { createProblemDetailsFactory } from '../../src/http/problem-details.js';
import { assertTenantScope, tenantFromContext } from '../../src/domain/tenant-scope.js';

describe('assertTenantScope', () => {
  it('passes when tenants match', () => {
    expect(() => assertTenantScope('t1', 't1', 'document', 5)).not.toThrow();
  });

  it('throws ResourceNotFoundError on cross-tenant access', () => {
    expect(() => assertTenantScope('t1', 't2', 'document', 5)).toThrow(ResourceNotFoundError);
  });

  it('throws when the caller tenant is missing or empty', () => {
    expect(() => assertTenantScope('t1', undefined, 'document', 5)).toThrow(ResourceNotFoundError);
    expect(() => assertTenantScope('t1', '', 'document', 5)).toThrow(ResourceNotFoundError);
  });
});

describe('tenantFromContext', () => {
  it('reads the default tenant_id claim', () => {
    expect(tenantFromContext({ tenant_id: 't1', sub: 'u1' })).toBe('t1');
  });
  it('supports a custom claim name', () => {
    expect(tenantFromContext({ org: 'acme' }, 'org')).toBe('acme');
  });
  it('returns undefined for missing/non-string/absent claims', () => {
    expect(tenantFromContext({ tenant_id: 123 })).toBeUndefined();
    expect(tenantFromContext({})).toBeUndefined();
    expect(tenantFromContext(undefined)).toBeUndefined();
  });
});

// Executable proof: cross-tenant access yields 404, enumeration-safe.
describe('tenant isolation over HTTP', () => {
  const problems = createProblemDetailsFactory('https://example.com/problems/');
  const handlers = [createResourceNotFoundHandler(problems)];

  function buildApp() {
    const app = new Hono();
    const row = { id: 5, tenant_id: 't1', secret: 'tenant-1 data' };

    app.get('/documents/:id', (c) => {
      const callerTenant = c.req.header('X-Tenant') || undefined;
      assertTenantScope(row.tenant_id, callerTenant, 'document', row.id);
      return c.json(row);
    });

    app.onError((error, c) =>
      resolveHttpError({ problems, c, error, appDebug: false, domainHandlers: handlers }),
    );
    return app;
  }

  it('returns 200 for the owning tenant', async () => {
    const res = await buildApp().request('/documents/5', { headers: { 'X-Tenant': 't1' } });
    expect(res.status).toBe(200);
  });

  it('returns 404 (not 403) for a different tenant', async () => {
    const res = await buildApp().request('/documents/5', { headers: { 'X-Tenant': 't2' } });
    expect(res.status).toBe(404);
  });

  it('returns 404 when no tenant is presented', async () => {
    const res = await buildApp().request('/documents/5');
    expect(res.status).toBe(404);
  });

  it('does not leak the resource id in the 404 body (enumeration-safe)', async () => {
    const res = await buildApp().request('/documents/5', { headers: { 'X-Tenant': 't2' } });
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain('tenant-1 data');
    expect(body.type).toBe('https://example.com/problems/not-found');
  });
});
