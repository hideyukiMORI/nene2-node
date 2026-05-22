import { afterEach, describe, expect, it } from 'vitest';

import { readPoolMaxEnv } from '../../src/database/read-pool-max-env.js';

const VAR = 'NENE2_TEST_POOL_MAX';

describe('readPoolMaxEnv', () => {
  afterEach(() => {
    delete process.env[VAR];
  });

  it('returns fallback when unset', () => {
    expect(readPoolMaxEnv(VAR, 10)).toBe(10);
  });

  it('parses valid integer', () => {
    process.env[VAR] = '25';
    expect(readPoolMaxEnv(VAR, 10)).toBe(25);
  });

  it('returns fallback for invalid values', () => {
    process.env[VAR] = '0';
    expect(readPoolMaxEnv(VAR, 10)).toBe(10);
    process.env[VAR] = 'nope';
    expect(readPoolMaxEnv(VAR, 10)).toBe(10);
  });
});
