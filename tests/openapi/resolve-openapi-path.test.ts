import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_OPENAPI_RELATIVE,
  openApiFileExists,
  resolveOpenApiPath,
} from '../../src/openapi/resolve-openapi-path.js';

describe('resolveOpenApiPath', () => {
  it('uses NENE2_NODE_OPENAPI_PATH when set', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nene2-openapi-'));
    const file = join(dir, 'openapi.yaml');
    writeFileSync(file, 'openapi: 3.0.0');
    expect(resolveOpenApiPath({ NENE2_NODE_OPENAPI_PATH: file })).toBe(file);
  });

  it('falls back to default relative path under cwd', () => {
    const resolved = resolveOpenApiPath({});
    expect(resolved).toContain('openapi.yaml');
    expect(resolved).toContain(DEFAULT_OPENAPI_RELATIVE.replace(/^\.\.\//, ''));
  });
});

describe('openApiFileExists', () => {
  it('returns true for existing files and false otherwise', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nene2-openapi-'));
    const file = join(dir, 'exists.yaml');
    writeFileSync(file, 'x');
    expect(openApiFileExists(file)).toBe(true);
    expect(openApiFileExists(join(dir, 'missing.yaml'))).toBe(false);
  });
});
