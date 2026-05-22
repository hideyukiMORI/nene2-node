import { describe, expect, it } from 'vitest';
import { NENE2_FRAMEWORK_PACKAGE } from '../src/index.js';

describe('bootstrap', () => {
  it('exposes package identifier constant', () => {
    expect(NENE2_FRAMEWORK_PACKAGE).toBe('@hideyukimori/nene2-framework');
  });
});
