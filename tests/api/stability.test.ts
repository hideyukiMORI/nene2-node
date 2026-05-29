import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { publicSurface } from './surface.js';

const stabilityPath = fileURLToPath(new URL('../../docs/STABILITY.md', import.meta.url));

/** Names listed under the "## Experimental" section of STABILITY.md (backtick-wrapped). */
function parseExperimental(source: string): string[] {
  const start = source.indexOf('## Experimental');
  if (start === -1) return [];
  const rest = source.slice(start + '## Experimental'.length);
  const end = rest.indexOf('\n## ');
  const section = end === -1 ? rest : rest.slice(0, end);
  const names = new Set<string>();
  for (const m of section.matchAll(/^- `([^`]+)`/gm)) {
    names.add(m[1] as string);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

const surface = new Set(publicSurface());
const experimental = parseExperimental(readFileSync(stabilityPath, 'utf8'));

describe('API stability classification', () => {
  it('lists at least one experimental export', () => {
    expect(experimental.length).toBeGreaterThan(0);
  });

  it('every Experimental entry is a real public export (no stale markers)', () => {
    const stale = experimental.filter((name) => !surface.has(name));
    expect(stale).toEqual([]);
  });

  it('classification is unambiguous (no name listed twice)', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const name of experimental) {
      if (seen.has(name)) dupes.push(name);
      seen.add(name);
    }
    expect(dupes).toEqual([]);
  });
});
