import { describe, expect, it } from 'vitest';

import * as api from '../../src/index.js';
import { publicSurface } from './surface.js';

const declared = publicSurface();

describe('public API surface', () => {
  // A change here is a deliberate public-API change: review the diff, then
  // regenerate with `npx vitest run -u tests/api/public-surface.test.ts`.
  it('matches the committed snapshot', () => {
    expect(declared).toMatchSnapshot();
  });

  it('every declared value export is reachable at runtime', () => {
    const runtime = new Set(Object.keys(api));
    const missing = declared
      .filter((name) => !name.startsWith('type '))
      .filter((name) => !runtime.has(name));
    expect(missing).toEqual([]);
  });

  it('exposes no unexpected runtime exports beyond those declared in index.ts', () => {
    const declaredValues = new Set(declared.filter((n) => !n.startsWith('type ')));
    const extra = Object.keys(api).filter((name) => !declaredValues.has(name));
    expect(extra).toEqual([]);
  });
});
