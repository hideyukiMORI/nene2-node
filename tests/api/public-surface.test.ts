import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import * as api from '../../src/index.js';

const indexPath = fileURLToPath(new URL('../../src/index.ts', import.meta.url));

/**
 * Parse every name exported from `src/index.ts` — the single public entry point.
 * Returns a sorted list where type-only exports are prefixed `type `.
 *
 * Handles re-export blocks (`export { A, type B, C as D } from '...'`,
 * `export type { ... } from '...'`) and direct declarations
 * (`export const/function/class/type/interface/enum Name`).
 */
function parseExportedNames(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const names = new Set<string>();

  const braceRe = /export\s+(type\s+)?\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;
  while ((match = braceRe.exec(code)) !== null) {
    const blockTypeOnly = match[1] !== undefined;
    for (const raw of (match[2] ?? '').split(',')) {
      let item = raw.trim();
      if (item === '') continue;
      let typeOnly = blockTypeOnly;
      if (item.startsWith('type ')) {
        typeOnly = true;
        item = item.slice('type '.length).trim();
      }
      const asMatch = /\bas\s+(\w+)$/.exec(item);
      const name = asMatch ? (asMatch[1] as string) : item;
      names.add(`${typeOnly ? 'type ' : ''}${name}`);
    }
  }

  const declRe = /export\s+(?:declare\s+)?(const|function|class|type|interface|enum)\s+(\w+)/g;
  while ((match = declRe.exec(code)) !== null) {
    const kind = match[1] as string;
    const name = match[2] as string;
    const typeOnly = kind === 'type' || kind === 'interface';
    names.add(`${typeOnly ? 'type ' : ''}${name}`);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

const declared = parseExportedNames(readFileSync(indexPath, 'utf8'));

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
